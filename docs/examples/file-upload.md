# File Upload Example

Complete file upload implementation with image processing and storage abstraction.

---

## Architecture Overview

```
features/_core/storage/     ← Infrastructure (like database)
├── index.ts               ← Storage interface & factory
├── local.ts               ← Local filesystem storage
└── s3.ts                  ← S3/Wasabi compatible

features/uploads/          ← Upload feature
├── api.ts
├── service.ts
├── repository.ts          ← assets table
└── pages/
    └── Index.svelte

features/products/         ← Feature with images
└── assets/
    ├── service.ts        ← Product-specific upload logic
    └── repository.ts     ← product_images table
```

---

## Step 1: Database Schema

### Assets Table (for uploads/)

```typescript
// src/features/_core/database/schema.ts
import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core'
import { sql } from 'drizzle-orm'

export const assets = sqliteTable('assets', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  filename: text('filename').notNull(),
  originalName: text('original_name').notNull(),
  mimeType: text('mime_type').notNull(),
  size: integer('size').notNull(),
  path: text('path').notNull(),
  url: text('url').notNull(),
  metadata: text('metadata'), // JSON: { width, height, format }
  createdAt: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
})
```

### Product Images Table (for products/)

```typescript
// Add to schema.ts
export const productImages = sqliteTable('product_images', {
  id: text('id').primaryKey(),
  productId: text('product_id').notNull(),
  assetId: text('asset_id').notNull(),
  sortOrder: integer('sort_order').default(0),
  createdAt: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
})
```

---

## Step 2: Storage Infrastructure

### Storage Interface

```typescript
// src/features/_core/storage/index.ts
import { File as BunFile } from 'bun'

export interface StorageProvider {
  upload(key: string, file: BunFile | Buffer, contentType?: string): Promise<void>
  get(key: string): Promise<Buffer>
  exists(key: string): Promise<boolean>
  delete(key: string): Promise<void>
  getPublicUrl(key: string): string
}

// Factory - choose storage based on env
export function createStorage(): StorageProvider {
  const driver = process.env.STORAGE_DRIVER || 'local'
  
  if (driver === 's3') {
    const { S3Storage } = require('./s3')
    return new S3Storage()
  }
  
  const { LocalStorage } = require('./local')
  return new LocalStorage()
}
```

### Local Storage

```typescript
// src/features/_core/storage/local.ts
import { writeFile, readFile, access, unlink, mkdir } from 'fs/promises'
import { join, dirname } from 'path'
import type { StorageProvider } from './index'

export class LocalStorage implements StorageProvider {
  private basePath = process.env.LOCAL_STORAGE_PATH || './storage'
  private publicUrl = process.env.LOCAL_STORAGE_URL || '/storage'

  async upload(key: string, file: File | Buffer, contentType?: string): Promise<void> {
    const filePath = join(this.basePath, key)
    await mkdir(dirname(filePath), { recursive: true })
    
    if (file instanceof Buffer) {
      await writeFile(filePath, file)
    } else {
      await Bun.write(filePath, file)
    }
  }

  async get(key: string): Promise<Buffer> {
    const filePath = join(this.basePath, key)
    return readFile(filePath)
  }

  async exists(key: string): Promise<boolean> {
    try {
      await access(join(this.basePath, key))
      return true
    } catch {
      return false
    }
  }

  async delete(key: string): Promise<void> {
    await unlink(join(this.basePath, key))
  }

  getPublicUrl(key: string): string {
    return `${this.publicUrl.replace(/\/$/, '')}/${key}`
  }
}
```

### S3 Storage

**Required packages:**
```bash
bun add @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
```

```typescript
// src/features/_core/storage/s3.ts
import { 
  S3Client, 
  PutObjectCommand, 
  GetObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand 
} from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import type { StorageProvider } from './index'

export class S3Storage implements StorageProvider {
  private client: S3Client
  private bucket: string
  private cdnUrl?: string

  constructor() {
    this.bucket = process.env.S3_BUCKET!
    this.cdnUrl = process.env.CDN_URL
    
    this.client = new S3Client({
      region: process.env.S3_REGION,
      endpoint: process.env.S3_ENDPOINT,
      credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY!,
        secretAccessKey: process.env.S3_SECRET_KEY!,
      },
      forcePathStyle: true,
    })
  }

  async upload(key: string, file: File | Buffer, contentType?: string): Promise<void> {
    let buffer: Buffer
    if (file instanceof Buffer) {
      buffer = file
    } else {
      buffer = Buffer.from(await (file as File).arrayBuffer())
    }
    
    await this.client.send(new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      Body: buffer,
      ContentType: contentType || 'application/octet-stream',
      ACL: 'public-read',
    }))
  }

  async get(key: string): Promise<Buffer> {
    const response = await this.client.send(new GetObjectCommand({
      Bucket: this.bucket,
      Key: key,
    }))
    
    const stream = response.Body as ReadableStream
    const chunks: Uint8Array[] = []
    
    for await (const chunk of stream) {
      chunks.push(chunk)
    }
    
    return Buffer.concat(chunks)
  }

  async exists(key: string): Promise<boolean> {
    try {
      await this.client.send(new HeadObjectCommand({
        Bucket: this.bucket,
        Key: key,
      }))
      return true
    } catch {
      return false
    }
  }

  async delete(key: string): Promise<void> {
    await this.client.send(new DeleteObjectCommand({
      Bucket: this.bucket,
      Key: key,
    }))
  }

  getPublicUrl(key: string): string {
    if (this.cdnUrl) {
      return `${this.cdnUrl.replace(/\/$/, '')}/${key}`
    }
    return `${process.env.S3_ENDPOINT}/${this.bucket}/${key}`
  }

  /**
   * Generate presigned URL for direct upload from client
   * Client uploads directly to S3, bypassing your server
   */
  async getPresignedUploadUrl(
    key: string, 
    contentType: string, 
    expiresIn: number = 3600
  ): Promise<string> {
    const { getSignedUrl } = await import('@aws-sdk/s3-request-presigner')
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      ContentType: contentType,
      ACL: 'public-read',
    })
    
    return await getSignedUrl(this.client, command, { expiresIn })
  }

  /**
   * Generate presigned URL for viewing/downloading private files
   */
  async getPresignedDownloadUrl(
    key: string, 
    expiresIn: number = 3600
  ): Promise<string> {
    const { getSignedUrl } = await import('@aws-sdk/s3-request-presigner')
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: key,
    })
    
    return await getSignedUrl(this.client, command, { expiresIn })
  }
}
```

---

## Step 3: Image Processing Utility

**Required package:**
```bash
bun add sharp
```

```typescript
// src/shared/lib/image.ts
import sharp from 'sharp'

export interface ImageProcessingOptions {
  maxWidth?: number
  maxHeight?: number
  quality?: number
  format?: 'webp' | 'jpeg' | 'png'
}

export interface ProcessedImage {
  buffer: Buffer
  width: number
  height: number
  format: string
  size: number
}

export async function processImage(
  input: Buffer | BunFile,
  options: ImageProcessingOptions = {}
): Promise<ProcessedImage> {
  const {
    maxWidth = 1200,
    maxHeight = 1200,
    quality = 80,
    format = 'webp'
  } = options

  // Convert File to Buffer if needed
  let buffer: Buffer
  if (input instanceof Buffer) {
    buffer = input
  } else {
    buffer = Buffer.from(await (input as File).arrayBuffer())
  }

  // Process with sharp
  let pipeline = sharp(buffer)
  
  // Resize if too large
  pipeline = pipeline.resize(maxWidth, maxHeight, {
    fit: 'inside',
    withoutEnlargement: true
  })

  // Convert format
  switch (format) {
    case 'webp':
      pipeline = pipeline.webp({ quality })
      break
    case 'jpeg':
      pipeline = pipeline.jpeg({ quality })
      break
    case 'png':
      pipeline = pipeline.png()
      break
  }

  const { data, info } = await pipeline.toBuffer({ resolveWithObject: true })

  return {
    buffer: data,
    width: info.width,
    height: info.height,
    format: info.format,
    size: data.length
  }
}

export function isImageMimeType(mimeType: string): boolean {
  return ['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(mimeType)
}

export function getExtensionFromMimeType(mimeType: string): string {
  const map: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/gif': 'gif',
    'image/webp': 'webp'
  }
  return map[mimeType] || 'bin'
}
```

---

## Step 4: Upload Feature

### Repository

```typescript
// src/features/uploads/repository.ts
import { db } from '../_core/database/connection'
import { uuidv7 } from '../../shared/lib/uuid'

export interface Asset {
  id: string
  userId: string
  filename: string
  originalName: string
  mimeType: string
  size: number
  path: string
  url: string
  metadata?: string
}

export class AssetRepository {
  async create(data: Omit<Asset, 'id' | 'createdAt'>) {
    const id = uuidv7()
    const now = new Date().toISOString()
    
    return db.insertInto('assets')
      .values({
        id,
        user_id: data.userId,
        filename: data.filename,
        original_name: data.originalName,
        mime_type: data.mimeType,
        size: data.size,
        path: data.path,
        url: data.url,
        metadata: data.metadata,
        created_at: now
      })
      .returningAll()
      .executeTakeFirst()
  }

  async findByUser(userId: string) {
    return db.selectFrom('assets')
      .where('user_id', '=', userId)
      .selectAll()
      .execute()
  }

  async delete(id: string) {
    return db.deleteFrom('assets').where('id', '=', id).execute()
  }
}
```

### Service

```typescript
// src/features/uploads/service.ts
import { createStorage } from '../_core/storage'
import { processImage, isImageMimeType } from '../../shared/lib/image'
import { AssetRepository } from './repository'
import { uuidv7 } from '../../shared/lib/uuid'

export interface UploadOptions {
  maxSize?: number          // bytes
  processImage?: boolean
  imageOptions?: Parameters<typeof processImage>[1]
}

export interface UploadResult {
  success: boolean
  asset?: any
  error?: string
}

export class UploadService {
  private storage = createStorage()
  private repo = new AssetRepository()

  async handle(
    file: BunFile,
    userId: string,
    options: UploadOptions = {}
  ): Promise<UploadResult> {
    const {
      maxSize = 5 * 1024 * 1024,  // 5MB default
      processImage: shouldProcess = true,
      imageOptions
    } = options

    try {
      // Validate file
      if (file.size > maxSize) {
        return {
          success: false,
          error: `File too large. Max size: ${Math.round(maxSize / 1024 / 1024)}MB`
        }
      }

      const mimeType = file.type
      const originalName = file.name
      const isImage = isImageMimeType(mimeType)

      // Generate unique key
      const id = uuidv7()
      let key: string
      let processed: any
      let finalBuffer: Buffer

      if (isImage && shouldProcess) {
        // Process image
        processed = await processImage(file, imageOptions)
        key = `uploads/${userId}/${id}.webp`
        finalBuffer = processed.buffer
      } else {
        // Upload as-is
        const ext = mimeType.split('/')[1] || 'bin'
        key = `uploads/${userId}/${id}.${ext}`
        finalBuffer = Buffer.from(await file.arrayBuffer())
      }

      // Upload to storage
      await this.storage.upload(key, finalBuffer, mimeType)

      // Save to database
      const asset = await this.repo.create({
        userId,
        filename: key.split('/').pop()!,
        originalName,
        mimeType: isImage ? 'image/webp' : mimeType,
        size: finalBuffer.length,
        path: key,
        url: this.storage.getPublicUrl(key),
        metadata: processed ? JSON.stringify({
          width: processed.width,
          height: processed.height,
          format: processed.format
        }) : undefined
      })

      return { success: true, asset }

    } catch (error: any) {
      console.error('Upload error:', error)
      return { success: false, error: error.message }
    }
  }
}
```

### API Routes

```typescript
// src/features/uploads/api.ts
import { createProtectedApi } from '../_core/auth/protected'
import { UploadService } from './service'

export const uploadApi = createProtectedApi('/uploads')
  .derive(() => ({ uploadService: new UploadService() }))

  // Upload endpoint
  .post('/', async (ctx) => {
    const { request, uploadService } = ctx
    const user = (ctx as any).user

    const formData = await request.formData()
    const file = formData.get('file') as BunFile

    if (!file) {
      return ctx.inertia.render('uploads/Index', {
        error: 'No file provided'
      })
    }

    const result = await uploadService.handle(file, user.id, {
      maxSize: 10 * 1024 * 1024,  // 10MB
      processImage: true,
      imageOptions: {
        maxWidth: 1920,
        maxHeight: 1920,
        quality: 85
      }
    })

    if (!result.success) {
      return ctx.inertia.render('uploads/Index', {
        error: result.error
      })
    }

    return ctx.inertia.render('uploads/Index', {
      success: true,
      asset: result.asset
    })
  })

  // List user's uploads
  .get('/', async (ctx) => {
    const { uploadService } = ctx
    const user = (ctx as any).user
    const assets = await uploadService.getUserAssets(user.id)
    
    return ctx.inertia.render('uploads/Index', { assets })
  })
```

---

## Step 5: Feature-Specific Upload (Product Images)

```typescript
// src/features/products/assets/service.ts
import { createStorage } from '../../_core/storage'
import { processImage } from '../../../shared/lib/image'
import { ProductImageRepository } from './repository'
import { uuidv7 } from '../../../shared/lib/uuid'

export class ProductImageService {
  private storage = createStorage()
  private repo = new ProductImageRepository()

  async upload(productId: string, file: BunFile, userId: string) {
    // Generate unique key with product folder
    const id = uuidv7()
    const key = `products/${productId}/${id}.webp`

    // Process image (product images need specific sizes)
    const processed = await processImage(file, {
      maxWidth: 1200,
      maxHeight: 1200,
      quality: 80,
      format: 'webp'
    })

    // Upload
    await this.storage.upload(key, processed.buffer, 'image/webp')

    // Save to DB
    return this.repo.create({
      productId,
      path: key,
      url: this.storage.getPublicUrl(key),
      width: processed.width,
      height: processed.height,
      size: processed.size
    })
  }

  async delete(imageId: string) {
    const image = await this.repo.findById(imageId)
    if (!image) return

    // Delete from storage
    await this.storage.delete(image.path)

    // Delete from DB
    await this.repo.delete(imageId)
  }
}
```

---

## Presigned URLs (Direct Upload)

For large files or to reduce server load, use **presigned URLs** to let client upload directly to S3:

### Flow

```
1. Client → Server: "I want to upload image.jpg"
2. Server → S3: Generate presigned URL (valid 5 min)
3. Server → Client: Return presigned URL
4. Client → S3: Upload file directly (bypass server)
5. Client → Server: "Upload complete, save metadata"
```

### Server - Generate Presigned URL

```typescript
// features/uploads/api.ts
.get('/presign', async (ctx) => {
  const storage = createStorage()
  
  // Only S3 supports presigned URLs
  if (!storage.getPresignedUploadUrl) {
    return ctx.json({ error: 'Presigned URLs not supported' }, 400)
  }
  
  const key = `uploads/${uuidv7()}.jpg`
  const url = await storage.getPresignedUploadUrl(key, 'image/jpeg', 300)
  
  return ctx.json({ url, key })
})
```

### Client - Upload with Presigned URL

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
    
    // 3. Save metadata
    await fetch('/uploads/complete', {
      method: 'POST',
      body: JSON.stringify({ key, filename: file.name, size: file.size })
    })
  }
</script>
```

### When to Use Presigned URLs

| Approach | Best For |
|----------|----------|
| **Server Proxy** | Small files (< 10MB), need validation |
| **Presigned URL** | Large files, high traffic, bandwidth saving |

---

## Environment Variables

```bash
# Storage Driver: 'local' or 's3'
STORAGE_DRIVER=local

# Local Storage
LOCAL_STORAGE_PATH=./storage
LOCAL_STORAGE_URL=/storage

# S3 Storage (optional)
S3_BUCKET=my-bucket
S3_REGION=us-east-1
S3_ENDPOINT=https://s3.wasabisys.com
S3_ACCESS_KEY=your-access-key
S3_SECRET_KEY=your-secret-key
CDN_URL=https://cdn.example.com
```

---

## Summary

| Feature | Implementation |
|---------|---------------|
| **Storage Abstraction** | `_core/storage/` with interface |
| **Local Storage** | Filesystem with configurable path |
| **S3 Storage** | AWS SDK with env config |
| **Image Processing** | Sharp (resize, convert, compress) |
| **Max Size** | Configurable per upload |
| **Assets Table** | Metadata + URL tracking |
| **Feature-Specific** | Products have own image service |

---

## Related

- [Storage Config](/reference/config) — Environment configuration
- [Creating Features](/guide/creating-features) — Feature structure
