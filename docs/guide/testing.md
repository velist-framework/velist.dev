# Testing

Testing strategy di Velist menggunakan two-level approach: **Unit Tests** untuk business logic dan **E2E Tests** untuk critical flows.

---

## AI-Powered Testing (Recommended)

Gunakan QA Agent untuk automated testing:

```
@workflow/agents/qa.md

Verify fitur sudah sesuai requirement.
```

QA Agent akan:
1. **Code review** — Review kualitas kode
2. **Functional testing** — Test fitur utama
3. **Edge case testing** — Test skenario batas
4. **Generate test report** — Buat laporan testing
5. **Present ke client** — Tunggu approval sebelum deploy

### Output QA Agent

```
✅ TESTING SELESAI

📊 TEST REPORT

Status: [APPROVED / CHANGES_REQUESTED]

✅/❌ Acceptance Criteria
✅/❌ Security Tests
✅/❌ Performance Tests

📝 Findings:
[Detail issues jika ada]

🔍 FINAL REVIEW BEFORE DEPLOY
```

---

## Two-Level Testing Strategy

| Type | Tool | Use For | Speed |
|------|------|---------|-------|
| **Unit Tests** | bun:test | Business logic, API routes, validation | ⚡ Fast (ms) |
| **E2E Tests** | Playwright | Critical user flows, integration | 🐢 Slower (seconds) |

### Test Priority

1. **Unit test** untuk business logic (service.ts)
2. **Unit test** untuk API routes (api.ts)
3. **E2E test** untuk critical user flows saja

---

## Unit Tests (bun:test)

**Default choice** untuk semua fitur. Test business logic dan API secara isolated.

### Test Structure

```typescript
// tests/unit/invoices/api.test.ts
import { describe, it, expect } from 'bun:test'
import { Elysia } from 'elysia'
import { invoiceApi } from '../../../src/features/invoices/api'

describe('Invoice API', () => {
  const app = new Elysia().use(invoiceApi)

  it('should return list of invoices', async () => {
    const response = await app.handle(
      new Request('http://localhost/invoices')
    )
    expect(response.status).toBe(200)
  })

  it('should create new invoice', async () => {
    const response = await app.handle(
      new Request('http://localhost/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer: 'John Doe',
          amount: 100
        })
      })
    )
    expect(response.status).toBe(302) // Redirect after create
  })
})
```

### Service Testing

```typescript
// tests/unit/invoices/service.test.ts
import { describe, it, expect } from 'bun:test'
import { InvoiceService } from '../../../src/features/invoices/service'

describe('InvoiceService', () => {
  const service = new InvoiceService()

  it('should calculate total correctly', async () => {
    const result = await service.calculateTotal(['item1', 'item2'])
    expect(result).toBeGreaterThan(0)
  })

  it('should validate invoice data', async () => {
    const invalidData = { customer: '', amount: -100 }
    await expect(service.create(invalidData)).rejects.toThrow()
  })
})
```

### Running Unit Tests

```bash
# Run all unit tests
bun run test

# Watch mode
bun run test:watch

# Run specific folder
bun test tests/unit/invoices

# Run specific file
bun test tests/unit/invoices/api.test.ts
```

**Note:** E2E tests excluded dari `bun test` karena Playwright pakai sintaks berbeda (`test.describe`).

---

## E2E Tests (Playwright)

**Hanya untuk critical flows** yang melibatkan:
- Multi-step user journeys (register → login → dashboard)
- Browser-specific behavior (cookies, redirects)
- UI interactions (drag-drop, file upload, modals)
- Cross-page integration

### Jangan Buat E2E Test Untuk

- Simple CRUD (sudah covered by unit tests)
- Form validation (unit test lebih cepat)
- API response structure (unit test lebih reliable)

### E2E Example

```typescript
// tests/e2e/auth.spec.ts
import { test, expect } from '@playwright/test'

test('complete registration flow', async ({ page }) => {
  await page.goto('/auth/register')
  
  // Fill form
  await page.fill('input[name="name"]', 'Test User')
  await page.fill('input[name="email"]', 'test@example.com')
  await page.fill('input[name="password"]', 'password123')
  await page.fill('input[name="password_confirmation"]', 'password123')
  
  // Submit
  await page.click('button[type="submit"]')
  
  // Should redirect to dashboard after registration
  await expect(page).toHaveURL(/.*dashboard.*/)
})

test('login and create invoice', async ({ page }) => {
  // Login
  await page.goto('/auth/login')
  await page.fill('input[name="email"]', 'admin@example.com')
  await page.fill('input[name="password"]', 'password123')
  await page.click('button[type="submit"]')
  
  // Create invoice
  await page.goto('/invoices/create')
  await page.fill('input[name="customer"]', 'Test Customer')
  await page.fill('input[name="amount"]', '500')
  await page.click('button[type="submit"]')
  
  // Should redirect to invoice list
  await expect(page).toHaveURL('/invoices')
})
```

### Running E2E Tests

**Important:** Playwright requires Node.js, not Bun.

```bash
# Run E2E tests
bun run test:e2e

# Interactive UI mode
npx playwright test --ui

# Headed mode (see browser)
npx playwright test --headed

# Run specific test
npx playwright test tests/e2e/auth.spec.ts
```

### E2E Configuration

Test database: `db/test.sqlite` (auto-created, auto-cleaned)

E2E tests automatically:
1. Start dev server (`bun run dev:server`)
2. Use separate test database
3. Clean up after completion

---

## Test Commands

| Command | Description |
|---------|-------------|
| `bun run test` | Run unit tests |
| `bun run test:watch` | Watch mode for unit tests |
| `bun run test:e2e` | Run E2E tests (Playwright) |
| `npx playwright test --ui` | Interactive E2E mode |

---

## Testing Best Practices

### Unit Tests

- **Test business logic** di service layer
- **Test API routes** untuk happy path dan error cases
- **Mock database** untuk test isolation
- **Fast feedback** - unit test harus cepat (< 100ms)

### E2E Tests

- **Focus on user journeys**, bukan individual features
- **Minimize test count** - hanya critical flows
- **Use data-testid** untuk selector yang stabil
- **Idempotent** - test bisa di-run berulang kali

### File Organization

```
tests/
├── unit/
│   ├── invoices/
│   │   ├── api.test.ts
│   │   └── service.test.ts
│   └── auth/
│       └── service.test.ts
└── e2e/
    ├── auth.spec.ts
    └── invoices.spec.ts
```

---

## QA Workflow

```
Developer Agent → [Client Approve] → QA Agent → [Client Approve] → DevOps Agent
                    Implementation          Testing               Deploy
```

Setiap tahap ada **mandatory review point**. Tidak ada auto-skip.
