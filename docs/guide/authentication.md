# Authentication

Velist includes built-in JWT-based authentication.

---

## Features

- JWT tokens stored in HTTP-only cookies
- 7-day expiration (30 days with "remember me")
- Password hashing with Bun.password
- Protected routes with `.auth()` macro

---

## Default Credentials

After seeding:

```
Email: admin@example.com
Password: password123
```

---

## Protecting Routes

Use `authApi` and `.auth(true)`:

```typescript
import { Elysia } from 'elysia'
import { authApi } from '../_core/auth/api'
import { inertia } from '../../inertia/plugin'

export const protectedApi = new Elysia({ prefix: '/dashboard' })
  .use(authApi)      // Add auth context
  .auth(true)        // Require authentication
  .use(inertia())
  
  .get('/', (ctx) => {
    // Only authenticated users can access
    const user = (ctx as any).user
    return ctx.inertia.render('dashboard/Index', { user })
  })
```

---

## Accessing Current User

```typescript
.get('/profile', (ctx) => {
  const user = (ctx as any).user
  // { id, email, name, role }
  
  return ctx.inertia.render('profile/Index', { user })
})
```

---

## Auth Pages

Default auth pages are in `features/_core/auth/pages/`:

- `Login.svelte`
- `Register.svelte`

---

## Password Hashing

Use Bun's native password utilities:

```typescript
// Hash password
const hashed = await Bun.password.hash(password)

// Verify password
const valid = await Bun.password.verify(password, hashed)
```

---

## Login Flow

1. User submits credentials
2. Server verifies email and password
3. JWT token generated and stored in cookie
4. User redirected to intended page

---

## Logout Flow

```typescript
.post('/logout', (ctx) => {
  // Clear cookie
  ctx.cookie.auth.remove()
  return ctx.inertia.redirect('/auth/login')
})
```

---

## Customizing Auth

Auth logic is in `features/_core/auth/`:

| File | Purpose |
|------|---------|
| `api.ts` | Login, register, logout routes |
| `service.ts` | Auth business logic |
| `repository.ts` | User database queries |

Modify these files to customize authentication behavior.
