# Configuration

Configuration files in Velist.

---

## Environment Variables

Create `.env` file:

```bash
NODE_ENV=development
PORT=3000
APP_VERSION=1.0.0
JWT_SECRET=your-secret-key
VITE_URL=http://localhost:5173
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
| `VITE_URL` | Vite dev server URL | `http://localhost:5173` |

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

export default defineConfig({
  plugins: [svelte()],
  resolve: {
    alias: {
      '$features': '/src/features',
      '$shared': '/src/shared',
      '$inertia': '/src/inertia'
    }
  },
  build: {
    outDir: 'dist'
  }
})
```

---

## Drizzle Config

### `drizzle.config.ts`

```typescript
import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  schema: './src/features/_core/database/schema.ts',
  out: './db/migrations',
  driver: 'better-sqlite3',
  dbCredentials: {
    url: './db/app.sqlite'
  }
})
```

---

## Vitest Config

### `vitest.config.ts`

```typescript
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/unit/**/*.test.ts']
  },
  resolve: {
    alias: {
      '$features': './src/features',
      '$shared': './src/shared'
    }
  }
})
```

---

## Playwright Config

### `playwright.config.ts`

```typescript
import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e',
  use: {
    baseURL: 'http://localhost:3000'
  },
  webServer: {
    command: 'bun run dev:server',
    port: 3000
  }
})
```
