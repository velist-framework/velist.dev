# AGENTS.md - Velist Documentation Website

This file contains essential information for AI coding agents working on the Velist documentation website.

---

## Project Overview

This is the **official documentation website** for the Velist Framework, built with [VitePress](https://vitepress.dev). Velist is a features-first fullstack web framework that emphasizes vertical slicing architecture.

**Key characteristics:**
- Documentation site (not the framework itself)
- Static site generator using VitePress
- English language content
- Deployed to Vercel/Netlify on push to main branch

---

## Technology Stack

| Component | Technology | Version |
|-----------|------------|---------|
| Site Generator | VitePress | ^1.5.0 |
| Package Manager | Bun | >= 1.0.0 |
| Runtime | Node.js (ES Modules) | - |
| Language | TypeScript | For config files |

---

## Project Structure

```
.
├── docs/                       # Documentation content (root for VitePress)
│   ├── .vitepress/
│   │   └── config.ts          # VitePress configuration
│   ├── index.md               # Homepage (landing page)
│   ├── guide/                 # Guide documentation
│   │   ├── index.md           # Introduction
│   │   └── installation.md    # Installation guide
│   ├── reference/             # API reference (empty, placeholder)
│   └── examples/              # Examples (empty, placeholder)
├── .vitepress/                # VitePress cache (auto-generated)
├── package.json               # Project dependencies
├── README.md                  # Human-readable project info
└── AGENTS.md                  # This file
```

---

## Build Commands

All commands use Bun:

```bash
# Install dependencies
bun install

# Start development server (with hot reload)
bun run dev
# or: vitepress dev docs

# Build for production (outputs to .vitepress/dist/)
bun run build
# or: vitepress build docs

# Preview production build locally
bun run preview
# or: vitepress preview docs
```

**Note:** The dev server runs on a port determined by VitePress (default behavior).

---

## Content Organization

### Navigation Structure

The sidebar is configured in `docs/.vitepress/config.ts` with three main sections:

1. **Guide** (`/guide/`)
   - Getting Started: Introduction, Installation, Quick Start
   - Core Concepts: Vertical Slicing, Project Structure, Creating Features
   - Fundamentals: Routing, Database, Authentication, Forms
   - Deployment: Production Build, Docker

2. **Reference** (`/reference/`)
   - CLI Commands, Configuration, TypeScript Types
   - **Note:** Currently placeholder - content not yet created

3. **Examples** (`/examples/`)
   - **Note:** Directory exists but is empty

### Writing Documentation

- Use Markdown files (`.md`)
- Frontmatter supported for page configuration
- Vue components can be embedded for interactivity
- Code blocks support syntax highlighting

---

## VitePress Configuration

Located at `docs/.vitepress/config.ts`:

- **Title:** "Velist"
- **Description:** "Features-first fullstack framework"
- **Theme:** Default VitePress theme with custom colors
- **Search:** Local search enabled
- **Social Links:** GitHub, Discord
- **Footer:** MIT License, Copyright 2026

### Theme Colors

- Primary (hero name): `#6366F1` (indigo)
- Gradient: `#6366F1` to `#14B8A6` (indigo to teal)
- Button brand: `#6366F1`
- Button hover: `#4F46E5`

---

## Code Style Guidelines

### Markdown Content

- Use semantic line breaks (one sentence per line preferred)
- Use ATX-style headers (`#` not underlines)
- Code blocks should specify language for syntax highlighting
- Use relative links for internal navigation (`/guide/installation`)

### File Naming

- Lowercase with hyphens: `quick-start.md`, `vertical-slicing.md`
- Index files named `index.md`

### Frontmatter Format

```yaml
---
layout: home  # for landing pages
---
```

---

## Testing Instructions

There are no automated tests for this documentation site. Testing is manual:

1. Run `bun run dev` to start dev server
2. Navigate through all pages
3. Check all links work
4. Verify code blocks render correctly
5. Test search functionality
6. Build with `bun run build` to check for VitePress errors

---

## Deployment Process

- **Platform:** Vercel or Netlify (automatic)
- **Trigger:** Push to `main` branch
- **Build Output:** `.vitepress/dist/`
- **No manual deployment steps required**

---

## Important Notes for Agents

1. **This is documentation, not the framework** - The actual Velist framework is at https://github.com/velist-framework/velist

2. **Incomplete sections** - The `/reference/` and `/examples/` sections exist in config but have no content files yet

3. **VitePress cache** - The `.vitepress/cache/` directory is auto-generated and should not be committed (already in `.gitignore`)

4. **No custom components** - Currently using default VitePress theme without custom Vue components

5. **Content focus** - The framework emphasizes:
   - Vertical slicing architecture
   - Bun + Elysia + Svelte 5 + Inertia.js stack
   - TypeScript throughout

---

## Dependencies

```json
{
  "devDependencies": {
    "vitepress": "^1.5.0"
  }
}
```

No runtime dependencies - this is a static site.

---

## Security Considerations

- No sensitive data in documentation
- No authentication required for viewing
- No API keys or secrets in codebase
- Static site - no server-side vulnerabilities

---

## Useful Links

- VitePress Docs: https://vitepress.dev
- Velist Framework: https://github.com/velist-framework/velist
- Bun: https://bun.sh
