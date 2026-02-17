# Examples

Real-world examples and use cases for Velist.

---

## Available Examples

- [Complete CRUD](./crud) — Full CRUD with pagination and search
- [Authentication](./auth) — Custom auth implementation
- [File Upload](./file-upload) — Multi-file upload with progress
- [Real-time](./realtime) — Server-Sent Events implementation

---

## Quick Snippets

### Repository Pattern

```typescript
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
}
```

### Service with Validation

```typescript
export const CreateTaskSchema = t.Object({
  title: t.String({ minLength: 1 }),
  status: t.Union([t.Literal('pending'), t.Literal('done')])
})

export class TaskService {
  async create(payload: Static<typeof CreateTaskSchema>) {
    return this.repo.create(payload)
  }
}
```

### Protected API Route

```typescript
import { createProtectedApi } from '../_core/auth/protected'
import { TaskService } from './service'

export const taskApi = createProtectedApi('/tasks')
  .derive(() => ({ taskService: new TaskService() }))
  
  .get('/', async (ctx) => {
    const { inertia, taskService } = ctx
    const tasks = await taskService.getAll()
    const user = (ctx as any).user
    return ctx.inertia.render('tasks/Index', { tasks, user })
  })
```

### Svelte Page with AppLayout

```svelte
<script lang="ts">
  import AppLayout from '$shared/layouts/AppLayout.svelte'
  
  interface Props {
    user: { id: string; email: string; name: string }
    tasks: Array<{ id: string; title: string }>
  }
  let { user, tasks }: Props = $props()
</script>

<AppLayout title="Tasks" {user}>
  <ul>
    {#each tasks as task}
      <li>{task.title}</li>
    {/each}
  </ul>
</AppLayout>
```
