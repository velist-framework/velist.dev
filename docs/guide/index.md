# Introduction

Velist is a **features-first fullstack framework** that combines:

- ⚡ **Elysia** — Fast Bun web framework
- 🔄 **Inertia.js** — SPA experience without API complexity  
- ⚡ **Svelte 5** — Reactive UI with runes
- 📊 **Kysely** — Type-safe SQL queries

## Philosophy

Traditional frameworks organize code by technical layers:
```
controllers/
models/
views/
```

**Velist organizes by features:**
```
features/
├── auth/
│   ├── api.ts       # Routes
│   ├── service.ts   # Business logic
│   ├── repository.ts # Database access
│   └── pages/
│       └── Login.svelte
├── dashboard/
│   └── ...
└── invoices/
    └── ...
```

## Why Velist?

1. **Faster Development** — Everything for a feature is in one place
2. **Type Safety** — End-to-end TypeScript from DB to UI
3. **No Boilerplate** — Start building features immediately
4. **Modern Stack** — Bun, Svelte 5, Elysia

## Quick Start

```bash
# Create a new project
bun create velist my-app

# Enter the directory
cd my-app

# Start development
bun run dev
```

Open http://localhost:3000 and login with:
- Email: `admin@example.com`
- Password: `password123`

## Stack Overview

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Runtime | Bun | JavaScript runtime, package manager |
| Backend | Elysia | Web framework with validation |
| Frontend | Svelte 5 | Reactive UI components |
| Bridge | Inertia.js | Backend-rendered SPAs |
| Database | SQLite (bun:sqlite) | Embedded database |
| Query | Kysely | Type-safe SQL |
| Migrations | Drizzle ORM | Schema management |
| Styling | Tailwind CSS v4 | Utility-first CSS |

## Next Steps

- [Installation](/guide/installation) — Detailed setup instructions
- [Quick Start](/guide/quick-start) — Build your first feature
- [Vertical Slicing](/guide/vertical-slicing) — Understand the architecture
