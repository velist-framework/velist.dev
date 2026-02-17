# Forms

Handling forms with Inertia.js in Velist.

---

## useForm Hook

Inertia provides `useForm` for form handling:

```svelte
<script lang="ts">
  import { useForm } from '@inertiajs/svelte'
  
  interface Props {
    errors: Record<string, string>
  }
  
  let { errors }: Props = $props()
  
  const form = useForm({
    title: '',
    description: ''
  })
  
  function submit(e: Event) {
    e.preventDefault()
    $form.post('/items')
  }
</script>
```

---

## Create Form Example

```svelte
<form onsubmit={submit} class="space-y-4">
  <div>
    <label>Title</label>
    <input
      type="text"
      bind:value={$form.title}
      class="w-full border rounded-lg px-3 py-2"
    />
    {#if errors.title}
      <p class="text-red-600 text-sm">{errors.title}</p>
    {/if}
  </div>
  
  <div>
    <label>Description</label>
    <textarea
      bind:value={$form.description}
      rows="3"
      class="w-full border rounded-lg px-3 py-2"
    ></textarea>
  </div>
  
  <button
    type="submit"
    disabled={$form.processing}
    class="bg-indigo-600 text-white px-4 py-2 rounded-lg disabled:opacity-50"
  >
    {$form.processing ? 'Saving...' : 'Save'}
  </button>
</form>
```

---

## Edit Form Example

```svelte
<script lang="ts">
  import { useForm } from '@inertiajs/svelte'
  
  interface Props {
    item: { id: string; title: string; description: string }
    errors: Record<string, string>
  }
  
  let { item, errors }: Props = $props()
  
  const form = useForm({
    title: item.title,
    description: item.description
  })
  
  function submit(e: Event) {
    e.preventDefault()
    $form.put(`/items/${item.id}`)
  }
</script>
```

---

## Form Methods

| Method | Use For |
|--------|---------|
| `$form.post('/url')` | Create |
| `$form.put('/url')` | Update |
| `$form.patch('/url')` | Partial update |
| `$form.delete('/url')` | Delete |

---

## Delete with Confirmation

```svelte
<script lang="ts">
  import { router } from '@inertiajs/svelte'
  
  function deleteItem(id: string) {
    if (confirm('Are you sure?')) {
      router.delete(`/items/${id}`)
    }
  }
</script>

<button onclick={() => deleteItem(item.id)}>
  Delete
</button>
```

---

## Form States

```svelte
<p>Processing: {$form.processing}</p>
<p>Dirty: {$form.isDirty}</p>
<p>Errors: {JSON.stringify($form.errors)}</p>
```

---

## Validation Errors

Backend returns errors in page props:

```typescript
// api.ts
.post('/', async (ctx) => {
  try {
    await service.create(ctx.body)
    return ctx.inertia.redirect('/items')
  } catch (error: any) {
    return ctx.inertia.render('items/Create', {
      errors: { title: error.message }
    })
  }
}, { body: CreateSchema })
```

Display in page:

```svelte
{#if errors.title}
  <p class="text-red-600">{errors.title}</p>
{/if}
```
