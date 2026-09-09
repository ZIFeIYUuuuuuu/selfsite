#!/usr/bin/env python3
import os
import sqlite3
import tempfile
import time
from pathlib import Path

source = Path("/opt/selfsite/data/guestbook.sqlite3")
target_dir = Path("/opt/selfsite/backups")
target_dir.mkdir(mode=0o750, parents=True, exist_ok=True)
stamp = time.strftime("%Y%m%d-%H%M%S", time.gmtime())
fd, tmp_name = tempfile.mkstemp(prefix=".guestbook-", suffix=".sqlite3", dir=target_dir)
os.close(fd)
tmp = Path(tmp_name)
try:
    with sqlite3.connect(source) as src, sqlite3.connect(tmp) as dst:
        src.backup(dst)
        dst.execute("PRAGMA wal_checkpoint(PASSIVE)")
    os.chmod(tmp, 0o640)
    final = target_dir / f"guestbook-{stamp}.sqlite3"
    os.replace(tmp, final)
    cutoff = time.time() - 14 * 86400
    for item in target_dir.glob("guestbook-*.sqlite3"):
        if item != final and item.stat().st_mtime < cutoff:
            item.unlink()
finally:
    tmp.unlink(missing_ok=True)
