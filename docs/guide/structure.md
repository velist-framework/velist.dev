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

| File | Responsibility | Layer |
|------|----------------|-------|
| `api.ts` | Define routes, handle HTTP requests, render pages | HTTP |
| `service.ts` | Business logic, validation, data transformation | Business |
| `repository.ts` | Database queries, data access | Data |
| `pages/*.svelte` | UI components rendered by Inertia | Presentation |

**Dependency flow:** `API → Service → Repository`

See [Vertical Slicing](/guide/vertical-slicing) for the philosophy behind this structure.

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

## Core Infrastructure (`features/_core/`)

Cross-cutting infrastructure used by all features:

```
features/_core/
├── auth/                # Authentication system
│   ├── api.ts
│   ├── service.ts
│   ├── repository.ts
│   └── pages/
├── database/            # Database setup
│   ├── connection.ts   # Kysely instance
│   ├── schema.ts       # Drizzle schema
│   └── migrations/
├── storage/             # File storage abstraction
│   ├── index.ts        # Storage interface & factory
│   ├── local.ts        # Local filesystem storage
│   └── s3.ts           # S3-compatible storage
└── errors/              # Error pages
    └── pages/
```

### Storage Infrastructure

Abstraction layer for file storage:

```typescript
import { createStorage } from '$features/_core/storage'

const storage = createStorage()

// Upload
await storage.upload('path/to/file.png', fileBuffer, 'image/png')

// Get URL
const url = storage.getPublicUrl('path/to/file.png')
```

See [File Upload Example](/examples/file-upload) for complete implementation.

---

## Shared Folder (`src/shared/`)

Cross-cutting concerns used by multiple features:

```
shared/
├── lib/                  # Utility functions
│   ├── uuid.ts          # UUID v7 generator
│   ├── toast.ts         # Toast notifications
│   ├── debounce.ts      # Debounce utility
│   └── csv.ts           # CSV export
├── components/          # Shared components
│   └── ToastContainer.svelte
├── layouts/             # Page layouts
│   ├── AppLayout.svelte     # Authenticated pages
│   └── PublicLayout.svelte  # Public pages
└── styles/
    └── app.css          # Tailwind + global styles
```

### Shared Libraries (`shared/lib/`)

| File | Purpose | Example Usage |
|------|---------|---------------|
| `uuid.ts` | Generate UUID v7 | `uuidv7()` for primary keys |
| `toast.ts` | Show notifications | `toast.success('Saved!')` |
| `debounce.ts` | Delay function execution | `debounce(search, 300)` |
| `csv.ts` | Export data to CSV | `downloadCSV('data', rows)` |

**Example:**
```typescript
import { toast } from '$shared/lib/toast'
import { debounce } from '$shared/lib/debounce'
import { uuidv7 } from '$shared/lib/uuid'

// Show toast
toast.success('Invoice created!')

// Debounce search input
debounce(() => searchProducts(query), 300)
```

### Shared Components (`shared/components/`)

Complex reusable components:

| Component | Purpose |
|-----------|---------|
| `ToastContainer.svelte` | Displays toast notifications |

**Rule:** Only create components for complex reusable UI (Modal, DataTable). Don't create atomic components (Button, Input, Card) - use Tailwind directly.

### Layouts (`shared/layouts/`)

| Layout | Use For |
|--------|---------|
| `AppLayout.svelte` | Authenticated pages (requires `user` prop) |
| `PublicLayout.svelte` | Public pages (marketing, landing) |

**Example:**
```svelte
<script>
  import AppLayout from '$shared/layouts/AppLayout.svelte'
</script>

<AppLayout title="Invoices" {user}>
  <!-- Page content -->
</AppLayout>
```

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
| Layout component | `src/shared/layouts/` |
| Shared component | `src/shared/components/` |
| Global style | `src/shared/styles/app.css` |
| Type declaration | `src/types/` |
| E2E test | `tests/e2e/` |
| Unit test | `tests/unit/` |
