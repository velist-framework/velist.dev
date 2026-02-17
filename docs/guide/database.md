# Database

Velist uses SQLite with Kysely for type-safe queries and Drizzle for migrations.

---

## Stack

| Component | Technology |
|-----------|------------|
| Database | SQLite (bun:sqlite) |
| Query Builder | Kysely |
| Migrations | Drizzle ORM |
| IDs | UUID v7 |

---

## Database Schema

Define your schema in `src/features/_core/database/connection.ts`:

```typescript
export interface DatabaseSchema {
  users: {
    id: string
    email: string
    password_hash: string
    name: string
    role: string
    created_at: string
    updated_at: string
  }
  
  // Add your tables here
  tasks: {
    id: string
    title: string
    status: 'pending' | 'completed'
    created_at: string
  }
}
```

---

## Repository Pattern

Create a repository for database access:

```typescript
// src/features/tasks/repository.ts
import { db } from '../_core/database/connection'
import { uuidv7 } from '../../shared/lib/uuid'

export class TaskRepository {
  async findAll() {
    return db.selectFrom('tasks').selectAll().execute()
  }
  
  async findById(id: string) {
    return db.selectFrom('tasks')
      .where('id', '=', id)
      .selectAll()
      .executeTakeFirst()
  }
  
  async create(data: { title: string }) {
    const id = uuidv7()
    const now = new Date().toISOString()
    
    return db.insertInto('tasks')
      .values({
        id,
        title: data.title,
        status: 'pending',
        created_at: now
      })
      .returningAll()
      .executeTakeFirst()
  }
  
  async update(id: string, data: Partial<Record<string, any>>) {
    return db.updateTable('tasks')
      .set({ ...data, updated_at: new Date().toISOString() })
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirst()
  }
  
  async delete(id: string) {
    return db.deleteFrom('tasks').where('id', '=', id).execute()
  }
}
```

---

## Migrations

### Generate Migration

```bash
bun run db:generate
```

### Run Migrations

```bash
bun run db:migrate
```

### Reset Database

```bash
bun run db:refresh  # Delete + migrate + seed
```

---

## Kysely Queries

### Select

```typescript
// All records
const users = await db.selectFrom('users').selectAll().execute()

// Single record
const user = await db.selectFrom('users')
  .where('id', '=', id)
  .selectAll()
  .executeTakeFirst()

// Select specific columns
const emails = await db.selectFrom('users')
  .select(['id', 'email'])
  .execute()
```

### Insert

```typescript
const newUser = await db.insertInto('users')
  .values({
    id: uuidv7(),
    email: 'user@example.com',
    name: 'John',
    created_at: new Date().toISOString()
  })
  .returningAll()
  .executeTakeFirst()
```

### Update

```typescript
const updated = await db.updateTable('users')
  .set({ name: 'Jane', updated_at: new Date().toISOString() })
  .where('id', '=', id)
  .returningAll()
  .executeTakeFirst()
```

### Delete

```typescript
await db.deleteFrom('users').where('id', '=', id).execute()
```

---

## UUID v7

Use the built-in UUID v7 generator:

```typescript
import { uuidv7 } from '$shared/lib/uuid'

const id = uuidv7()  // Time-ordered, unique
```

Benefits:
- Time-ordered (sortable by creation time)
- No external dependencies
- Native Bun implementation

---

## Timestamps

Use ISO strings for dates:

```typescript
const now = new Date().toISOString()
// → "2024-01-15T10:30:00.000Z"
```

Store as `TEXT` in SQLite.
