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
| Journal Mode | WAL (Write-Ahead Logging) |

---

## Database Architecture

Velist uses a **dual-schema approach**:

| File | Purpose | Used By |
|------|---------|---------|
| `schema.ts` | Drizzle ORM table definitions | Migrations (`bun run db:generate`) |
| `connection.ts` | Kysely TypeScript interface + connection | Runtime queries |

**Rule:** Always update both files when adding/modifying tables!

---

## Defining Schema

### 1. Add Table to Drizzle Schema

Edit `src/features/_core/database/schema.ts`:

```typescript
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

export const tasks = sqliteTable('tasks', {
  id: text('id').primaryKey(), // UUID v7
  userId: text('user_id').notNull().references(() => users.id),
  title: text('title').notNull(),
  status: text('status').notNull().default('pending'),
  createdAt: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').notNull().default(sql`CURRENT_TIMESTAMP`),
});
```

### 2. Add Interface to Kysely Schema

Edit `src/features/_core/database/connection.ts`:

```typescript
export interface DatabaseSchema {
  // ... existing tables
  
  tasks: {
    id: string
    user_id: string
    title: string
    status: 'pending' | 'completed'
    created_at: string
    updated_at: string
  }
}
```

### 3. Generate Migration

```bash
bun run db:generate
```

This creates a migration file in `src/features/_core/database/migrations/`

### 4. Run Migration

```bash
bun run db:migrate
```

---

## Existing Tables

### Users

```typescript
// schema.ts
export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  name: text('name').notNull(),
  role: text('role').notNull().default('user'),
  googleId: text('google_id').unique(),
  emailVerifiedAt: text('email_verified_at'),
  twoFactorSecret: text('two_factor_secret'),
  twoFactorEnabled: integer('two_factor_enabled').notNull().default(0),
  twoFactorConfirmedAt: text('two_factor_confirmed_at'),
  createdAt: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').notNull().default(sql`CURRENT_TIMESTAMP`),
});
```

### Sessions

```typescript
export const sessions = sqliteTable('sessions', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  payload: text('payload').notNull(),
  lastActivity: integer('last_activity').notNull(),
});
```

### Notifications

```typescript
export const notifications = sqliteTable('notifications', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id),
  type: text('type').notNull().default('info'),
  title: text('title').notNull(),
  message: text('message').notNull(),
  readAt: text('read_at'),
  createdAt: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
});
```

### Assets (File Uploads)

```typescript
export const assets = sqliteTable('assets', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id),
  filename: text('filename').notNull(),
  originalName: text('original_name').notNull(),
  mimeType: text('mime_type').notNull(),
  size: integer('size').notNull(),
  path: text('path').notNull(),
  url: text('url').notNull(),
  metadata: text('metadata'), // JSON: { width, height, format }
  createdAt: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
});
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
  
  async findByUser(userId: string) {
    return db.selectFrom('tasks')
      .where('user_id', '=', userId)
      .selectAll()
      .execute()
  }
  
  async create(data: { userId: string; title: string }) {
    const id = uuidv7()
    const now = new Date().toISOString()
    
    return db.insertInto('tasks')
      .values({
        id,
        user_id: data.userId,
        title: data.title,
        status: 'pending',
        created_at: now,
        updated_at: now
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

// With joins
const tasksWithUsers = await db.selectFrom('tasks')
  .innerJoin('users', 'users.id', 'tasks.user_id')
  .select(['tasks.id', 'tasks.title', 'users.name as user_name'])
  .execute()
```

### Insert

```typescript
const newUser = await db.insertInto('users')
  .values({
    id: uuidv7(),
    email: 'user@example.com',
    name: 'John',
    password_hash: await Bun.password.hash('password'),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
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

### Transactions

```typescript
await db.transaction().execute(async (trx) => {
  const user = await trx.insertInto('users')
    .values({ id: uuidv7(), email: 'test@example.com', ... })
    .returningAll()
    .executeTakeFirstOrThrow()
  
  await trx.insertInto('tasks')
    .values({ id: uuidv7(), user_id: user.id, ... })
    .execute()
})
```

---

## WAL Mode (Write-Ahead Logging)

Velist enables WAL mode by default for better performance:

```typescript
// connection.ts
sqliteDb.exec('PRAGMA journal_mode = WAL;')
```

**WAL creates 3 files:**
- `db.sqlite` - Main database
- `db.sqlite-wal` - Write-ahead log
- `db.sqlite-shm` - Shared memory

**Benefits:**
- Better concurrent read/write performance
- Faster writes (append to WAL instead of rewriting pages)
- Data integrity during crashes

**Important for Docker:**
Mount the entire `db/` folder, not individual files:

```yaml
# docker-compose.yml
volumes:
  - ./db:/app/db  # ✅ Mounts all 3 WAL files
```

---

## Migrations

### Generate Migration

```bash
bun run db:generate
```

Generates SQL from `schema.ts` changes.

### Run Migrations

```bash
bun run db:migrate
```

### Reset Database

```bash
bun run db:refresh  # Delete + migrate + seed
```

### Migration File Format

```sql
-- src/features/_core/database/migrations/0001_add_tasks.sql
CREATE TABLE tasks (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  title TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_tasks_user_id ON tasks(user_id);
```

---

## UUID v7

Use the built-in UUID v7 generator:

```typescript
import { uuidv7 } from '$shared/lib/uuid'

const id = uuidv7()  // Time-ordered, unique
```

**Benefits:**
- Time-ordered (sortable by creation time)
- No external dependencies
- Native Bun implementation

---

## Type Helpers

Use type helpers from `connection.ts`:

```typescript
import type { User, NewUser, UserUpdate } from '$features/_core/database/connection'

// Selectable - what you get from SELECT
const user: User = await db.selectFrom('users').selectAll().executeTakeFirst()

// Insertable - what you can INSERT
const newUser: NewUser = { email: 'test@test.com', ... }

// Updateable - what you can UPDATE
const update: UserUpdate = { name: 'New Name' }
```

---

## Timestamps

Use ISO strings for dates:

```typescript
const now = new Date().toISOString()
// → "2024-01-15T10:30:00.000Z"
```

Store as `TEXT` in SQLite. Default values using Drizzle:

```typescript
createdAt: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`)
```

---

## Best Practices

1. **Always use UUID v7** for primary keys
2. **Update both files** (`schema.ts` + `connection.ts`) when changing schema
3. **Use transactions** for multi-table operations
4. **Create indexes** for foreign keys and frequently queried columns
5. **Use repository pattern** - don't query directly from API handlers
6. **Enable foreign keys** - already enabled in `connection.ts`
