# Agent Reference

Complete reference for all five AI agents in the Velist workflow.

---

## Product Agent

**Role:** Define product requirements and scope.

**When to call:** Starting a new project or feature.

```
@workflow/agents/product.md

I want to build [description].
```

**Output Files:**
| File | Description |
|------|-------------|
| `PRD.md` | Product Requirements Document with Design Direction |
| `USER_STORIES.md` | User stories organized by feature |
| `ROADMAP.md` | Sprint planning and timeline |

**Key Sections in PRD:**
- Overview (Vision, Target Users, Success Metrics)
- Feature Requirements (prioritized)
- **Design Direction** (Brand feel, color palette, typography, UI patterns)
- Non-Functional Requirements
- Constraints

**Review Checkpoint:** Agent waits for your approval before Tech Lead Agent.

---

## Tech Lead Agent

**Role:** Design technical architecture and break down tasks.

**When to call:** After Product Agent and PRD approval.

```
@workflow/agents/tech-lead.md

Continue from Product Agent.
Requirements approved.
```

**Output Files:**
| File | Description |
|------|-------------|
| `TECH_SPEC.md` | Technical specification |
| `ARCHITECTURE.md` | System design and folder structure |
| `PAGE_ROUTES.md` | Inertia pages and routes (not REST API) |
| `DATABASE_SCHEMA.md` | Database design with schema changes |
| `TASKS.md` | Task breakdown for development |

**Important:**
- Extends existing schema in `src/features/_core/database/schema.ts`
- Documents new columns and tables
- Never removes existing core columns

**Review Checkpoint:** Agent waits for your approval before Developer Agent.

---

## Developer Agent

**Role:** Implement features according to spec.

**When to call:** After Tech Lead Agent and design approval.

```
@workflow/agents/developer.md

Implement [feature] from Tech Lead spec.
```

**Creates:**
- Repository (database access)
- Service (business logic with TypeBox validation)
- API Routes (Elysia with Inertia)
- Svelte Pages (UI components)

**Development Modes:**
| Mode | Use When |
|------|----------|
| **One-Shot** | Small to medium features |
| **Per Feature** | Large project, step-by-step |
| **Auto-Prioritize** | Unclear where to start |

**Review Checkpoint:** Agent waits for your approval before QA Agent.

---

## QA Agent

**Role:** Create and run comprehensive tests.

**When to call:** After Developer Agent and implementation approval.

```
@workflow/agents/qa.md

Test the application.
```

**Creates:**
| Test Type | Tool | Location |
|-----------|------|----------|
| Unit Tests | Vitest | `tests/unit/**/*.test.ts` |
| E2E Tests | Playwright | `tests/e2e/**/*.spec.ts` |

**Coverage Targets:**
| Layer | Target |
|-------|--------|
| Utils (uuid, helpers) | 100% |
| Services | 90% |
| Repositories | 80% |
| Auth Flows (E2E) | 100% |

**Output Files:**
- `TEST_PLAN.md`
- `TEST_REPORT.md`
- Test files in `tests/`

**Review Checkpoint:** Agent waits for your approval before DevOps Agent.

---

## DevOps Agent

**Role:** Deploy application to production interactively.

**When to call:** After QA Agent and testing approval.

```
@workflow/agents/devops.md

Deploy to production.
```

**Interactive Steps:**
1. Ask deployment status (new vs update)
2. Collect SSH access info
3. Install dependencies (Git, Bun, PM2)
4. Configure port
5. Ask domain (optional)
6. Clone and setup project
7. Configure `.env`
8. Setup database
9. Start with PM2
10. Verify deployment

**Output File:** `DEPLOYMENT_CONFIG.md`

**Post-Deploy Commands:**
```bash
# Check status
ssh user@server "pm2 status"

# View logs
ssh user@server "pm2 logs velist-app"

# Restart
ssh user@server "pm2 restart velist-app"
```

---

## Agent Communication Flow

```
User → Product Agent → [REVIEW] → Tech Lead Agent → [REVIEW]
                                                         ↓
User ← DevOps Agent ← [REVIEW] ← QA Agent ← [REVIEW] ← Developer Agent
  ↑                                                                  ↓
  └──────────────────────────── DEPLOYED 🎉 ─────────────────────────┘
```

Each `[REVIEW]` is a mandatory checkpoint where the agent presents output and waits for your approval.

---

## Common Workflows

### New Project
```
@workflow/agents/product.md → @workflow/agents/tech-lead.md 
    → @workflow/agents/developer.md → @workflow/agents/qa.md 
    → @workflow/agents/devops.md
```

### Bug Fix
```
@workflow/agents/developer.md → @workflow/agents/qa.md
```

### Feature Addition
```
@workflow/agents/product.md → @workflow/agents/tech-lead.md
    → @workflow/agents/developer.md → @workflow/agents/qa.md
```

### Update Deployment
```
@workflow/agents/devops.md
(select "Update" option)
```

---

## Tips for Best Results

**With Product Agent:**
- Describe users and their goals
- Mention must-have vs nice-to-have features
- Specify timeline constraints

**With Tech Lead Agent:**
- Point out any specific technical constraints
- Ask questions if schema changes seem unclear

**With Developer Agent:**
- For large features, use "per feature" mode
- Review code before approving

**With QA Agent:**
- Specify if certain areas need more coverage
- Review test plan before execution

**With DevOps Agent:**
- Ensure SSH key is added before starting
- Have server credentials ready
