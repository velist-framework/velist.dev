# Installation

## Requirements

- [Bun](https://bun.sh) >= 1.0.0
- Node.js (for Playwright E2E tests only)

## Create a New Project

### Using Bun (Recommended)

```bash
bun create velist my-app
```

### Using npx

```bash
npx create-velist-app my-app
```

### Interactive Mode

Run without arguments for interactive prompts:

```bash
bun create velist
```

## Manual Setup

If you prefer manual setup:

```bash
# Clone the repository
git clone https://github.com/velist-framework/velist.git my-app
cd my-app

# Remove git history for fresh start
rm -rf .git

# Install dependencies
bun install

# Setup environment
cp .env.example .env

# Setup database
bun run db:migrate
bun run db:seed

# Start development
bun run dev
```

## Project Structure

After installation, your project will have this structure:

```
my-app/
├── src/
│   ├── features/           # Vertical feature slices
│   │   ├── _core/         # Core infrastructure
│   │   │   ├── auth/      # Authentication
│   │   │   └── database/  # Database setup
│   │   └── dashboard/     # Example feature
│   ├── shared/            # Shared utilities
│   ├── inertia/           # Inertia.js integration
│   └── bootstrap.ts       # App entry point
├── static/                # Static assets
├── docs/                  # Documentation
├── tests/                 # E2E tests
├── package.json
└── README.md
```

## Verify Installation

1. Start the dev server:
   ```bash
   bun run dev
   ```

2. Open http://localhost:3000

3. Login with default credentials:
   - Email: `admin@example.com`
   - Password: `password123`

You should see the dashboard.

## Next Steps

- [Quick Start](/guide/quick-start) — Build your first feature
- [Project Structure](/guide/structure) — Understand the architecture
