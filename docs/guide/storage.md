# File Storage

Velist provides a unified storage abstraction for local filesystem and S3-compatible storage.

---

## Overview

The storage layer is built with two design principles:

1. **Abstraction** - Same API regardless of storage backend
2. **Flexibility** - Switch between local and S3 via environment variable

```typescript
const storage = createStorage()

// Works with both local and S3
await storage.upload('path/to/file.png', fileBuffer, 'image/png')
const url = storage.getPublicUrl('path/to/file.png')
```

---

## Storage Providers

| Provider | Use Case | Pros | Cons |
|----------|----------|------|------|
| **Local** | Development, small apps | Simple, fast, no external dependency | Not scalable, server-bound |
| **S3** | Production, large files | Scalable, CDN-ready, presigned URLs | Requires S3 service, complexity |

---

## Configuration

### Local Storage (Default)

```bash
# .env
STORAGE_DRIVER=local
LOCAL_STORAGE_PATH=./storage
LOCAL_STORAGE_URL=/storage
```

Files are stored in `./storage/` directory and served via `/storage/` URL.

### S3 Storage

```bash
# .env
STORAGE_DRIVER=s3
S3_BUCKET=my-bucket
S3_REGION=us-east-1
S3_ENDPOINT=https://s3.wasabisys.com
S3_ACCESS_KEY=your-access-key
S3_SECRET_KEY=your-secret-key
CDN_URL=https://cdn.example.com  # Optional
```

Supports: AWS S3, Wasabi, MinIO, DigitalOcean Spaces

---

## Basic Usage

### Upload File

```typescript
import { createStorage } from '$features/_core/storage'

const storage = createStorage()

// From form upload
const formData = await request.formData()
const file = formData.get('file') as File

await storage.upload('uploads/photo.jpg', file, 'image/jpeg')
```

### Get Public URL

```typescript
const url = storage.getPublicUrl('uploads/photo.jpg')
// Local: /storage/uploads/photo.jpg
// S3: https://cdn.example.com/uploads/photo.jpg
```

### Delete File

```typescript
await storage.delete('uploads/photo.jpg')
```

### Check Existence

```typescript
const exists = await storage.exists('uploads/photo.jpg')
```

---

## Image Processing

For image uploads, use the built-in image processing utility:

```typescript
import { processImage } from '$shared/lib/image'

// Process before upload
const processed = await processImage(file, {
  maxWidth: 1200,
  maxHeight: 1200,
  quality: 80,
  format: 'webp'
})

// Upload processed buffer
await storage.upload('images/photo.webp', processed.buffer, 'image/webp')

// Access metadata
console.log(processed.width, processed.height, processed.size)
```

---

## Direct Upload (Presigned URLs)

For large files, use **presigned URLs** to let clients upload directly to S3:

### Why Presigned URLs?

| Approach | Best For | Bandwidth |
|----------|----------|-----------|
| Server Proxy | Small files (< 10MB) | Through server |
| Presigned URL | Large files, high traffic | Direct to S3 |

### Server - Generate URL

```typescript
import { createStorage } from '$features/_core/storage'
import { uuidv7 } from '$shared/lib/uuid'

.get('/presign', async (ctx) => {
  const storage = createStorage()
  
  if (!storage.getPresignedUploadUrl) {
    return ctx.json({ error: 'Not supported' }, 400)
  }
  
  const key = `uploads/${uuidv7()}.jpg`
  const url = await storage.getPresignedUploadUrl(
    key, 
    'image/jpeg', 
    300  // 5 minutes
  )
  
  return ctx.json({ url, key })
})
```

### Client - Direct Upload

```svelte
<script>
  async function uploadDirect(file) {
    // 1. Get presigned URL
    const { url, key } = await fetch('/uploads/presign').then(r => r.json())
    
    // 2. Upload directly to S3
    await fetch(url, {
      method: 'PUT',
      body: file,
      headers: { 'Content-Type': file.type }
    })
    
    // 3. Confirm to server
    await fetch('/uploads/confirm', {
      method: 'POST',
      body: JSON.stringify({ key, name: file.name })
    })
  }
</script>
```

---

## Database Integration

Store file metadata in the `assets` table:

```typescript
// repository.ts
export class AssetRepository {
  async create(data: {
    userId: string
    filename: string
    path: string
    url: string
    size: number
    mimeType: string
  }) {
    return db.insertInto('assets')
      .values({
        id: uuidv7(),
        user_id: data.userId,
        filename: data.filename,
        path: data.path,
        url: data.url,
        size: data.size,
        mime_type: data.mimeType,
        created_at: new Date().toISOString()
      })
      .returningAll()
      .executeTakeFirst()
  }
}
```

See [Complete CRUD Example](/examples/file-upload) for full implementation.

---

## Security Best Practices

1. **Validate file types** - Check mime type before upload
2. **Limit file size** - Reject files > max limit
3. **Sanitize filenames** - Generate UUIDs for storage keys
4. **Private files** - Use presigned URLs for access control
5. **Scan uploads** - Use virus scanner for user uploads

---

## Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `STORAGE_DRIVER` | No | `local` (default) or `s3` |
| `LOCAL_STORAGE_PATH` | No | Local storage directory (default: `./storage`) |
| `LOCAL_STORAGE_URL` | No | Public URL path (default: `/storage`) |
| `S3_BUCKET` | If S3 | S3 bucket name |
| `S3_REGION` | If S3 | S3 region |
| `S3_ENDPOINT` | If S3 | S3 endpoint URL |
| `S3_ACCESS_KEY` | If S3 | Access key |
| `S3_SECRET_KEY` | If S3 | Secret key |
| `CDN_URL` | No | CDN URL for public access |

---

## Related

- [File Upload Example](/examples/file-upload) — Complete implementation
- [Configuration](/reference/config) — Environment variables
