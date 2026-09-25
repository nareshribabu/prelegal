"""SQLite setup for the prelegal backend.

The database is recreated from scratch every time the app starts, so
`init_db` always drops and re-creates the schema rather than migrating it.
"""

import sqlite3
from pathlib import Path

USERS_TABLE = """
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
)
"""


def init_db(path: Path) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.unlink(missing_ok=True)

    connection = sqlite3.connect(path)
    try:
        connection.execute(USERS_TABLE)
        connection.commit()
    finally:
        connection.close()
