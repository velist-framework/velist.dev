# CLI Commands

Available commands in Velist.

---

## Development

### `bun run dev`
Start development server (backend + frontend).

```bash
bun run dev
```

### `bun run dev:server`
Start backend server only (port 3000).

```bash
bun run dev:server
```

### `bun run dev:client`
Start Vite dev server only (port 5173).

```bash
bun run dev:client
```

---

## Build

### `bun run build`
Build for production.

```bash
bun run build
```

Output in `dist/` directory.

### `bun run start`
Start production server.

```bash
bun run start
```

---

## Database

### `bun run db:generate`
Generate migration files from schema.

```bash
bun run db:generate
```

### `bun run db:migrate`
Run pending migrations.

```bash
bun run db:migrate
```

### `bun run db:seed`
Seed database with initial data.

```bash
bun run db:seed
```

### `bun run db:refresh`
Reset database: delete + migrate + seed.

```bash
bun run db:refresh
```

**Warning:** This deletes all data.

---

## Testing

### `bun run test:unit`
Run unit tests with Vitest.

```bash
bun run test:unit
```

### `bun run test:unit:watch`
Run unit tests in watch mode.

```bash
bun run test:unit:watch
```

### `bun run test:unit:coverage`
Run unit tests with coverage report.

```bash
bun run test:unit:coverage
```

### `bun run test:e2e`
Run E2E tests with Playwright.

```bash
bun run test:e2e
```

### `bun run test:e2e:ui`
Run E2E tests in interactive UI mode.

```bash
bun run test:e2e:ui
```

---

## Type Checking

### `bun run typecheck`
Run TypeScript and Svelte type checking.

```bash
bun run typecheck
```

---

## Linting

### `bun run lint`
Run ESLint.

```bash
bun run lint
```

### `bun run lint:fix`
Fix ESLint issues automatically.

```bash
bun run lint:fix
```

---

## Project Creation

### `bun create velist`
Create new Velist project.

```bash
# Interactive mode
bun create velist

# With project name
bun create velist my-app
```
