# Creating Features

Step-by-step guide to creating a new feature in Velist.

---

## Quick Command

Create folder structure for a new feature:

```bash
mkdir -p src/features/invoices/pages
touch src/features/invoices/{api.ts,service.ts,repository.ts}
touch src/features/invoices/pages/{Index.svelte,Create.svelte,Edit.svelte}
```

---

## Understanding the Flow

Before we start, understand how data flows through the layers:

```
User Request → API → Service → Repository → Database
                  ↓
             Response ← Page Rendering
```

**Why this flow?**
- **API**: Handles HTTP (routes, requests, responses)
- **Service**: Contains business logic (validation, calculations)
- **Repository**: Talks to database (SQL queries)

Each layer has one job. Makes testing and maintenance easier.

---

## Step-by-Step Walkthrough

We'll create an **Invoices** feature with CRUD operations.

### Step 1: Database Schema

First, define your data structure. In Velist, we use **two files** for database:

#### 1a. Drizzle Schema (`schema.ts`)

Edit `src/features/_core/database/schema.ts`:

```typescript
import { sqliteTable, text, real } from 'drizzle-orm/sqlite-core'
import { sql } from 'drizzle-orm'

export const invoices = sqliteTable('invoices', {
  id: text('id').primaryKey(),
  customer: text('customer').notNull(),
  amount: real('amount').notNull(),
  status: text('status').notNull().default('pending'),
  createdAt: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').notNull().default(sql`CURRENT_TIMESTAMP`),
})
```

**Why `schema.ts`?**
- Drizzle ORM uses this to generate SQL migrations
- Single source of truth for table structure
- Type-safe schema definition

#### 1b. Kysely Types (`connection.ts`)

Add TypeScript types to `src/features/_core/database/connection.ts`:

```typescript
export interface DatabaseSchema {
  // ... existing tables
  invoices: {
    id: string
    customer: string
    amount: number
    status: 'pending' | 'paid' | 'cancelled'
    created_at: string
    updated_at: string
  }
}
```

**Why `connection.ts`?**
- Kysely (query builder) needs TypeScript types at runtime
- Gives you autocomplete and type checking in repositories
- Separate from schema because Kysely and Drizzle are different tools

**Why two files?**
- `schema.ts` = Drizzle ORM (schema definition + migrations)
- `connection.ts` = Kysely (type-safe SQL queries)
- Different jobs, different files

### Step 2: Create Migration

Generate and apply migrations:

```bash
bun run db:generate
bun run db:migrate
```

**What happens?**
1. Drizzle reads `schema.ts`
2. Generates SQL migration file
3. Applies migration to database
4. Table `invoices` now exists

### Step 3: Create Repository

Create `src/features/invoices/repository.ts`:

```typescript
import { db } from '../_core/database/connection'
import { uuidv7 } from '../../shared/lib/uuid'

export class InvoiceRepository {
  async findAll() {
    return db.selectFrom('invoices').selectAll().execute()
  }
  
  async findById(id: string) {
    return db.selectFrom('invoices')
      .where('id', '=', id)
      .selectAll()
      .executeTakeFirst()
  }
  
  async create(data: { customer: string; amount: number }) {
    const id = uuidv7()
    const now = new Date().toISOString()
    return db.insertInto('invoices')
      .values({ id, ...data, status: 'pending', created_at: now, updated_at: now })
      .returningAll()
      .executeTakeFirst()
  }
  
  async update(id: string, data: Partial<Record<string, any>>) {
    return db.updateTable('invoices')
      .set({ ...data, updated_at: new Date().toISOString() })
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirst()
  }
  
  async delete(id: string) {
    return db.deleteFrom('invoices').where('id', '=', id).execute()
  }
}
```

**Why Repository?**
- Isolates database queries from business logic
- Easy to test (mock the repository)
- Easy to change database (only change this file)
- No SQL in service layer

**Note:** Repository only does CRUD. No validation, no business rules.

### Step 4: Create Service

Create `src/features/invoices/service.ts`:

```typescript
import { t, type Static } from 'elysia'
import { InvoiceRepository } from './repository'

export const CreateInvoiceSchema = t.Object({
  customer: t.String({ minLength: 1, maxLength: 255 }),
  amount: t.Number({ minimum: 0 })
})

export const UpdateInvoiceSchema = t.Partial(t.Object({
  customer: t.String(),
  amount: t.Number(),
  status: t.Union([t.Literal('pending'), t.Literal('paid'), t.Literal('cancelled')])
}))

export type CreateInvoicePayload = Static<typeof CreateInvoiceSchema>

export class InvoiceService {
  constructor(private repo: InvoiceRepository = new InvoiceRepository()) {}
  
  async getAll() { return this.repo.findAll() }
  async getById(id: string) { return this.repo.findById(id) }
  async create(payload: CreateInvoicePayload) { return this.repo.create(payload) }
  async update(id: string, data: any) { return this.repo.update(id, data) }
  async delete(id: string) { return this.repo.delete(id) }
}
```

**Why Service?**
- Business logic lives here (validation, calculations)
- Schema validation using TypeBox
- Orchestrates multiple repositories if needed
- No HTTP concerns, no SQL queries

**Service vs Repository:**
| Repository | Service |
|------------|---------|
| `db.selectFrom(...)` | `this.repo.findAll()` |
| SQL queries | Business rules |
| Data access | Data transformation |

### Step 5: Create API Routes

Create `src/features/invoices/api.ts`:

```typescript
import { createProtectedApi } from '../_core/auth/protected'
import { InvoiceService, CreateInvoiceSchema, UpdateInvoiceSchema } from './service'

export const invoiceApi = createProtectedApi('/invoices')
  .derive(() => ({ invoiceService: new InvoiceService() }))
  
  .get('/', async (ctx) => {
    const { inertia, invoiceService } = ctx
    const invoices = await invoiceService.getAll()
    const user = (ctx as any).user
    return inertia.render('invoices/Index', { invoices, user })
  })
  
  .get('/create', (ctx) => {
    return ctx.inertia.render('invoices/Create', { errors: {} })
  })
  
  .post('/', async (ctx) => {
    const { body, invoiceService, inertia } = ctx
    await invoiceService.create(body)
    return inertia.redirect('/invoices')
  }, { body: CreateInvoiceSchema })
  
  .get('/:id/edit', async (ctx) => {
    const { params, invoiceService, inertia } = ctx
    const invoice = await invoiceService.getById(params.id)
    return inertia.render('invoices/Edit', { invoice, errors: {} })
  })
  
  .put('/:id', async (ctx) => {
    const { params, body, invoiceService, inertia } = ctx
    await invoiceService.update(params.id, body)
    return inertia.redirect('/invoices')
  }, { body: UpdateInvoiceSchema })
  
  .delete('/:id', async (ctx) => {
    const { params, invoiceService, inertia } = ctx
    await invoiceService.delete(params.id)
    return inertia.redirect('/invoices')
  })
```

**Why this structure?**
- `createProtectedApi()` = Authentication handled automatically
- `.derive()` = Inject service into context
- `ctx.inertia.render()` = Render Svelte page with data
- Validation schema in route = Type-safe request body

**API responsibilities:**
- Define URL routes
- Parse request (params, query, body)
- Call service methods
- Render pages or redirect

### Step 6: Create Svelte Pages

Create `Index.svelte`, `Create.svelte`, `Edit.svelte` in `src/features/invoices/pages/`.

See [Complete CRUD Example](/examples/crud) for full page code.

**Why pages in feature folder?**
- UI belongs to the feature
- Easy to find all related code
- Delete folder = delete feature completely

### Step 7: Mount in Bootstrap

Add to `src/bootstrap.ts`:

```typescript
import { invoiceApi } from './features/invoices/api'

// ... existing code ...

app.use(invoiceApi)
```

---

## Pattern Summary

| Step | File | Purpose | Why? |
|------|------|---------|------|
| 1a | `schema.ts` | Drizzle table definition | Generate migrations |
| 1b | `connection.ts` | Kysely TypeScript types | Type-safe queries |
| 2 | Migration | SQL to create table | Database schema version control |
| 3 | `repository.ts` | Database queries | Isolate data access |
| 4 | `service.ts` | Business logic + validation | Isolate business rules |
| 5 | `api.ts` | Routes + render pages | HTTP handling |
| 6 | `pages/*.svelte` | UI components | User interface |
| 7 | `bootstrap.ts` | Register routes | Wire everything together |

---

## Data Flow Visualization

```
┌─────────────┐
│   Browser   │
└──────┬──────┘
       │ GET /invoices
       ▼
┌─────────────┐
│    api.ts   │ ← Parse request, extract params
│  (Routes)   │
└──────┬──────┘
       │ invoiceService.getAll()
       ▼
┌─────────────┐
│ service.ts  │ ← Validate, apply business rules
│  (Logic)    │
└──────┬──────┘
       │ repo.findAll()
       ▼
┌─────────────┐
│repository.ts│ ← Build SQL query
│  (Queries)  │
└──────┬──────┘
       │ SELECT * FROM invoices
       ▼
┌─────────────┐
│  Database   │
└─────────────┘
```

**Each layer:**
- Has one job
- Doesn't know about layers above it
- Easy to test in isolation

---

## Common Questions

### Why not put everything in one file?

You could. But:
- Harder to test (mix HTTP + SQL + business logic)
- Merge conflicts when multiple devs work on same feature
- Can't reuse service logic in different routes

### Can I skip the service layer?

For simple CRUD, yes. But:
- No centralized validation
- Business logic scattered in routes
- Harder to test

### When to create a component?

See [Vertical Slicing](/guide/vertical-slicing) for guidelines.

### Why Kysely for queries AND Drizzle for migrations?

Great question! We use both tools because each excels at different jobs:

| Tool | Job | Why |
|------|-----|-----|
| **Kysely** | Runtime queries | Fast, type-safe SQL builder |
| **Drizzle** | Schema & migrations | Best-in-class migration system |

**The Problem with Kysely Migrations:**
Kysely's migration system is basic and manual. You write raw SQL migrations by hand. No schema diffing, no auto-generation.

**The Problem with Drizzle Runtime:**
Drizzle ORM runtime has compatibility issues with Bun. Less stable than Kysely.

**The Solution: Use Best of Both**
```
Drizzle Kit (CLI) → Generates migrations from schema.ts
                         ↓
              Run migrations → Database schema updated
                         ↓
Kysely (Runtime) → Type-safe queries in repository.ts
```

**Benefits:**
1. **Fast queries** - Kysely is lightweight and fast
2. **Type-safe** - Both tools give TypeScript types
3. **Great migrations** - Drizzle auto-generates migrations from schema changes
4. **Stable** - Kysely works reliably with Bun

**In short:** Drizzle for "designing" the database. Kysely for "using" the database.

---

## Next Steps

- [Quick Start](./quick-start) — Build your first feature
- [Vertical Slicing](./vertical-slicing) — Understand the philosophy
- [Complete CRUD](/examples/crud) — Full example with pagination
