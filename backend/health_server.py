#!/usr/bin/env python3
"""Loopback health endpoint. The retired guestbook has no database or write API."""
from __future__ import annotations

import json
import os
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import unquote, urlparse

HOST = "127.0.0.1"
PORT = int(os.environ.get("BACKEND_PORT", "8000"))


class Handler(BaseHTTPRequestHandler):
    def _send(self, data: dict[str, str], status: int = 200) -> None:
        body = json.dumps(data, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        if self.command != "HEAD":
            self.wfile.write(body)
        self.close_connection = True

    def _retired(self) -> bool:
        path = unquote(urlparse(self.path).path).rstrip("/")
        roots = ("/api/v1/guestbook", "/api/guestbook", "/guestbook", "/api/audio")
        if any(path == root or path.startswith(root + "/") for root in roots):
            self._send({"error": "This feature has been permanently retired."}, 410)
            return True
        return False

    def do_GET(self) -> None:
        if self._retired():
            return
        if urlparse(self.path).path in ("/health", "/api/v1/health"):
            self._send({"status": "ok", "service": "backend", "version": "v2"})
            return
        self._send({"error": "Not found"}, 404)

    do_HEAD = do_GET

    def do_POST(self) -> None:
        if not self._retired():
            self._send({"error": "Not found"}, 404)

    do_PATCH = do_POST
    do_PUT = do_POST
    do_DELETE = do_POST
    do_OPTIONS = do_POST

    def log_message(self, *_args: object) -> None:
        return


if __name__ == "__main__":
    ThreadingHTTPServer((HOST, PORT), Handler).serve_forever()
