# Vertical Slicing Architecture

Velist organizes code by features, not by technical layers.

---

## The Problem with Horizontal Layers

Traditional frameworks organize like this:

```
controllers/
  UserController.ts
  PostController.ts
  CommentController.ts

models/
  User.ts
  Post.ts
  Comment.ts

views/
  users/
  posts/
  comments/
```

**Issues:**
- Jump between folders to work on one feature
- Hard to see what code belongs together
- Merge conflicts in shared folders
- Hard to delete or move a feature

---

## Vertical Slicing Solution

One folder = one complete feature:

```
features/
├── auth/
│   ├── api.ts           # Routes
│   ├── service.ts       # Business logic
│   ├── repository.ts    # Database access
│   └── pages/
│       ├── Login.svelte
│       └── Register.svelte
│
├── dashboard/
│   ├── api.ts
│   ├── service.ts
│   └── pages/
│       └── Index.svelte
│
└── invoices/
    ├── api.ts
    ├── service.ts
    ├── repository.ts
    └── pages/
        ├── Index.svelte
        ├── Create.svelte
        └── Edit.svelte
```

**Benefits:**
- Everything for a feature in one place
- Easy to understand, modify, or delete
- No merge conflicts between features
- Clear boundaries

---

## The Philosophy: Code That Changes Together, Stays Together

> **"Features are the primary unit of work, not layers."**

When you build a feature, you typically work on:
- Routes (API)
- Business logic (Service)
- Database queries (Repository)
- UI pages (Svelte)

**In horizontal layering:** You jump between 4 different folders.
**In vertical slicing:** Everything is in one folder.

### Real-World Analogy

Think of a restaurant:

**Horizontal (by role):**
- All chefs in one room
- All waiters in another room
- All cashiers in another room

*Problem: To serve a customer, you need to coordinate across 3 rooms.*

**Vertical (by station):**
- Sushi station (chef + waiter + cashier)
- Grill station (chef + waiter + cashier)
- Bar station (bartender + waiter + cashier)

*Each station is self-contained and independent.*

---

## The Three Layers Inside a Feature

Each feature has 3 layers with clear responsibilities:

```
┌─────────────────────────────────────┐
│  API (api.ts)                       │
│  - HTTP routes                      │
│  - Request/response handling        │
│  - Page rendering                   │
├─────────────────────────────────────┤
│  Service (service.ts)               │
│  - Business logic                   │
│  - Validation                       │
│  - Data transformation              │
├─────────────────────────────────────┤
│  Repository (repository.ts)         │
│  - Database queries                 │
│  - Data access                      │
│  - No business logic                │
└─────────────────────────────────────┘
```

### Why Three Layers?

| Layer | Why Separate? |
|-------|---------------|
| **API** | HTTP concern should be isolated from business logic. Easy to test without HTTP server. |
| **Service** | Business rules change often. Keep them isolated from database and HTTP details. |
| **Repository** | Database queries are implementation details. Easy to swap or optimize without affecting business logic. |

### Dependency Direction

```
API → Service → Repository
         ↓
      Database
```

- API depends on Service
- Service depends on Repository
- Repository depends on Database

**No reverse dependencies!** Repository doesn't know about Service. Service doesn't know about API.

---

## Rule: One Folder = One Feature

All code for a feature lives together:

| Component | Location | Purpose |
|-----------|----------|---------|
| API routes | `features/[name]/api.ts` | Define routes & render pages |
| Business logic | `features/[name]/service.ts` | Validation & business rules |
| Database | `features/[name]/repository.ts` | SQL queries |
| UI pages | `features/[name]/pages/*.svelte` | User interface |

---

## Shared Code

Code used by multiple features goes in `shared/`:

```
shared/
├── lib/                 # Utility functions
│   ├── uuid.ts         # UUID v7 generator
│   ├── toast.ts        # Toast notifications
│   ├── debounce.ts     # Debounce utility
│   └── csv.ts          # CSV export
├── components/         # Shared components
│   └── ToastContainer.svelte
├── layouts/            # Page layouts
│   ├── AppLayout.svelte
│   └── PublicLayout.svelte
└── styles/
    └── app.css         # Tailwind + global styles
```

**Rule:** If 2+ features use it → `shared/`. If only 1 feature uses it → keep in feature folder.

### When to Add to Shared

| Add to `shared/lib/` | Keep in Feature |
|---------------------|-----------------|
| UUID generator | Feature-specific validation |
| Toast notifications | Feature-specific calculations |
| Debounce/Throttle | Feature-specific helpers |
| CSV export | One-time use utilities |

| Add to `shared/components/` | Keep in Feature |
|---------------------------|-----------------|
| ToastContainer (used by all) | ProductCard (only in products) |
| Modal (complex, reusable) | InvoiceForm (only in invoices) |
| DataTable (complex, reusable) | LoginForm (only in auth) |

---

## Core Infrastructure

Shared infrastructure lives in `features/_core/`:

```
features/_core/
├── auth/                # Authentication system
├── database/            # Connection, schema, migrations
├── storage/             # File storage abstraction
└── errors/              # Error pages
```

**Why `_core`?**
- Convention: underscore prefix = infrastructure
- Contains cross-cutting concerns used by all features
- Auth, database, storage, error handling

---

## Example: Adding a Feature

Create invoices feature:

```bash
mkdir -p src/features/invoices/pages
touch src/features/invoices/{api.ts,service.ts,repository.ts}
touch src/features/invoices/pages/{Index.svelte,Create.svelte,Edit.svelte}
```

All invoice code is now in one place. Easy to find, modify, or remove.

---

## Key Principle

> **Organize by what the code does, not what the code is.**

| Instead of... | Think... |
|---------------|----------|
| "This is a controller" | "This handles invoices" |
| "This is a model" | "This fetches invoice data" |
| "This is a view" | "This shows the invoice list" |

---

## When to Break the Rules

### ✅ Keep in Feature
- Utility functions used by only that feature
- Components specific to that feature
- Types specific to that feature

### ✅ Move to Shared
- UUID generator (used by all features)
- CSV export utility
- Debounce function
- Toast notifications

### ✅ Create Component
- Modal (complex, reusable across features)
- DataTable (complex, reusable)
- Chart component

---

## Benefits in Practice

### 1. Easy Navigation
```bash
# Find everything about invoices:
find src/features/invoices -type f

# Result:
# api.ts
# service.ts
# repository.ts
# pages/Index.svelte
# pages/Create.svelte
```

### 2. Easy Deletion
```bash
# Remove entire feature:
rm -rf src/features/invoices

# Done. No orphaned code in controllers/, models/, views/.
```

### 3. Parallel Development
```bash
# Developer A works on invoices
git checkout -b feature/invoices

# Developer B works on customers
git checkout -b feature/customers

# No merge conflicts - different folders!
```

### 4. Clear Ownership
```
features/invoices/     → Invoice team's code
features/customers/    → Customer team's code
features/reports/      → Analytics team's code
```
