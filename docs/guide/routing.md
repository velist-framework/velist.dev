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

Use `authApi` and `.auth(true)` for authentication:

```typescript
import { authApi } from '../_core/auth/api'

export const protectedApi = new Elysia({ prefix: '/admin' })
  .use(authApi)      // Add auth context
  .auth(true)        // Require authentication
  .use(inertia())
  
  .get('/', (ctx) => {
    // Only authenticated users can access
    const user = (ctx as any).user
    return ctx.inertia.render('admin/Index', { user })
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
.use(authApi)
.derive(() => ({ 
  itemService: new ItemService() 
}))

.get('/', async (ctx) => {
  const { itemService, inertia } = ctx as any
  const items = await itemService.getAll()
  return inertia.render('items/Index', { items })
})
```
