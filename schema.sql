-- Schema for Cloudflare D1 (SQLite dialect)
-- Apply with: wrangler d1 execute runbeacon-db --file=schema.sql
-- Local dev:  wrangler d1 execute runbeacon-db --local --file=schema.sql

CREATE TABLE IF NOT EXISTS subscribers (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  email      TEXT    NOT NULL UNIQUE,
  created_at TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS engagement_log (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  email       TEXT    NOT NULL,
  event_type  TEXT    NOT NULL,   -- 'subscribe', 'duplicate'
  payload     TEXT,               -- JSON string, nullable
  created_at  TEXT    NOT NULL DEFAULT (datetime('now'))
);
