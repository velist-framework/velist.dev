# Configuration

Configuration files in Velist.

---

## Environment Variables

Create `.env` file (copy from `.env.example`):

```bash
NODE_ENV=development
PORT=3000
APP_VERSION=1.0.0
JWT_SECRET=your-super-secret-jwt-key-change-in-production
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
```

### Required Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `development` |
| `PORT` | Server port | `3000` |
| `JWT_SECRET` | Secret for JWT signing | - |

### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `APP_VERSION` | App version | `1.0.0` |

### Google OAuth (Optional)

| Variable | Description |
|----------|-------------|
| `GOOGLE_CLIENT_ID` | Google OAuth Client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth Client Secret |

### Storage (Optional)

| Variable | Description | Default |
|----------|-------------|---------|
| `STORAGE_DRIVER` | Storage driver: `local` or `s3` | `local` |
| `LOCAL_STORAGE_PATH` | Local storage directory | `./storage` |
| `LOCAL_STORAGE_URL` | Public URL for local files | `/storage` |
| `S3_BUCKET` | S3 bucket name | - |
| `S3_REGION` | S3 region | - |
| `S3_ENDPOINT` | S3 endpoint URL | - |
| `S3_ACCESS_KEY` | S3 access key | - |
| `S3_SECRET_KEY` | S3 secret key | - |
| `CDN_URL` | CDN URL for S3 files | - |

---

## TypeScript Config

### `tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ESNext",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "paths": {
      "$features/*": ["./src/features/*"],
      "$shared/*": ["./src/shared/*"],
      "$inertia/*": ["./src/inertia/*"]
    }
  }
}
```

---

## Vite Config

### `vite.config.ts`

```typescript
import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'
import { writeFileSync, rmSync } from 'fs'

export default defineConfig({
  plugins: [
    tailwindcss(),
    svelte(),
    {
      name: 'write-port',
      configureServer(server) {
        server.httpServer?.on('listening', () => {
          const address = server.httpServer?.address()
          if (typeof address === 'object' && address) {
            const port = address.port
            const url = `http://localhost:${port}`
            writeFileSync('.vite-port', url)
            console.log(`[vite-plugin] Port written to .vite-port: ${url}`)
          }
        })
        // Cleanup on exit
        const cleanup = () => {
          try { rmSync('.vite-port') } catch {}
          process.exit()
        }
        process.on('SIGINT', cleanup)
        process.on('SIGTERM', cleanup)
      }
    }
  ],
  
  server: {
    strictPort: false, // Auto-find available port if 5173 is taken
    port: 5173
  },
  
  resolve: {
    alias: {
      $features: path.resolve(__dirname, './src/features'),
      $shared: path.resolve(__dirname, './src/shared'),
      $inertia: path.resolve(__dirname, './src/inertia')
    }
  },
   
  build: {
    manifest: true,
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
      input: {
        app: './src/inertia/app.ts',
        styles: './src/styles/app.css'
      },
      output: {
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash][extname]'
      }
    }
  }
})
```

---

## Drizzle Config

### `drizzle.config.ts`

```typescript
import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  dialect: 'sqlite',
  schema: './src/features/_core/database/schema.ts',
  out: './src/features/_core/database/migrations',
  dbCredentials: {
    url: './db/dev.sqlite',
  },
})
```

---

## Playwright Config

### `playwright.config.ts`

```typescript
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'list',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'bun run dev:server',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
    env: {
      NODE_ENV: 'development',
      DATABASE_URL: './db/dev.sqlite',
    },
  },
})
```

---

## Testing Config

Velist uses **Bun's built-in test runner** (`bun:test`). No additional configuration needed.

Test files location:
- Unit tests: `tests/unit/**/*.test.ts`
- E2E tests: `tests/e2e/**/*.spec.ts`

See [Testing Guide](/guide/testing) for details.
