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

### API Route

```typescript
export const taskApi = new Elysia({ prefix: '/tasks' })
  .use(authApi)
  .auth(true)
  .use(inertia())
  
  .get('/', async (ctx) => {
    const tasks = await service.getAll()
    return ctx.inertia.render('tasks/Index', { tasks })
  })
```

### Svelte Page

```svelte
<script lang="ts">
  interface Props {
    tasks: Array<{ id: string; title: string }>
  }
  let { tasks }: Props = $props()
</script>

<ul>
  {#each tasks as task}
    <li>{task.title}</li>
  {/each}
</ul>
```
