# Routing

Velist uses Elysia for routing with Inertia.js page rendering.

---

## Basic Route Definition

Routes are defined in `api.ts` files within feature folders:

```typescript
// src/features/items/api.ts
import { Elysia } from 'elysia'
import { inertia } from '../../inertia/plugin'

export const itemApi = new Elysia({ prefix: '/items' })
  .use(inertia())
  
  // List page
  .get('/', async (ctx) => {
    const items = await service.getAll()
    return ctx.inertia.render('items/Index', { items })
  })
  
  // Create form page
  .get('/create', (ctx) => {
    return ctx.inertia.render('items/Create', { errors: {} })
  })
  
  // Store action
  .post('/', async (ctx) => {
    await service.create(ctx.body)
    return ctx.inertia.redirect('/items')
  })
  
  // Edit form page
  .get('/:id/edit', async (ctx) => {
    const item = await service.getById(ctx.params.id)
    return ctx.inertia.render('items/Edit', { item, errors: {} })
  })
  
  // Update action
  .put('/:id', async (ctx) => {
    await service.update(ctx.params.id, ctx.body)
    return ctx.inertia.redirect('/items')
  })
  
  // Delete action
  .delete('/:id', async (ctx) => {
    await service.delete(ctx.params.id)
    return ctx.inertia.redirect('/items')
  })
```

---

## Route Prefix

The `prefix` option groups routes under a common path:

```typescript
new Elysia({ prefix: '/items' })
  .get('/')        // → GET /items
  .get('/create')  // → GET /items/create
  .post('/')       // → POST /items
```

---

## Route Parameters

Use `:param` for dynamic segments:

```typescript
.get('/:id', (ctx) => {
  const id = ctx.params.id
  // ...
})

.get('/:id/edit', (ctx) => {
  const id = ctx.params.id
  // ...
})
```

---

## Protected Routes

**Use `createProtectedApi()` helper** for authenticated routes:

```typescript
import { createProtectedApi } from '../_core/auth/protected'

export const protectedApi = createProtectedApi('/admin')
  .derive(() => ({ adminService: new AdminService() }))
  
  .get('/', (ctx) => {
    const { inertia, adminService } = ctx
    const user = (ctx as any).user
    // Only authenticated users can access
    return inertia.render('admin/Index', { user })
  })
```

### Accessing Current User

```typescript
.get('/profile', (ctx) => {
  const user = (ctx as any).user
  // { id, email, name, role }
  
  return ctx.inertia.render('profile/Index', { user })
})
```

---

## Rendering Pages

Inertia renders Svelte pages with data:

```typescript
// Render page with props
return ctx.inertia.render('items/Index', { 
  items: items,
  filters: { status: 'active' }
})

// Redirect after action
return ctx.inertia.redirect('/items')

// Redirect with flash message
return ctx.inertia.render('items/Create', { 
  errors: { title: 'Title is required' }
})
```

---

## Page Resolution

Pages are auto-discovered from `src/features/**/pages/*.svelte`:

| Render Call | Resolves To |
|-------------|-------------|
| `render('items/Index')` | `features/items/pages/Index.svelte` |
| `render('items/Create')` | `features/items/pages/Create.svelte` |
| `render('auth/Login')` | `features/auth/pages/Login.svelte` |

---

## Validation

Use TypeBox schemas for validation:

```typescript
import { t } from 'elysia'

const CreateSchema = t.Object({
  title: t.String({ minLength: 1 }),
  amount: t.Number({ minimum: 0 })
})

.post('/', async (ctx) => {
  // body is validated and typed
  const { title, amount } = ctx.body
  // ...
}, { body: CreateSchema })
```

Validation errors automatically return to the form page.

---

## Middleware Pattern

Use `.derive()` to add context:

```typescript
import { createProtectedApi } from '../_core/auth/protected'
import { ItemService } from './service'

export const itemApi = createProtectedApi('/items')
  .derive(() => ({ 
    itemService: new ItemService() 
  }))

  .get('/', async (ctx) => {
    const { itemService, inertia } = ctx
    const items = await itemService.getAll()
    return inertia.render('items/Index', { items })
  })
```

---

## Common Patterns

### Public Routes (No Auth)

```typescript
import { Elysia } from 'elysia'
import { inertia } from '../../inertia/plugin'

export const publicApi = new Elysia({ prefix: '/public' })
  .use(inertia())
  .get('/', (ctx) => {
    return ctx.inertia.render('public/Index')
  })
```

### Auth Pages (Login/Register)

```typescript
import { Elysia } from 'elysia'
import { inertia } from '../../inertia/plugin'

export const authPagesApi = new Elysia({ prefix: '/auth' })
  .use(inertia())
  .get('/login', (ctx) => {
    return ctx.inertia.render('auth/Login', { errors: {} })
  })
```

### CRUD Routes Pattern

```typescript
import { createProtectedApi } from '../_core/auth/protected'
import { ItemService, CreateSchema, UpdateSchema } from './service'

export const itemApi = createProtectedApi('/items')
  .derive(() => ({ itemService: new ItemService() }))

  // List
  .get('/', async (ctx) => {
    const { inertia, itemService } = ctx
    const items = await itemService.getAll()
    const user = (ctx as any).user
    return inertia.render('items/Index', { items, user })
  })

  // Create form
  .get('/create', (ctx) => {
    return ctx.inertia.render('items/Create', { errors: {} })
  })

  // Store
  .post('/', async (ctx) => {
    const { body, itemService, inertia } = ctx
    await itemService.create(body)
    return inertia.redirect('/items')
  }, { body: CreateSchema })

  // Edit form
  .get('/:id/edit', async (ctx) => {
    const { params, itemService, inertia } = ctx
    const item = await itemService.getById(params.id)
    return inertia.render('items/Edit', { item, errors: {} })
  })

  // Update
  .put('/:id', async (ctx) => {
    const { params, body, itemService, inertia } = ctx
    await itemService.update(params.id, body)
    return inertia.redirect('/items')
  }, { body: UpdateSchema })

  // Delete
  .delete('/:id', async (ctx) => {
    const { params, itemService, inertia } = ctx
    await itemService.delete(params.id)
    return inertia.redirect('/items')
  })
```
