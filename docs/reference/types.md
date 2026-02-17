# TypeScript Types

Common types and interfaces in Velist.

---

## Database Schema

### DatabaseSchema Interface

```typescript
// src/features/_core/database/connection.ts
export interface DatabaseSchema {
  users: {
    id: string
    email: string
    password_hash: string
    name: string
    role: string
    email_verified_at: string | null
    created_at: string
    updated_at: string
  }
  
  sessions: {
    id: string
    user_id: string
    ip_address: string
    user_agent: string
    payload: string
    last_activity: number
  }
  
  password_reset_tokens: {
    email: string
    token: string
    created_at: string
  }
}
```

---

## User Types

### User Interface

```typescript
interface User {
  id: string
  email: string
  name: string
  role: 'admin' | 'user'
  created_at: string
}
```

### Auth Context

```typescript
interface AuthContext {
  user: User
  session: Session
}
```

---

## Page Props

### Base Page Props

```typescript
interface PageProps {
  errors: Record<string, string>
  flash?: {
    success?: string
    error?: string
  }
}
```

### With Auth

```typescript
interface AuthenticatedPageProps extends PageProps {
  user: User
}
```

---

## Inertia Types

### Inertia Render

```typescript
interface Inertia {
  render: (component: string, props?: Record<string, any>) => Response
  redirect: (url: string) => Response
}
```

### Inertia Page

```typescript
interface InertiaPage<T = Record<string, any>> {
  component: string
  props: T
  url: string
  version: string
}
```

---

## Service Types

### Repository Pattern

```typescript
interface Repository<T> {
  findAll(): Promise<T[]>
  findById(id: string): Promise<T | undefined>
  create(data: Partial<T>): Promise<T>
  update(id: string, data: Partial<T>): Promise<T>
  delete(id: string): Promise<void>
}
```

### Service Layer

```typescript
interface Service<T, CreateDTO, UpdateDTO> {
  getAll(): Promise<T[]>
  getById(id: string): Promise<T | undefined>
  create(payload: CreateDTO): Promise<T>
  update(id: string, payload: UpdateDTO): Promise<T>
  delete(id: string): Promise<void>
}
```

---

## Elysia Context

### Context with Inertia

```typescript
import { Context } from 'elysia'

interface ContextWithInertia extends Context {
  inertia: Inertia
}
```

### Context with Auth

```typescript
interface ContextWithAuth extends Context {
  user: User
  session: Session
}
```

---

## Form Types

### UseForm

```typescript
interface UseForm<T> {
  data: T
  errors: Record<string, string>
  processing: boolean
  isDirty: boolean
  
  post(url: string): void
  put(url: string): void
  patch(url: string): void
  delete(url: string): void
}
```

---

## Utility Types

### Nullable

```typescript
type Nullable<T> = T | null
```

### Optional

```typescript
type Optional<T> = T | undefined
```

### UUID

```typescript
type UUID = string // UUID v7 format
```

### ISO8601

```typescript
type ISO8601 = string // ISO 8601 date string
```
