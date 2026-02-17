# AI-First Development Workflow

Velist is designed for **AI-first development** — where 99% of coding is done by AI agents, from planning to deployment.

---

## Overview

Velist uses a **multi-agent workflow** with mandatory human review points. Each agent specializes in one phase of development:

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Product   │────▶│  Tech Lead  │────▶│   Developer │
│    Agent    │     │    Agent    │     │    Agent    │
└─────────────┘     └─────────────┘     └─────────────┘
                                              │
                        ┌─────────────┐      │
                        │   DevOps    │◀─────┘
                        │    Agent    │◀────┐
                        └─────────────┘     │
                              ▲             │
                        ┌─────────────┐     │
                        │     QA      │─────┘
                        │    Agent    │
                        └─────────────┘
```

---

## The Five Agents

| Agent | Role | Output |
|-------|------|--------|
| **Product Agent** | Define requirements | PRD, User Stories, Roadmap |
| **Tech Lead Agent** | Design architecture | Tech Spec, Database Schema, Page Routes, Tasks |
| **Developer Agent** | Implement code | Working features (Repository, Service, API, Pages) |
| **QA Agent** | Test & verify | Unit tests, E2E tests, Test Report |
| **DevOps Agent** | Deploy to production | Live application |

---

## Mandatory Review Points

**Every agent stops and waits for your approval** before proceeding:

```
@workflow/agents/product.md
        ↓
[🔍 CLIENT REVIEW: Approve PRD?]
        ↓ YES
@workflow/agents/tech-lead.md
        ↓
[🔍 CLIENT REVIEW: Approve Tech Design?]
        ↓ YES
@workflow/agents/developer.md
        ↓
[🔍 CLIENT REVIEW: Approve Implementation?]
        ↓ YES
@workflow/agents/qa.md
        ↓
[🔍 CLIENT REVIEW: Approve for Deploy?]
        ↓ YES
@workflow/agents/devops.md
        ↓
    🎉 DEPLOYED
```

**No auto-skip.** You are in control at every stage.

---

## How to Use

### Format

```
@workflow/agents/[agent-name].md [instruction]
```

### Example: Build a Complete App

**Step 1 — Product Agent**
```
@workflow/agents/product.md

I want to build a task management app.
Features: create tasks, set deadlines, mark complete, filter by status.
Users: individual professionals
Timeline: 2 weeks for MVP
```

**Output:** PRD.md, USER_STORIES.md, ROADMAP.md

**Step 2 — Tech Lead Agent** (after you approve)
```
@workflow/agents/tech-lead.md

Continue from Product Agent.
Requirements approved by client.
```

**Output:** TECH_SPEC.md, ARCHITECTURE.md, PAGE_ROUTES.md, DATABASE_SCHEMA.md, TASKS.md

**Step 3 — Developer Agent** (after you approve)
```
@workflow/agents/developer.md

Implement all features from Tech Lead spec.
```

**Step 4 — QA Agent** (after you approve)
```
@workflow/agents/qa.md

Test the application. Create unit and E2E tests.
```

**Step 5 — DevOps Agent** (after you approve)
```
@workflow/agents/devops.md

Deploy to production.
```

---

## Agent Instructions

Each agent file is **self-contained** — it contains complete instructions for that agent. They are independent and can be called directly.

| Call | File Location |
|------|---------------|
| `@workflow/agents/product.md` | `workflow/agents/product.md` |
| `@workflow/agents/tech-lead.md` | `workflow/agents/tech-lead.md` |
| `@workflow/agents/developer.md` | `workflow/agents/developer.md` |
| `@workflow/agents/qa.md` | `workflow/agents/qa.md` |
| `@workflow/agents/devops.md` | `workflow/agents/devops.md` |

---

## Output Structure

All agent outputs are stored in `workflow/outputs/`:

```
workflow/outputs/
├── 01-product/              # Product Agent
│   ├── PRD.md
│   ├── USER_STORIES.md
│   └── ROADMAP.md
├── 02-engineering/          # Tech Lead Agent
│   ├── TECH_SPEC.md
│   ├── ARCHITECTURE.md
│   ├── PAGE_ROUTES.md
│   ├── DATABASE_SCHEMA.md
│   └── TASKS.md
├── 03-tasks/                # Task breakdowns
├── 04-reports/              # QA Agent
│   ├── TEST_PLAN.md
│   ├── TEST_REPORT.md
│   └── test-files/
└── 05-deployment/           # DevOps Agent
    └── DEPLOYMENT_CONFIG.md
```

---

## Inertia.js Architecture

Velist uses **Inertia.js** — no REST API needed. Backend renders Svelte pages directly.

```typescript
// api.ts - Backend renders page
.get('/', async (ctx) => {
  const items = await service.getAll()
  return ctx.inertia.render('items/Index', { items })
})
```

```svelte
<!-- Index.svelte - Page receives props -->
<script lang="ts">
  interface Props {
    items: Array<{ id: string; title: string }>
  }
  let { items }: Props = $props()
</script>
```

**Benefits:**
- No API contracts to maintain
- No separate frontend/backend sync
- Type-safe data from server to UI
- SPA experience without API complexity

---

## Quick Examples

### Fix a Bug
```
@workflow/agents/developer.md

Fix bug: task completion status not saving.
When marking complete, it reverts on refresh.
```

### Add a Feature
```
@workflow/agents/product.md

Add categories to existing tasks app.
Tasks can have multiple categories and filter by them.
```

### Run Tests
```
@workflow/agents/qa.md

Test the authentication module.
Create unit tests for service and repository.
```

---

## Next Steps

- [Creating Features](./creating-features) — Technical implementation guide
- [Project Structure](./structure) — Folder organization
- [Vertical Slicing](./vertical-slicing) — Architecture philosophy
