-- Database Schema for TEMPMAIL-VANZ (SQLite / Cloudflare D1)

-- Domains Table
CREATE TABLE IF NOT EXISTS domains (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    domain_name TEXT NOT NULL UNIQUE,
    created_at  TEXT DEFAULT (datetime('now'))
);

-- Temporary addresses generated for users
CREATE TABLE IF NOT EXISTS temp_addresses (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    address    TEXT NOT NULL UNIQUE,
    created_at TEXT DEFAULT (datetime('now'))
);

-- Emails received for a temporary address
CREATE TABLE IF NOT EXISTS emails (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    recipient   TEXT NOT NULL,
    sender      TEXT,
    subject     TEXT,
    body        TEXT,
    received_at TEXT DEFAULT (datetime('now'))
);

-- API Keys Table
CREATE TABLE IF NOT EXISTS api_keys (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id    TEXT NOT NULL,
    api_key    TEXT NOT NULL UNIQUE,
    created_at TEXT DEFAULT (datetime('now'))
);

-- Seed a default domain so email generation works out of the box
INSERT OR IGNORE INTO domains (domain_name) VALUES ('tempmail.vanz');
