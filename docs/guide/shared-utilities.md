# Shared Utilities (`$shared/lib`)

Velist provides a set of commonly used utility functions in `$shared/lib/`. These are lightweight, tree-shakeable utilities available across your application.

## Available Utilities

```
src/shared/lib/
├── csv.ts       # CSV export functionality
├── debounce.ts  # Debounce functions
├── image.ts     # Image processing with Sharp
├── toast.ts     # Toast notifications
└── uuid.ts      # UUID v7 generator
```

---

## CSV Export

Export data to CSV/TSV format for Excel or data processing.

```typescript
import { downloadCSV, convertToCSV, convertToTSV } from '$shared/lib/csv'

// Download as CSV file
const data = [
  { name: 'John', email: 'john@example.com', role: 'admin' },
  { name: 'Jane', email: 'jane@example.com', role: 'user' }
]

downloadCSV('users', data)
// downloads: users.csv

// With custom headers
downloadCSV('users', data, {
  name: 'Full Name',
  email: 'Email Address',
  role: 'User Role'
})

// Convert to CSV string (for API response)
const csv = convertToCSV(data)

// Convert to TSV (Tab Separated) for Excel paste
const tsv = convertToTSV(data)
```

### API Reference

| Function | Description |
|----------|-------------|
| `convertToCSV(data, headers?)` | Convert array to CSV string |
| `downloadCSV(filename, data, headers?)` | Download as CSV file |
| `convertToTSV(data, headers?)` | Convert array to TSV string |

---

## Debounce

Delay function execution until after a wait period. Useful for search inputs.

```typescript
import { debounce, debounceAsync } from '$shared/lib/debounce'

// Basic debounce
const search = debounce((query: string) => {
  console.log('Searching:', query)
  // API call here
}, 300)

// In Svelte component
<input 
  type="text"
  oninput={(e) => search(e.currentTarget.value)}
/>

// Async debounce (for API calls)
const searchAPI = debounceAsync(async (query: string) => {
  const results = await fetch(`/api/search?q=${query}`)
  return results.json()
}, 300)

// Usage
const results = await searchAPI('javascript')
```

### API Reference

| Function | Description |
|----------|-------------|
| `debounce(fn, timeout?)` | Debounce regular function (default: 300ms) |
| `debounceAsync(fn, timeout?)` | Debounce async function, returns Promise |

---

## Toast Notifications

Simple toast notification system using Svelte store.

```typescript
import { toast } from '$shared/lib/toast'

// Show toast
toast.success('Saved successfully!')
toast.error('Something went wrong')
toast.warning('Please check your input')
toast.info('New update available')

// With custom duration (ms)
toast.success('Done!', 5000) // 5 seconds

// Direct store access (if needed)
import { toastStore } from '$shared/lib/toast'

// Add manual toast
const id = toastStore.add('Custom message', 'info', 3000)

// Remove specific
toastStore.remove(id)

// Clear all
toastStore.clear()
```

::: tip
`ToastContainer` is already included in `AppLayout`, so you just need to call `toast.xxx()`!
:::

---

## Image Processing

Process images with Sharp (resize, convert, compress).

```typescript
import { processImage, isImageMimeType } from '$shared/lib/image'

// In API route
.post('/upload', async (ctx) => {
  const { body } = ctx
  const file = body.image as File
  
  // Process image
  const processed = await processImage(file, {
    maxWidth: 1200,
    maxHeight: 1200,
    quality: 80,
    format: 'webp'
  })
  
  // processed.buffer - processed image data
  // processed.width - final width
  // processed.height - final height
  // processed.size - file size in bytes
  
  // Save to storage...
})

// Check if file is image
if (isImageMimeType(file.type)) {
  // Process image
}
```

### Options

```typescript
interface ImageProcessingOptions {
  maxWidth?: number   // Default: 1200
  maxHeight?: number  // Default: 1200
  quality?: number    // Default: 80 (0-100)
  format?: 'webp' | 'jpeg' | 'png'  // Default: 'webp'
}
```

::: warning
Requires `sharp` package: `bun add sharp`
:::

---

## UUID v7

Generate UUID v7 (time-ordered, sortable) without external dependencies.

```typescript
import { uuidv7, isValidUuidv7, getTimestampFromUuidv7, shortId } from '$shared/lib/uuid'

// Generate UUID v7
const id = uuidv7()
// Example: 018f3b7c-9e8e-7d3f-8b4c-3a2d1e5f6a7b

// Validate
isValidUuidv7('018f3b7c-9e8e-7d3f-8b4c-3a2d1e5f6a7b') // true
isValidUuidv7('invalid') // false

// Extract timestamp from UUID
const date = getTimestampFromUuidv7(id)
console.log(date) // Date object

// Generate short ID (URL-safe, 22 chars)
const short = shortId()
// Example: aB3xK9mN2pQ5rT8vW1yZ4c
```

### Why UUID v7?

- **Time-ordered**: Sortable by creation time
- **Database friendly**: Sequential inserts perform better
- **No external deps**: Uses native `crypto.getRandomValues()`
- **Standard compliant**: RFC 4122 variant

### Usage in Database

```typescript
import { uuidv7 } from '$shared/lib/uuid'

// In repository
async create(data: NewItem) {
  const id = uuidv7()
  await db
    .insertInto('items')
    .values({ id, ...data })
    .execute()
  return id
}
```

---

## Adding Custom Utilities

Create new utility in `src/shared/lib/`:

```typescript
// src/shared/lib/format.ts

/**
 * Format number as currency
 */
export function formatCurrency(value: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency
  }).format(value)
}

/**
 * Format date
 */
export function formatDate(date: Date | string, format = 'short'): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: format === 'short' ? 'short' : 'long',
    day: 'numeric'
  })
}
```

Import anywhere:

```typescript
import { formatCurrency, formatDate } from '$shared/lib/format'
```

---

## Best Practices

1. **Keep utilities pure** - No side effects, same input = same output
2. **Add JSDoc comments** - For IntelliSense and documentation
3. **Export individual functions** - Better tree-shaking
4. **Type everything** - Use TypeScript for all parameters and returns
5. **Test edge cases** - Empty arrays, null values, large inputs

## Tree Shaking

All utilities are tree-shakeable. Only imported code is bundled:

```typescript
// ✅ Only uuidv7 is included in bundle
import { uuidv7 } from '$shared/lib/uuid'

// ❌ Don't import everything
import * as uuid from '$shared/lib/uuid' // Imports all functions
```
