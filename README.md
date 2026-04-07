# TEMPMAIL-VANZ

A temporary email service built on **Cloudflare Workers** with a **D1 SQLite** database.

## Features

- Generate random temporary email addresses
- View incoming messages per address (inbox)
- Manage custom email domains
- API-key authentication endpoint
- Auto-refreshing inbox (every 5 seconds)
- Zero cold-starts, runs globally on the Cloudflare edge network

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Runtime | Cloudflare Workers (ES Modules) |
| Database | Cloudflare D1 (SQLite) |
| Frontend | Vanilla JS + Tailwind CSS |
| Tooling | Wrangler CLI v3 |

## Setup

### Prerequisites

- [Node.js](https://nodejs.org/) ≥ 18
- A [Cloudflare account](https://dash.cloudflare.com/sign-up)
- Wrangler CLI (installed below)

### 1. Clone & install

```bash
git clone https://github.com/elfredafinza19/TEMPMAIL-VANZ.git
cd TEMPMAIL-VANZ
npm install
```

### 2. Authenticate with Cloudflare

```bash
npx wrangler login
```

### 3. Create the D1 database

```bash
npx wrangler d1 create tempmail-db
```

Copy the `database_id` printed in the terminal and update `wrangler.toml` — replace the placeholder value:

```toml
[[d1_databases]]
binding = "DB"
database_name = "tempmail-db"
database_id = "<paste-your-database-id-here>"
```

### 4. Initialise the database schema

```bash
# Local (for wrangler dev)
npm run db:init

# Remote (production)
npm run db:init:remote
```

### 5. Run locally

```bash
npm run dev
```

Open your browser at **http://localhost:8787**

### 6. Deploy to Cloudflare

```bash
npm run deploy
```

## API Reference

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/emails/generate` | Generate a new temporary email address |
| `GET` | `/api/emails/:address` | List messages received by an address |
| `GET` | `/api/domains` | List all configured domains |
| `POST` | `/api/domains` | Add a domain `{ "domain": "example.com" }` |
| `DELETE` | `/api/domains/:domain` | Remove a domain |
| `POST` | `/api/auth/generate-api-key` | Create an API key `{ "userId": "..." }` |
| `GET` | `/api/auth/auth-api-key` | Validate an API key (`X-Api-Key` header) |

## Project Structure

```
TEMPMAIL-VANZ/
├── public/
│   └── index.html       # Frontend (Tailwind CSS + Vanilla JS)
├── src/
│   ├── index.js         # Cloudflare Workers main handler
│   └── db/
│       └── schema.sql   # D1 SQLite schema
├── wrangler.toml        # Wrangler / Workers configuration
└── package.json
```

---

Last Updated: 2026-04-07
