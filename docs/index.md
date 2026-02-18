---
layout: home

hero:
  name: "Velist"
  text: "Build Fullstack Apps"
  tagline: The AI-native framework that lets agents build production-ready apps for you. Stop writing boilerplate, start shipping features.
  image:
    src: /logo.png
    alt: Velist
  actions:
    - theme: brand
      text: 🚀 Get Started in 60 Seconds
      link: /guide/installation
    - theme: alt
      text: 📖 Documentation
      link: /guide/
    - theme: alt
      text: ⭐ GitHub
      link: https://github.com/velist-framework/velist

features:
  - icon: 🤖
    title: AI-Native Workflow
    details: Built for multi-agent collaboration. Product → Tech Lead → Dev → QA → DevOps. Agents work in harmony with mandatory human review points.
  
  - icon: ⚡
    title: Zero to Production in Minutes
    details: One command `bun create velist` and you get auth, database, dark mode, testing, and deployment ready. Not hours. Minutes.
  
  - icon: 🗂️
    title: Feature-First Architecture
    details: One folder = one complete feature. Everything related to "Users" lives in `features/users/`. No more hunting across 10 folders.
  
  - icon: 🔥
    title: Bun + Elysia + Svelte 5
    details: Modern stack optimized for speed. Dev server starts in <100ms. 10x faster builds. End-to-end type safety from DB to UI.
  
  - icon: 🚀
    title: Deploy Anywhere
    details: Built-in Docker support. One-click deploy to Cloudflare, Vercel, or your own VPS. CI/CD included.
  
  - icon: 🧪
    title: Testing Included
    details: E2E testing with Playwright setup out of the box. Unit tests with Bun. Coverage reports. No config needed.
---

<!-- Stats Section -->
<div class="vp-doc" style="padding: 2rem 0; text-align: center;">
  <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 2rem; max-width: 800px; margin: 0 auto;">
    <div>
      <div style="font-size: 2.5rem; font-weight: bold; color: var(--vp-c-brand-1);">&lt;100ms</div>
      <div style="color: var(--vp-c-text-2);">Dev Server Start</div>
    </div>
    <div>
      <div style="font-size: 2.5rem; font-weight: bold; color: var(--vp-c-brand-1);">10x</div>
      <div style="color: var(--vp-c-text-2);">Faster Builds</div>
    </div>
    <div>
      <div style="font-size: 2.5rem; font-weight: bold; color: var(--vp-c-brand-1);">60s</div>
      <div style="color: var(--vp-c-text-2);">To Production</div>
    </div>
    <div>
      <div style="font-size: 2.5rem; font-weight: bold; color: var(--vp-c-brand-1);">100%</div>
      <div style="color: var(--vp-c-text-2);">Type Safe</div>
    </div>
  </div>
</div>

<!-- Code Preview Section -->
<div class="vp-doc" style="padding: 3rem 0;">
  <h2 style="text-align: center; border: none;">One Command. Full Stack. Production Ready.</h2>
  
::: code-group

```bash [Create Project]
# One command = Fullstack app with auth, DB, testing
bun create velist my-app
cd my-app && bun dev
```

```ts [Define API]
// features/users/api.ts
export const usersApi = createProtectedApi('/users')
  .get('/', async (ctx) => {
    const users = await userService.getAll()
    return ctx.inertia.render('users/Index', { users })
  })
  .post('/', async (ctx) => {
    const user = await userService.create(ctx.body)
    return ctx.inertia.redirect('/users')
  })
```

```svelte [Build UI]
<!-- features/users/pages/Index.svelte -->
<script>
  import AppLayout from '$shared/layouts/AppLayout.svelte'
  let { user, users } = $props();
</script>

<AppLayout title="Users" {user} path="/users">
  <div class="max-w-7xl mx-auto p-6">
    <h1 class="text-2xl font-bold mb-4">Users</h1>
    <div class="grid gap-4">
      {#each users as u}
        <div class="p-4 bg-white rounded-lg shadow">
          {u.name}
        </div>
      {/each}
    </div>
  </div>
</AppLayout>
```

:::

</div>

<!-- AI Workflow Section -->
<div class="vp-doc" style="padding: 3rem 0;">

## 🚀 Build 99% AI-Made Apps (You Just Review)

Velist is the **first framework built for AI agents**. Not AI-assisted. AI-made.

### The 5-Agent Assembly Line

| 🤖 Product | → | 🏗️ Tech Lead | → | 👨‍💻 Developer | → | 🧪 QA | → | 🚀 DevOps |
|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| **Writes**<br>PRD & Stories | | **Designs**<br>Architecture | | **Implements**<br>Features | | **Tests**<br>Everything | | **Deploys**<br>Production |

**Every agent stops for your approval** — no black box, no surprises.

</div>

<!-- How It Works Section -->
<div class="vp-doc" style="padding: 2rem 0; background: var(--vp-c-bg-soft); border-radius: 1rem; margin: 2rem 0; padding: 2rem;">

## How It Works (Real Example)

**You type:**
```
@workflow/agents/product.md

Build a task management app for teams.
Features: create tasks, assign members, set deadlines, 
mark complete, filter by status/priority.
```

**AI does:**
1. ✅ **Product Agent** → Writes PRD, User Stories, Roadmap
2. ✅ **You review** → Approve or request changes
3. ✅ **Tech Lead** → Designs DB schema, API routes, page structure
4. ✅ **You review** → Approve architecture
5. ✅ **Developer** → Codes all features (backend + frontend)
6. ✅ **You review** → Test the app
7. ✅ **QA Agent** → Writes & runs unit + E2E tests
8. ✅ **You review** → Final approval
9. ✅ **DevOps** → Deploys to production

**Result:** Production-ready app. You wrote 0 lines of code. You just reviewed and approved.

<p style="text-align: center; margin-top: 2rem;">
  <a href="/guide/workflow" style="
    background: var(--vp-c-brand-1);
    color: white;
    padding: 0.8rem 2rem;
    border-radius: 2rem;
    text-decoration: none;
    font-weight: 600;
  ">📖 Learn the AI Workflow</a>
</p>

</div>

<!-- Why Velist Section -->
<div class="vp-doc" style="padding: 2rem 0;">

## Why Developers Choose Velist

### 🎯 Stop Wrestling With Configuration
Traditional fullstack development means configuring 10+ tools. With Velist, everything works out of the box:

| What You Need | Traditional Stack | Velist |
|--------------|-------------------|--------|
| Dev server | Configure Vite/Webpack | ✅ Built-in |
| Database ORM | Setup Prisma/Drizzle | ✅ Built-in |
| Authentication | Integrate Auth.js | ✅ Built-in |
| API layer | Build REST/GraphQL | ✅ Inertia.js included |
| Testing | Setup Jest/Playwright | ✅ Pre-configured |
| Deployment | Write Docker/CI files | ✅ One-click deploy |

### 🤖 Built for the AI Era
Velist is the first framework designed specifically for AI agents:

- **Structured prompts** for each agent role (Product, Tech Lead, Developer, QA)
- **Mandatory review points** - agents can't skip human approval
- **Feature isolation** - each feature is self-contained, perfect for parallel agent work
- **Clear contracts** - types define boundaries between agents

### ⚡ Developer Experience That Actually Delivers

> "I built a complete SaaS in a weekend. The vertical slicing approach changed how I think about architecture."
> — *Early Adopter*

- **Hot reload** that actually works - server and client
- **Type safety** from database to UI props
- **Database migrations** auto-generated from schema changes
- **Dark mode** included in the starter template

</div>

<!-- CTA Section -->
<div style="padding: 4rem 0; text-align: center; background: linear-gradient(135deg, var(--vp-c-brand-soft) 0%, transparent 100%); border-radius: 1rem; margin: 2rem 0;">
  <h2 style="margin-bottom: 1rem; border: none;">Ready to Ship Faster?</h2>
  <p style="font-size: 1.2rem; color: var(--vp-c-text-2); margin-bottom: 2rem;">
    Join developers who stopped configuring and started building.
  </p>
  <div style="display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap;">
    <a href="/guide/installation" style="
      background: var(--vp-button-brand-bg);
      color: white;
      padding: 0.8rem 2rem;
      border-radius: 2rem;
      text-decoration: none;
      font-weight: 600;
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
    ">
      🚀 Get Started Now
    </a>
    <a href="https://github.com/velist-framework/velist" style="
      background: var(--vp-c-bg-soft);
      color: var(--vp-c-text-1);
      padding: 0.8rem 2rem;
      border-radius: 2rem;
      text-decoration: none;
      font-weight: 600;
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      border: 1px solid var(--vp-c-divider);
    ">
      ⭐ Star on GitHub
    </a>
  </div>
  <p style="margin-top: 1.5rem; font-size: 0.9rem; color: var(--vp-c-text-3);">
    Free. Open Source. Production Ready.
  </p>
</div>

<style>
:root {
  --vp-home-hero-name-color: #6366F1;
  --vp-home-hero-name-background: -webkit-linear-gradient(120deg, #6366F1 30%, #14B8A6);
  --vp-button-brand-bg: #6366F1;
  --vp-button-brand-hover-bg: #4F46E5;
}

.vp-doc table {
  width: 100%;
  margin: 2rem 0;
}

.vp-doc th {
  background: var(--vp-c-bg-soft);
  font-weight: 600;
}

.vp-doc td:first-child {
  font-weight: 500;
}

.vp-doc tr:nth-child(2n) {
  background: transparent;
}
</style>
