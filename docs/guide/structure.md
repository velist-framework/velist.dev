# Project Structure

Overview of Velist project organization.

---

## Root Directory

```
my-app/
├── src/                    # Application source code
├── static/                 # Static assets (images, fonts)
├── tests/                  # Unit and E2E tests
├── db/                     # SQLite database files
├── workflow/               # AI agent workflow outputs
├── docs/                   # Documentation
├── package.json            # Dependencies and scripts
├── tsconfig.json           # TypeScript configuration
├── vite.config.ts          # Vite build configuration
└── drizzle.config.ts       # Database migration config
```

---

## Source Code (`src/`)

```
src/
├── bootstrap.ts            # Application entry point
├── features/               # Feature slices
│   ├── _core/             # Core infrastructure
│   │   ├── auth/          # Authentication
│   │   ├── database/      # Database setup
│   │   └── errors/        # Error pages
│   └── [feature]/         # Your features
│       ├── api.ts
│       ├── service.ts
│       ├── repository.ts
│       └── pages/
├── inertia/                # Inertia.js integration
│   ├── plugin.ts          # Custom Inertia adapter
│   └── app.ts             # Client bootstrap
├── shared/                 # Cross-cutting concerns
│   ├── lib/               # Utilities
│   └── styles/            # Global styles
└── types/                  # TypeScript declarations
```

---

## Feature Folder Structure

Each feature follows this pattern:

```
features/[name]/
├── api.ts                  # Elysia routes
├── service.ts              # Business logic
├── repository.ts           # Database access
├── components/             # Shared components (optional)
└── pages/                  # Svelte pages
    ├── Index.svelte
    ├── Create.svelte
    └── Edit.svelte
```

---

## File Purposes

| File | Responsibility |
|------|----------------|
| `api.ts` | Define routes, handle HTTP requests, render pages |
| `service.ts` | Business logic, validation, data transformation |
| `repository.ts` | Database queries, data access |
| `pages/*.svelte` | UI components rendered by Inertia |

---

## Naming Conventions

| Item | Convention | Example |
|------|------------|---------|
| Feature folder | camelCase | `invoices`, `userSettings` |
| API files | camelCase | `api.ts` |
| Service files | camelCase | `service.ts` |
| Repository files | camelCase | `repository.ts` |
| Svelte pages | PascalCase | `Index.svelte`, `Create.svelte` |
| URL routes | kebab-case | `/invoices/create` |

---

## Path Aliases

Use these aliases for imports:

| Alias | Maps to |
|-------|---------|
| `$features/*` | `src/features/*` |
| `$shared/*` | `src/shared/*` |
| `$inertia/*` | `src/inertia/*` |

Example:
```typescript
import { db } from '$features/_core/database/connection'
import { uuidv7 } from '$shared/lib/uuid'
```

---

## Static Assets

Place in `static/` folder:

```
static/
├── images/
├── fonts/
└── favicon.ico
```

Access with root-relative URLs:
```html
<img src="/images/logo.png" />
```

---

## Where to Put New Code

| What you're adding | Where to put it |
|-------------------|-----------------|
| New feature | `src/features/[name]/` |
| Utility function | `src/shared/lib/` |
| Global style | `src/shared/styles/app.css` |
| Type declaration | `src/types/` |
| E2E test | `tests/e2e/` |
| Unit test | `tests/unit/` |
