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

## Step-by-Step Walkthrough

We'll create an **Invoices** feature with CRUD operations.

### Step 1: Update Database Schema

Add the table to `src/features/_core/database/connection.ts`:

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

### Step 2: Create Migration

```bash
bun run db:generate
bun run db:migrate
```

### Step 3: Create Repository

`src/features/invoices/repository.ts`:

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

### Step 4: Create Service

`src/features/invoices/service.ts`:

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

### Step 5: Create API Routes

`src/features/invoices/api.ts`:

```typescript
import { Elysia } from 'elysia'
import { authApi } from '../_core/auth/api'
import { InvoiceService, CreateInvoiceSchema, UpdateInvoiceSchema } from './service'
import { inertia, type Inertia } from '../../inertia/plugin'

export const invoiceApi = new Elysia({ prefix: '/invoices' })
  .use(authApi)
  .auth(true)
  .use(inertia())
  .derive(() => ({ invoiceService: new InvoiceService() }))
  
  .get('/', async (ctx) => {
    const { inertia, invoiceService } = ctx as any
    const invoices = await invoiceService.getAll()
    return inertia.render('invoices/Index', { invoices })
  })
  
  .get('/create', (ctx) => {
    return (ctx as any).inertia.render('invoices/Create', { errors: {} })
  })
  
  .post('/', async (ctx) => {
    const { body, invoiceService, inertia } = ctx as any
    await invoiceService.create(body)
    return inertia.redirect('/invoices')
  }, { body: CreateInvoiceSchema })
  
  .get('/:id/edit', async (ctx) => {
    const { params, invoiceService, inertia } = ctx as any
    const invoice = await invoiceService.getById(params.id)
    return inertia.render('invoices/Edit', { invoice, errors: {} })
  })
  
  .put('/:id', async (ctx) => {
    const { params, body, invoiceService, inertia } = ctx as any
    await invoiceService.update(params.id, body)
    return inertia.redirect('/invoices')
  }, { body: UpdateInvoiceSchema })
  
  .delete('/:id', async (ctx) => {
    const { params, invoiceService, inertia } = ctx as any
    await invoiceService.delete(params.id)
    return inertia.redirect('/invoices')
  })
```

### Step 6: Create Svelte Pages

Create `Index.svelte`, `Create.svelte`, `Edit.svelte` in `src/features/invoices/pages/`.

See [Quick Start](./quick-start) for complete page examples.

### Step 7: Mount in Bootstrap

Add to `src/bootstrap.ts`:

```typescript
import { invoiceApi } from './features/invoices/api'

app.use(invoiceApi)
```

---

## Pattern Summary

| Step | File | Purpose |
|------|------|---------|
| 1 | `connection.ts` | Add table to schema |
| 2 | Migration | Create database table |
| 3 | `repository.ts` | Database queries |
| 4 | `service.ts` | Business logic + validation |
| 5 | `api.ts` | Routes + render pages |
| 6 | `pages/*.svelte` | UI components |
| 7 | `bootstrap.ts` | Mount routes |
