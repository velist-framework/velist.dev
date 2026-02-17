# Complete CRUD Example

Full CRUD implementation with pagination and search.

---

## Overview

Building a **Products** feature with:
- List with pagination
- Search/filter
- Create, Edit, Delete
- Form validation

---

## Database Schema

```typescript
// Add to DatabaseSchema
products: {
  id: string
  name: string
  description: string | null
  price: number
  stock: number
  category: string
  created_at: string
  updated_at: string
}
```

---

## Repository

```typescript
// src/features/products/repository.ts
import { db } from '../_core/database/connection'
import { uuidv7 } from '../../shared/lib/uuid'

export class ProductRepository {
  async findAll(options: { 
    page?: number
    limit?: number
    search?: string
    category?: string
  } = {}) {
    const { page = 1, limit = 10, search, category } = options
    
    let query = db.selectFrom('products')
    
    if (search) {
      query = query.where('name', 'like', `%${search}%`)
    }
    
    if (category) {
      query = query.where('category', '=', category)
    }
    
    const total = await query
      .select(db.fn.count('id').as('count'))
      .executeTakeFirst()
    
    const items = await query
      .selectAll()
      .limit(limit)
      .offset((page - 1) * limit)
      .execute()
    
    return {
      items,
      total: Number(total?.count || 0),
      page,
      limit,
      totalPages: Math.ceil(Number(total?.count || 0) / limit)
    }
  }
  
  async findById(id: string) {
    return db.selectFrom('products')
      .where('id', '=', id)
      .selectAll()
      .executeTakeFirst()
  }
  
  async create(data: { name: string; price: number; stock: number; category: string }) {
    const id = uuidv7()
    const now = new Date().toISOString()
    
    return db.insertInto('products')
      .values({ ...data, id, description: null, created_at: now, updated_at: now })
      .returningAll()
      .executeTakeFirst()
  }
  
  async update(id: string, data: Partial<Record<string, any>>) {
    return db.updateTable('products')
      .set({ ...data, updated_at: new Date().toISOString() })
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirst()
  }
  
  async delete(id: string) {
    return db.deleteFrom('products').where('id', '=', id).execute()
  }
  
  async getCategories() {
    const result = await db.selectFrom('products')
      .select('category')
      .distinct()
      .execute()
    return result.map(r => r.category)
  }
}
```

---

## Service

```typescript
// src/features/products/service.ts
import { t, type Static } from 'elysia'
import { ProductRepository } from './repository'

export const CreateProductSchema = t.Object({
  name: t.String({ minLength: 1, maxLength: 255 }),
  price: t.Number({ minimum: 0 }),
  stock: t.Number({ minimum: 0 }),
  category: t.String({ minLength: 1 })
})

export const UpdateProductSchema = t.Partial(CreateProductSchema)

export type CreateProductPayload = Static<typeof CreateProductSchema>

export class ProductService {
  constructor(private repo: ProductRepository = new ProductRepository()) {}
  
  async getAll(options: Parameters<ProductRepository['findAll']>[0]) {
    return this.repo.findAll(options)
  }
  
  async getById(id: string) {
    return this.repo.findById(id)
  }
  
  async create(payload: CreateProductPayload) {
    return this.repo.create(payload)
  }
  
  async update(id: string, payload: any) {
    return this.repo.update(id, payload)
  }
  
  async delete(id: string) {
    return this.repo.delete(id)
  }
  
  async getCategories() {
    return this.repo.getCategories()
  }
}
```

---

## API Routes

```typescript
// src/features/products/api.ts
import { Elysia } from 'elysia'
import { authApi } from '../_core/auth/api'
import { ProductService, CreateProductSchema, UpdateProductSchema } from './service'
import { inertia, type Inertia } from '../../inertia/plugin'

export const productApi = new Elysia({ prefix: '/products' })
  .use(authApi)
  .auth(true)
  .use(inertia())
  .derive(() => ({ productService: new ProductService() }))
  
  // List with pagination
  .get('/', async (ctx) => {
    const { inertia, productService, query } = ctx as any
    
    const page = Number(query.page) || 1
    const search = query.search || ''
    const category = query.category || ''
    
    const [result, categories] = await Promise.all([
      productService.getAll({ page, limit: 10, search, category }),
      productService.getCategories()
    ])
    
    return inertia.render('products/Index', {
      ...result,
      categories,
      filters: { search, category }
    })
  })
  
  // Create form
  .get('/create', async (ctx) => {
    const { inertia, productService } = ctx as any
    const categories = await productService.getCategories()
    return inertia.render('products/Create', { categories, errors: {} })
  })
  
  // Store
  .post('/', async (ctx) => {
    const { body, productService, inertia } = ctx as any
    await productService.create(body)
    return inertia.redirect('/products')
  }, { body: CreateProductSchema })
  
  // Edit form
  .get('/:id/edit', async (ctx) => {
    const { params, productService, inertia } = ctx as any
    const [product, categories] = await Promise.all([
      productService.getById(params.id),
      productService.getCategories()
    ])
    return inertia.render('products/Edit', { product, categories, errors: {} })
  })
  
  // Update
  .put('/:id', async (ctx) => {
    const { params, body, productService, inertia } = ctx as any
    await productService.update(params.id, body)
    return inertia.redirect('/products')
  }, { body: UpdateProductSchema })
  
  // Delete
  .delete('/:id', async (ctx) => {
    const { params, productService, inertia } = ctx as any
    await productService.delete(params.id)
    return inertia.redirect('/products')
  })
```

---

## Index Page (with Pagination)

```svelte
<!-- src/features/products/pages/Index.svelte -->
<script lang="ts">
  import { router } from '@inertiajs/svelte'
  import { Plus, Pencil, Trash, ChevronLeft, ChevronRight } from 'lucide-svelte'
  
  interface Props {
    items: Array<{
      id: string
      name: string
      price: number
      stock: number
      category: string
    }>
    total: number
    page: number
    limit: number
    totalPages: number
    categories: string[]
    filters: { search: string; category: string }
  }
  
  let { items, total, page, totalPages, categories, filters }: Props = $props()
  
  let searchQuery = $state(filters.search)
  let selectedCategory = $state(filters.category)
  
  function applyFilters() {
    const params = new URLSearchParams()
    if (searchQuery) params.set('search', searchQuery)
    if (selectedCategory) params.set('category', selectedCategory)
    router.get(`/products?${params.toString()}`)
  }
  
  function goToPage(newPage: number) {
    const params = new URLSearchParams(window.location.search)
    params.set('page', newPage.toString())
    router.get(`/products?${params.toString()}`)
  }
  
  function deleteProduct(id: string) {
    if (confirm('Delete this product?')) {
      router.delete(`/products/${id}`)
    }
  }
  
  function formatPrice(price: number) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price)
  }
</script>

<div class="p-6 max-w-6xl mx-auto">
  <div class="flex justify-between items-center mb-6">
    <h1 class="text-2xl font-bold text-slate-900 dark:text-white">
      Products ({total})
    </h1>
    <a href="/products/create" class="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
      <Plus class="w-4 h-4" />
      Add Product
    </a>
  </div>
  
  <!-- Filters -->
  <div class="flex gap-4 mb-6">
    <input
      type="text"
      placeholder="Search products..."
      bind:value={searchQuery}
      onchange={applyFilters}
      class="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
    />
    
    <select
      bind:value={selectedCategory}
      onchange={applyFilters}
      class="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
    >
      <option value="">All Categories</option>
      {#each categories as cat}
        <option value={cat}>{cat}</option>
      {/each}
    </select>
  </div>
  
  <!-- Table -->
  <div class="bg-white dark:bg-slate-800 rounded-lg shadow overflow-hidden">
    <table class="w-full">
      <thead class="bg-slate-50 dark:bg-slate-700">
        <tr>
          <th class="px-4 py-3 text-left">Name</th>
          <th class="px-4 py-3 text-left">Category</th>
          <th class="px-4 py-3 text-right">Price</th>
          <th class="px-4 py-3 text-right">Stock</th>
          <th class="px-4 py-3 text-right">Actions</th>
        </tr>
      </thead>
      <tbody class="divide-y divide-slate-200 dark:divide-slate-700">
        {#each items as product}
          <tr>
            <td class="px-4 py-3 text-slate-900 dark:text-white">{product.name}</td>
            <td class="px-4 py-3">
              <span class="px-2 py-1 text-xs rounded-full bg-slate-100 dark:bg-slate-700">
                {product.category}
              </span>
            </td>
            <td class="px-4 py-3 text-right">{formatPrice(product.price)}</td>
            <td class="px-4 py-3 text-right">
              <span class={product.stock < 10 ? 'text-red-600' : ''}>
                {product.stock}
              </span>
            </td>
            <td class="px-4 py-3 text-right">
              <div class="flex justify-end gap-2">
                <a href="/products/{product.id}/edit" class="p-1 text-slate-600 hover:text-indigo-600">
                  <Pencil class="w-4 h-4" />
                </a>
                <button onclick={() => deleteProduct(product.id)} class="p-1 text-slate-600 hover:text-red-600">
                  <Trash class="w-4 h-4" />
                </button>
              </div>
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
    
    {#if items.length === 0}
      <div class="p-8 text-center text-slate-500">No products found</div>
    {/if}
  </div>
  
  <!-- Pagination -->
  {#if totalPages > 1}
    <div class="flex justify-center items-center gap-2 mt-6">
      <button
        disabled={page <= 1}
        onclick={() => goToPage(page - 1)}
        class="p-2 border rounded-lg disabled:opacity-50"
      >
        <ChevronLeft class="w-4 h-4" />
      </button>
      
      <span class="text-slate-600 dark:text-slate-400">
        Page {page} of {totalPages}
      </span>
      
      <button
        disabled={page >= totalPages}
        onclick={() => goToPage(page + 1)}
        class="p-2 border rounded-lg disabled:opacity-50"
      >
        <ChevronRight class="w-4 h-4" />
      </button>
    </div>
  {/if}
</div>
```
