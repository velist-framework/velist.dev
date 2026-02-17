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

## Rule: One Folder = One Feature

All code for a feature lives together:

| Component | Location |
|-----------|----------|
| API routes | `features/[name]/api.ts` |
| Business logic | `features/[name]/service.ts` |
| Database | `features/[name]/repository.ts` |
| UI pages | `features/[name]/pages/*.svelte` |

---

## Shared Code

Code used by multiple features goes in `shared/`:

```
shared/
├── lib/
│   └── uuid.ts          # UUID v7 generator
└── styles/
    └── app.css          # Tailwind + global styles
```

---

## Core Infrastructure

Shared infrastructure lives in `features/_core/`:

```
features/_core/
├── auth/                # Authentication system
├── database/            # Connection, schema, migrations
└── errors/              # Error pages
```

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
