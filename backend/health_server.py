#!/usr/bin/env python3
"""Small stdlib backend for health checks and the moderated guestbook."""
from __future__ import annotations

import hashlib
import hmac
import json
import os
import re
import sqlite3
import socket
import threading
import time
import uuid
from datetime import datetime, timezone
from http import cookies
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import parse_qs, urlparse

HOST = "127.0.0.1"
PORT = int(os.environ.get("BACKEND_PORT", "8000"))
DB_PATH = os.environ.get("GUESTBOOK_DB_PATH", os.path.join(os.path.dirname(__file__), "data", "guestbook.sqlite3"))
SECRET = os.environ.get("GUESTBOOK_SECRET", "").strip()
ADMIN_TOKEN = os.environ.get("GUESTBOOK_ADMIN_TOKEN", "").strip()
if len(SECRET) < 32 or len(ADMIN_TOKEN) < 32:
    raise RuntimeError("GUESTBOOK_SECRET and GUESTBOOK_ADMIN_TOKEN must be set to random values of at least 32 characters")
ADMIN_HEADER = "X-Guestbook-Admin"
DAILY_LIMIT = 2
PAGE_SIZE = 8
COOKIE_NAME = "guestbook_account"
CATEGORIES = {"hello", "question", "idea", "合作", "友站"}
URL_PATTERN = re.compile(r"https?://[^\s<>\"']+", re.IGNORECASE)
HARD_BLOCK_PATTERN = re.compile(
    r"(?:博彩|赌博|赌场|娱乐城|下注|色情|成人视频|成人影片|裸聊|淫秽|porn|casino|betting|\bbet\b|sexcam|\.xxx(?:/|$))",
    re.IGNORECASE,
)
RATE_LIMIT_LOCK = threading.Lock()
RATE_LIMITS: dict[tuple[str, str], tuple[float, int]] = {}
RATE_WINDOW_SECONDS = 60.0
RATE_MAX = {"GET": 120, "POST": 6, "PATCH": 20}


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat(timespec="seconds").replace("+00:00", "Z")


def day_key() -> str:
    from zoneinfo import ZoneInfo
    return datetime.now(ZoneInfo("Asia/Shanghai")).date().isoformat()


def h(value: str) -> str:
    return hmac.new(SECRET.encode(), value.encode(), hashlib.sha256).hexdigest()


def normalize_ip(value: str) -> str:
    return (value or "unknown").strip().split(",", 1)[0].strip()[:128] or "unknown"


def json_bytes(value: object) -> bytes:
    return json.dumps(value, ensure_ascii=False, separators=(",", ":")).encode("utf-8")


def safe_text(value: object, limit: int) -> str:
    return value.strip().replace("\r\n", "\n")[:limit] if isinstance(value, str) else ""


def extract_urls(value: str) -> list[str]:
    return URL_PATTERN.findall(value)[:8]


def inspect_links(urls: list[str]) -> tuple[list[str], list[str]]:
    """Return (flags, hard_blocks). DBL is advisory: the owner still reviews it."""
    flags: list[str] = []
    hard_blocks: list[str] = []
    for raw_url in urls:
        try:
            parsed = urlparse(raw_url)
            host = (parsed.hostname or "").lower().rstrip(".")
        except ValueError:
            flags.append("malformed_url")
            continue
        if not host:
            flags.append("missing_host")
            continue
        if HARD_BLOCK_PATTERN.search(raw_url.lower()):
            hard_blocks.append(host)
            continue
        # Spamhaus DBL is a domain-only DNS blocklist. It is used as a review
        # signal rather than an automatic rejection to reduce false positives.
        if re.fullmatch(r"\d{1,3}(?:\.\d{1,3}){3}", host):
            continue
        try:
            socket.setdefaulttimeout(1.0)
            answer = socket.gethostbyname(f"{host}.dbl.spamhaus.org")
            if answer.startswith("127.0.1."):
                flags.append("spamhaus_dbl")
        except (socket.gaierror, OSError):
            pass
    if urls:
        flags.append("link_requires_review")
    return sorted(set(flags)), sorted(set(hard_blocks))


def db_connect() -> sqlite3.Connection:
    os.makedirs(os.path.dirname(DB_PATH) or ".", exist_ok=True)
    connection = sqlite3.connect(DB_PATH, timeout=10, isolation_level=None)
    connection.row_factory = sqlite3.Row
    connection.execute("PRAGMA journal_mode=WAL")
    connection.execute("PRAGMA foreign_keys=ON")
    connection.execute("PRAGMA busy_timeout=10000")
    connection.executescript(
        """
        CREATE TABLE IF NOT EXISTS accounts (
          id TEXT PRIMARY KEY,
          nickname TEXT NOT NULL,
          created_at TEXT NOT NULL,
          ip_hash TEXT NOT NULL UNIQUE,
          fingerprint_hash TEXT UNIQUE
        );
        CREATE TABLE IF NOT EXISTS messages (
          id TEXT PRIMARY KEY,
          account_id TEXT NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
          nickname TEXT NOT NULL,
          category TEXT NOT NULL,
          body TEXT NOT NULL,
          created_at TEXT NOT NULL,
          day_key TEXT NOT NULL,
          status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','approved','rejected')),
          link_urls TEXT NOT NULL DEFAULT '[]',
          link_flags TEXT NOT NULL DEFAULT '[]',
          link_review_required INTEGER NOT NULL DEFAULT 0
        );
        CREATE INDEX IF NOT EXISTS messages_public_idx ON messages(status, created_at);
        CREATE INDEX IF NOT EXISTS messages_filter_idx ON messages(status, category, created_at);
        CREATE TABLE IF NOT EXISTS daily_limits (
          account_id TEXT NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
          day_key TEXT NOT NULL,
          count INTEGER NOT NULL DEFAULT 0,
          PRIMARY KEY(account_id, day_key)
        );
        CREATE TABLE IF NOT EXISTS moderation_audit (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          message_id TEXT NOT NULL,
          next_status TEXT NOT NULL CHECK(next_status IN ('approved','rejected')),
          reviewer_ip_hash TEXT NOT NULL,
          created_at TEXT NOT NULL
        );
        """
    )
    for statement in (
        "ALTER TABLE messages ADD COLUMN link_urls TEXT NOT NULL DEFAULT '[]'",
        "ALTER TABLE messages ADD COLUMN link_flags TEXT NOT NULL DEFAULT '[]'",
        "ALTER TABLE messages ADD COLUMN link_review_required INTEGER NOT NULL DEFAULT 0",
    ):
        try:
            connection.execute(statement)
        except sqlite3.OperationalError as exc:
            if "duplicate column name" not in str(exc):
                raise
    return connection


def signed_account(account_id: str) -> str:
    return f"{account_id}.{h('account:' + account_id)}"


def verify_account(raw: str | None) -> str | None:
    if not raw or "." not in raw:
        return None
    account_id, signature = raw.split(".", 1)
    if not account_id or not hmac.compare_digest(signature, h("account:" + account_id)):
        return None
    return account_id


def public_row(row: sqlite3.Row) -> dict[str, object]:
    return {"id": row["id"], "name": row["nickname"], "category": row["category"], "message": row["body"], "createdAt": row["created_at"]}


class Handler(BaseHTTPRequestHandler):
    server_version = "SelfsiteBackend/2"

    def setup(self) -> None:
        super().setup()
        self.connection.settimeout(10)

    def _rate_limited(self, bucket: str) -> bool:
        limit = RATE_MAX[bucket]
        now = time.monotonic()
        key = (bucket, self._client_ip())
        with RATE_LIMIT_LOCK:
            started, count = RATE_LIMITS.get(key, (now, 0))
            if now - started >= RATE_WINDOW_SECONDS:
                started, count = now, 0
            count += 1
            RATE_LIMITS[key] = (started, count)
            if len(RATE_LIMITS) > 4096:
                cutoff = now - RATE_WINDOW_SECONDS
                for old_key, (old_started, _) in list(RATE_LIMITS.items()):
                    if old_started < cutoff:
                        RATE_LIMITS.pop(old_key, None)
            return count > limit

    def _headers(self, status: int, length: int, content_type: str = "application/json") -> None:
        self.send_response(status)
        self.send_header("Content-Type", content_type)
        self.send_header("Content-Length", str(length))
        self.send_header("Cache-Control", "no-store")
        self.send_header("Access-Control-Allow-Origin", "https://zifeiyu.cc")
        self.send_header("Vary", "Origin")
        self.end_headers()

    def _send(self, value: object, status: int = 200, account_id: str | None = None) -> None:
        payload = json_bytes(value)
        self._headers(status, len(payload))
        if account_id:
            cookie = cookies.SimpleCookie()
            cookie[COOKIE_NAME] = signed_account(account_id)
            cookie[COOKIE_NAME]["path"] = "/"
            cookie[COOKIE_NAME]["max-age"] = str(60 * 60 * 24 * 365)
            cookie[COOKIE_NAME]["httponly"] = True
            cookie[COOKIE_NAME]["samesite"] = "Lax"
            if self.headers.get("X-Forwarded-Proto", "http") == "https":
                cookie[COOKIE_NAME]["secure"] = True
            # Headers must be sent before body; this branch is handled by _send_with_cookie.
        self.wfile.write(payload)

    def _send_with_cookie(self, value: object, status: int, account_id: str) -> None:
        payload = json_bytes(value)
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(payload)))
        self.send_header("Cache-Control", "no-store")
        self.send_header("Set-Cookie", self._cookie_header(account_id))
        self.end_headers()
        self.wfile.write(payload)

    def _cookie_header(self, account_id: str) -> str:
        cookie = cookies.SimpleCookie()
        cookie[COOKIE_NAME] = signed_account(account_id)
        cookie[COOKIE_NAME]["path"] = "/"
        cookie[COOKIE_NAME]["max-age"] = str(60 * 60 * 24 * 365)
        cookie[COOKIE_NAME]["httponly"] = True
        cookie[COOKIE_NAME]["samesite"] = "Lax"
        if self.headers.get("X-Forwarded-Proto", "http") == "https":
            cookie[COOKIE_NAME]["secure"] = True
        return cookie[COOKIE_NAME].OutputString()

    def _error(self, message: str, status: int = 400, account_id: str | None = None) -> None:
        if account_id:
            self._send_with_cookie({"error": message}, status, account_id)
        else:
            self._send({"error": message}, status)

    def _account_id(self) -> str | None:
        parsed = cookies.SimpleCookie(self.headers.get("Cookie", ""))
        return verify_account(parsed.get(COOKIE_NAME).value if parsed.get(COOKIE_NAME) else None)

    def _client_ip(self) -> str:
        # This service is loopback-only; the reverse proxy is the trusted header source.
        return normalize_ip(self.headers.get("X-Real-IP") or self.headers.get("X-Forwarded-For") or self.client_address[0])

    def _read_json(self) -> dict[str, object]:
        length = int(self.headers.get("Content-Length", "0") or 0)
        if length > 32_000:
            raise ValueError("留言内容过大，请精简后再提交。")
        data = json.loads(self.rfile.read(length) or b"{}")
        if not isinstance(data, dict):
            raise ValueError("请求格式不正确。")
        return data

    def do_OPTIONS(self) -> None:
        self.send_response(204)
        self.send_header("Access-Control-Allow-Origin", "https://zifeiyu.cc")
        self.send_header("Access-Control-Allow-Methods", "GET,POST,PATCH,OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type,X-Guestbook-Admin")
        self.send_header("Access-Control-Allow-Credentials", "true")
        self.end_headers()

    def do_GET(self) -> None:
        parsed = urlparse(self.path)
        if parsed.path in ("/health", "/api/v1/health"):
            self._send({"status": "ok", "service": "backend", "version": "v2"})
            return
        if parsed.path == "/api/v1/guestbook":
            if self._rate_limited("GET"):
                self._error("请求过于频繁，请稍后再试。", 429); return
            self._list_public(parse_qs(parsed.query))
            return
        if parsed.path == "/api/v1/guestbook/review":
            self._review_list(parse_qs(parsed.query))
            return
        self._error("Not found", 404)

    def _list_public(self, params: dict[str, list[str]]) -> None:
        query = safe_text(params.get("q", [""])[0], 80).lower()
        category = params.get("category", ["all"])[0]
        sort = "ASC" if params.get("sort", ["latest"])[0] == "oldest" else "DESC"
        try:
            page = min(1000, max(1, int(params.get("page", ["1"])[0])))
        except ValueError:
            page = 1
        account_id = self._account_id()
        connection = db_connect()
        try:
            filters = ["status='approved'"]
            args: list[object] = []
            if category in CATEGORIES:
                filters.append("category=?"); args.append(category)
            if query:
                filters.append("(lower(nickname) LIKE ? OR lower(body) LIKE ?)")
                args.extend([f"%{query}%", f"%{query}%"])
            where = " AND ".join(filters)
            total = connection.execute(f"SELECT COUNT(*) FROM messages WHERE {where}", args).fetchone()[0]
            args_page = args + [PAGE_SIZE, (page - 1) * PAGE_SIZE]
            rows = connection.execute(f"SELECT id,nickname,category,body,created_at FROM messages WHERE {where} ORDER BY created_at {sort} LIMIT ? OFFSET ?", args_page).fetchall()
            used = 0
            if account_id:
                row = connection.execute("SELECT count FROM daily_limits WHERE account_id=? AND day_key=?", (account_id, day_key())).fetchone()
                used = int(row[0]) if row else 0
            self._send({"items": [public_row(row) for row in rows], "page": page, "pageSize": PAGE_SIZE, "total": total, "hasNext": page * PAGE_SIZE < total, "remainingToday": max(0, DAILY_LIMIT - used), "moderation": "approved-only"})
        finally:
            connection.close()

    def _review_list(self, params: dict[str, list[str]]) -> None:
        if self._rate_limited("GET"):
            self._error("请求过于频繁，请稍后再试。", 429); return
        if not hmac.compare_digest(self.headers.get(ADMIN_HEADER, ""), ADMIN_TOKEN):
            self._error("Unauthorized", 401); return
        status = params.get("status", ["pending"])[0]
        if status not in ("pending", "approved", "rejected"):
            status = "pending"
        connection = db_connect()
        try:
            rows = connection.execute("SELECT id,nickname,category,body,created_at,status,link_urls,link_flags,link_review_required FROM messages WHERE status=? ORDER BY created_at ASC", (status,)).fetchall()
            items = []
            for row in rows:
                item = dict(row)
                item["linkUrls"] = json.loads(item.pop("link_urls") or "[]")
                item["linkFlags"] = json.loads(item.pop("link_flags") or "[]")
                item["linkReviewRequired"] = bool(item.pop("link_review_required"))
                items.append(item)
            self._send({"items": items, "status": status})
        finally:
            connection.close()

    def do_POST(self) -> None:
        parsed = urlparse(self.path)
        if parsed.path != "/api/v1/guestbook":
            self._error("Not found", 404); return
        if self._rate_limited("POST"):
            self._error("提交过于频繁，请稍后再试。", 429); return
        account_id = self._account_id()
        try:
            body = self._read_json()
            if safe_text(body.get("website"), 120):
                self._error("请填写有效内容。", 400, account_id); return
            name = safe_text(body.get("name"), 30)
            message = safe_text(body.get("message"), 600)
            category = body.get("category")
            fingerprint = safe_text(body.get("fingerprint"), 160)
            if not 1 <= len(name) <= 30: raise ValueError("昵称需要是 1 到 30 个字。")
            if not 2 <= len(message) <= 600: raise ValueError("留言需要是 2 到 600 个字。")
            if category not in CATEGORIES: raise ValueError("请选择留言类型。")
            if not fingerprint: raise ValueError("设备标识缺失，请刷新页面后重试。")
            if re.search(r"(<script|<iframe)", message, re.I): raise ValueError("留言暂不接受代码片段。")
            link_urls = extract_urls(message)
            link_flags, hard_blocks = inspect_links(link_urls)
            if hard_blocks:
                raise ValueError("检测到色情或赌博类链接，这类链接不能提交。")
            link_review_required = bool(link_urls)
            ip_hash = h("ip:" + self._client_ip())
            fingerprint_hash = h("fingerprint:" + fingerprint)
            connection = db_connect()
            try:
                connection.execute("BEGIN IMMEDIATE")
                if account_id:
                    account = connection.execute("SELECT id,nickname,ip_hash,fingerprint_hash FROM accounts WHERE id=?", (account_id,)).fetchone()
                    if not account:
                        account_id = None
                if not account_id:
                    conflict = connection.execute("SELECT id FROM accounts WHERE ip_hash=? OR fingerprint_hash=? LIMIT 1", (ip_hash, fingerprint_hash)).fetchone()
                    if conflict:
                        connection.rollback(); self._error("此网络或设备已经注册过留言账号。", 409); return
                    account_id = str(uuid.uuid4())
                    connection.execute("INSERT INTO accounts(id,nickname,created_at,ip_hash,fingerprint_hash) VALUES(?,?,?,?,?)", (account_id, name, now_iso(), ip_hash, fingerprint_hash))
                limit_row = connection.execute("SELECT count FROM daily_limits WHERE account_id=? AND day_key=?", (account_id, day_key())).fetchone()
                used = int(limit_row[0]) if limit_row else 0
                if used >= DAILY_LIMIT:
                    connection.rollback(); self._error("今天的留言额度已用完，请明天再来。", 429, account_id); return
                duplicate = connection.execute("SELECT 1 FROM messages WHERE account_id=? AND day_key=? AND nickname=? AND body=? LIMIT 1", (account_id, day_key(), name, message)).fetchone()
                if duplicate:
                    connection.rollback(); self._error("相同内容今天已经提交过了。", 409, account_id); return
                message_id = str(uuid.uuid4())
                connection.execute("INSERT INTO messages(id,account_id,nickname,category,body,created_at,day_key,status,link_urls,link_flags,link_review_required) VALUES(?,?,?,?,?,?,?,?,?,?,?)", (message_id, account_id, name, category, message, now_iso(), day_key(), "pending", json.dumps(link_urls, ensure_ascii=False), json.dumps(link_flags, ensure_ascii=False), int(link_review_required)))
                if limit_row:
                    connection.execute("UPDATE daily_limits SET count=count+1 WHERE account_id=? AND day_key=?", (account_id, day_key()))
                else:
                    connection.execute("INSERT INTO daily_limits(account_id,day_key,count) VALUES(?,?,1)", (account_id, day_key()))
                connection.commit()
                self._send_with_cookie({"status": "pending", "message": "留言已进入审核，审核通过后会显示在公开墙。", "remainingToday": DAILY_LIMIT - used - 1}, 201, account_id)
            finally:
                connection.close()
        except ValueError as exc:
            self._error(str(exc), 422, account_id)
        except (json.JSONDecodeError, UnicodeDecodeError):
            self._error("请求格式不正确。", 400, account_id)
        except Exception:
            self._error("留言暂时无法提交，请稍后再试。", 500, account_id)

    def do_PATCH(self) -> None:
        parsed = urlparse(self.path)
        prefix = "/api/v1/guestbook/review/"
        if not parsed.path.startswith(prefix):
            self._error("Not found", 404); return
        if self._rate_limited("PATCH"):
            self._error("操作过于频繁，请稍后再试。", 429); return
        if not hmac.compare_digest(self.headers.get(ADMIN_HEADER, ""), ADMIN_TOKEN):
            self._error("Unauthorized", 401); return
        message_id = parsed.path[len(prefix):].strip()
        try:
            body = self._read_json()
            status = body.get("status")
            if status not in ("approved", "rejected"):
                self._error("审核状态不正确。", 422); return
            connection = db_connect()
            try:
                cursor = connection.execute("UPDATE messages SET status=? WHERE id=?", (status, message_id))
                if cursor.rowcount == 0:
                    self._error("留言不存在。", 404); return
                connection.execute(
                    "INSERT INTO moderation_audit(message_id,next_status,reviewer_ip_hash,created_at) VALUES(?,?,?,?)",
                    (message_id, status, h("reviewer-ip:" + self._client_ip()), now_iso()),
                )
                self._send({"id": message_id, "status": status})
            finally:
                connection.close()
        except Exception:
            self._error("审核操作失败。", 500)

    def log_message(self, *_args: object) -> None:
        return


if __name__ == "__main__":
    db_connect().close()
    ThreadingHTTPServer((HOST, PORT), Handler).serve_forever()
