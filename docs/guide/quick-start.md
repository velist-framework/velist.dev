# Quick Start

This guide will walk you through building a **complete full-featured application** with Velist. Choose your path: let AI agents build 99% of it, or code it yourself to learn the internals.

## Prerequisites

- [Bun](https://bun.sh) >= 1.0.0 installed
- Basic knowledge of TypeScript and Svelte

## Create a New Project

One command creates everything — the installer handles cloning, dependencies, database setup, and environment configuration.

```bash
# Create project (interactive mode)
bun create velist my-app
```

The CLI will ask you:
- **Install dependencies?** (default: yes) — runs `bun install`
- **Setup database?** (default: yes) — runs migrations and seeds

Then simply:

```bash
cd my-app
bun run dev
```

Your app is now running at:
- **Application**: http://localhost:3000
- **Vite Dev Server**: http://localhost:5173

Default login: `admin@example.com` / `password123`

::: tip What the installer does for you
- ✅ Clones the starter template
- ✅ Initializes git repository
- ✅ Generates secure JWT secret in `.env`
- ✅ Updates `package.json` with your project name
- ✅ Installs dependencies (if selected)
- ✅ Runs database migrations & seeds (if selected)
:::

---

## Build Your Application

Now let's build a **complete Task Management Application**. Choose your path:

:::: tabs

### AI-Powered 🚀 (Recommended)

Describe your app. Agents build everything.

```
@workflow/agents/product.md

Build a Task Management SaaS for small teams.
Users can create tasks, assign to team members, 
set deadlines, and track progress.
```

**That's it.** The agents handle the rest:
- **Product** → Writes specs & user stories
- **Tech Lead** → Designs database & architecture  
- **Developer** → Codes all features
- **QA** → Tests everything
- **DevOps** → Deploys to production

You just review and say "yes" or "change this."

[Learn more about AI Workflow →](./workflow)

### Manual 💻

Build it yourself to understand the internals. Follow the steps below.

:::

---

### Manual Implementation

If you chose the manual route, here's how to build a Tasks application step by step. In Velist, everything lives in feature folders.

#### Step 1: Create Folder Structure

```bash
mkdir -p src/features/tasks/pages
touch src/features/tasks/{api.ts,service.ts,repository.ts}
touch src/features/tasks/pages/{Index.svelte,Create.svelte,Edit.svelte}
```

#### Step 2: Update Database Schema

Edit `src/features/_core/database/schema.ts`:

```typescript
import { sqliteTable, text } from 'drizzle-orm/sqlite-core'
import { sql } from 'drizzle-orm'

export const tasks = sqliteTable('tasks', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description'),
  status: text('status').notNull().default('pending'),
  createdAt: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').notNull().default(sql`CURRENT_TIMESTAMP`),
})
```

Then add TypeScript types to `src/features/_core/database/connection.ts`:

```typescript
export interface DatabaseSchema {
  // ... existing tables
  tasks: {
    id: string
    title: string
    description: string | null
    status: 'pending' | 'in_progress' | 'completed'
    created_at: string
    updated_at: string
  }
}
```

#### Step 3: Create Migration

```bash
bun run db:generate
bun run db:migrate
```

#### Step 4: Implement Repository

Create `src/features/tasks/repository.ts`:

```typescript
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
  
  async create(data: { title: string; description?: string }) {
    const id = uuidv7()
    const now = new Date().toISOString()
    return db.insertInto('tasks')
      .values({ 
        id, 
        ...data, 
        status: 'pending',
        created_at: now,
        updated_at: now 
      })
      .returningAll()
      .executeTakeFirst()
  }
  
  async update(id: string, data: Partial<{ title: string; description: string; status: string }>) {
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

#### Step 5: Implement Service

Create `src/features/tasks/service.ts`:

```typescript
import { t, type Static } from 'elysia'
import { TaskRepository } from './repository'

export const CreateTaskSchema = t.Object({
  title: t.String({ minLength: 1, maxLength: 255 }),
  description: t.Optional(t.String())
}, { additionalProperties: false })

export const UpdateTaskSchema = t.Partial(t.Object({
  title: t.String({ minLength: 1, maxLength: 255 }),
  description: t.Optional(t.String()),
  status: t.Union([
    t.Literal('pending'),
    t.Literal('in_progress'),
    t.Literal('completed')
  ])
}))

export type CreateTaskPayload = Static<typeof CreateTaskSchema>
export type UpdateTaskPayload = Static<typeof UpdateTaskSchema>

export class TaskService {
  constructor(private repo: TaskRepository = new TaskRepository()) {}
  
  async getAll() {
    return this.repo.findAll()
  }
  
  async getById(id: string) {
    return this.repo.findById(id)
  }
  
  async create(payload: CreateTaskPayload) {
    return this.repo.create(payload)
  }
  
  async update(id: string, payload: UpdateTaskPayload) {
    return this.repo.update(id, payload)
  }
  
  async delete(id: string) {
    return this.repo.delete(id)
  }
}
```

#### Step 6: Implement API Routes

Create `src/features/tasks/api.ts`:

```typescript
import { createProtectedApi } from '../_core/auth/protected'
import { TaskService, CreateTaskSchema, UpdateTaskSchema } from './service'

export const taskApi = createProtectedApi('/tasks')
  .derive(() => ({ taskService: new TaskService() }))
  
  // List all tasks
  .get('/', async (ctx) => {
    const { inertia, taskService } = ctx
    const tasks = await taskService.getAll()
    const user = (ctx as any).user
    return inertia.render('tasks/Index', { tasks, user })
  })
  
  // Show create form
  .get('/create', (ctx) => {
    return ctx.inertia.render('tasks/Create', { errors: {} })
  })
  
  // Store new task
  .post('/', async (ctx) => {
    const { body, taskService, inertia } = ctx
    try {
      await taskService.create(body)
      return inertia.redirect('/tasks')
    } catch (error: any) {
      return inertia.render('tasks/Create', { errors: { message: error.message } })
    }
  }, { body: CreateTaskSchema })
  
  // Show edit form
  .get('/:id/edit', async (ctx) => {
    const { params, taskService, inertia } = ctx
    const task = await taskService.getById(params.id)
    if (!task) {
      return inertia.render('errors/404', { path: ctx.request.url })
    }
    return inertia.render('tasks/Edit', { task, errors: {} })
  })
  
  // Update task
  .put('/:id', async (ctx) => {
    const { params, body, taskService, inertia } = ctx
    try {
      await taskService.update(params.id, body)
      return inertia.redirect('/tasks')
    } catch (error: any) {
      const task = await taskService.getById(params.id)
      return inertia.render('tasks/Edit', { 
        task, 
        errors: { message: error.message } 
      })
    }
  }, { body: UpdateTaskSchema })
  
  // Delete task
  .delete('/:id', async (ctx) => {
    const { params, taskService, inertia } = ctx
    await taskService.delete(params.id)
    return inertia.redirect('/tasks')
  })
```

#### Step 7: Create Svelte Pages

**Index.svelte** (`src/features/tasks/pages/Index.svelte`):

```svelte
<script lang="ts">
  import { useForm } from '@inertiajs/svelte'
  import { Plus, Pencil, Trash } from 'lucide-svelte'
  import AppLayout from '$shared/layouts/AppLayout.svelte'
  
  interface Props {
    user: { id: string; email: string; name: string }
    tasks: Array<{
      id: string
      title: string
      description: string | null
      status: string
    }>
  }
  
  let { user, tasks }: Props = $props()
  
  const deleteForm = useForm({})
  
  function deleteTask(id: string) {
    if (confirm('Delete this task?')) {
      $deleteForm.delete(`/tasks/${id}`)
    }
  }
  
  function statusBadgeClass(status: string) {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'in_progress': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      default: return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
    }
  }
</script>

<AppLayout title="Tasks" {user}>
  <div class="p-6 max-w-5xl mx-auto">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold text-slate-900 dark:text-white">Tasks</h1>
      <a href="/tasks/create" class="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
        <Plus class="w-4 h-4" />
        New Task
      </a>
    </div>
    
    <div class="bg-white dark:bg-slate-800 rounded-lg shadow overflow-hidden">
      <table class="w-full">
        <thead class="bg-slate-50 dark:bg-slate-700">
          <tr>
            <th class="px-4 py-3 text-left text-sm font-medium text-slate-700 dark:text-slate-300">Title</th>
            <th class="px-4 py-3 text-left text-sm font-medium text-slate-700 dark:text-slate-300">Status</th>
            <th class="px-4 py-3 text-right text-sm font-medium text-slate-700 dark:text-slate-300">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-200 dark:divide-slate-700">
          {#each tasks as task}
            <tr>
              <td class="px-4 py-3">
                <div class="text-slate-900 dark:text-white font-medium">{task.title}</div>
                {#if task.description}
                  <div class="text-sm text-slate-500 dark:text-slate-400">{task.description}</div>
                {/if}
              </td>
              <td class="px-4 py-3">
                <span class="inline-flex px-2 py-1 text-xs rounded-full {statusBadgeClass(task.status)}">
                  {task.status}
                </span>
              </td>
              <td class="px-4 py-3 text-right">
                <div class="flex justify-end gap-2">
                  <a href="/tasks/{task.id}/edit" class="p-1 text-slate-600 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400">
                    <Pencil class="w-4 h-4" />
                  </a>
                  <button onclick={() => deleteTask(task.id)} class="p-1 text-slate-600 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400">
                    <Trash class="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
      
      {#if tasks.length === 0}
        <div class="p-8 text-center text-slate-500 dark:text-slate-400">
          No tasks yet. Create your first task!
        </div>
      {/if}
    </div>
  </div>
</AppLayout>
```

**Create.svelte** (`src/features/tasks/pages/Create.svelte`):

```svelte
<script lang="ts">
  import { useForm } from '@inertiajs/svelte'
  import AppLayout from '$shared/layouts/AppLayout.svelte'
  
  interface Props {
    user: { id: string; email: string; name: string }
    errors: Record<string, string>
  }
  
  let { user, errors }: Props = $props()
  
  const form = useForm({
    title: '',
    description: ''
  })
  
  function submit(e: Event) {
    e.preventDefault()
    $form.post('/tasks')
  }
</script>

<AppLayout title="New Task" {user}>
  <div class="p-6 max-w-2xl mx-auto">
    <h1 class="text-2xl font-bold text-slate-900 dark:text-white mb-6">New Task</h1>
    
    <form onsubmit={submit} class="bg-white dark:bg-slate-800 rounded-lg shadow p-6 space-y-4">
      <div>
        <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Title</label>
        <input
          type="text"
          bind:value={$form.title}
          class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
          required
        />
        {#if errors.title}
          <p class="mt-1 text-sm text-red-600">{errors.title}</p>
        {/if}
      </div>
      
      <div>
        <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Description</label>
        <textarea
          bind:value={$form.description}
          rows="3"
          class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
        ></textarea>
      </div>
      
      <div class="flex gap-3 pt-4">
        <button
          type="submit"
          disabled={$form.processing}
          class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
        >
          {$form.processing ? 'Creating...' : 'Create Task'}
        </button>
        <a href="/tasks" class="px-4 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700">
          Cancel
        </a>
      </div>
    </form>
  </div>
</AppLayout>
```

**Edit.svelte** (`src/features/tasks/pages/Edit.svelte`):

```svelte
<script lang="ts">
  import { useForm } from '@inertiajs/svelte'
  import AppLayout from '$shared/layouts/AppLayout.svelte'
  
  interface Props {
    user: { id: string; email: string; name: string }
    task: {
      id: string
      title: string
      description: string | null
      status: string
    }
    errors: Record<string, string>
  }
  
  let { user, task, errors }: Props = $props()
  
  const form = useForm({
    title: task.title,
    description: task.description || '',
    status: task.status
  })
  
  function submit(e: Event) {
    e.preventDefault()
    $form.put(`/tasks/${task.id}`)
  }
</script>

<AppLayout title="Edit Task" {user}>
  <div class="p-6 max-w-2xl mx-auto">
    <h1 class="text-2xl font-bold text-slate-900 dark:text-white mb-6">Edit Task</h1>
    
    <form onsubmit={submit} class="bg-white dark:bg-slate-800 rounded-lg shadow p-6 space-y-4">
      <div>
        <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Title</label>
        <input
          type="text"
          bind:value={$form.title}
          class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
          required
        />
      </div>
      
      <div>
        <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Description</label>
        <textarea
          bind:value={$form.description}
          rows="3"
          class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
        ></textarea>
      </div>
      
      <div>
        <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Status</label>
        <select
          bind:value={$form.status}
          class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
        >
          <option value="pending">Pending</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>
      </div>
      
      <div class="flex gap-3 pt-4">
        <button
          type="submit"
          disabled={$form.processing}
          class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
        >
          {$form.processing ? 'Saving...' : 'Save Changes'}
        </button>
        <a href="/tasks" class="px-4 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700">
          Cancel
        </a>
      </div>
    </form>
  </div>
</AppLayout>
```

#### Step 8: Mount in Bootstrap

Add to `src/bootstrap.ts`:

```typescript
import { taskApi } from './features/tasks/api'

// ... existing code ...

app.use(taskApi)
```

---

## Test Your Feature

1. Visit http://localhost:3000/tasks
2. Login with default credentials
3. Create, edit, and delete tasks

---

## Development Workflow

```bash
# Start dev server (backend + frontend)
bun run dev

# Run type checking
bun run typecheck

# Reset database
bun run db:refresh

# Run E2E tests
npx playwright test
```

---

## What's Next?

- [Project Structure](./structure) — Understand the architecture
- [Vertical Slicing](./vertical-slicing) — Learn the philosophy
- [Routing](./routing) — Advanced routing patterns
- [Authentication](./authentication) — Customize auth
