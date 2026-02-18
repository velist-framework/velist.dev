# Testing

Velist uses a two-level testing approach: **Unit Tests** for business logic and **E2E Tests** for critical flows.

---

## AI-Powered Testing (Recommended)

Use the QA Agent for automated testing:

```
@workflow/agents/qa.md

Verify the feature meets requirements.
```

The QA Agent will:
1. **Code review** — Review code quality
2. **Functional testing** — Test main features
3. **Edge case testing** — Test boundary scenarios
4. **Generate test report** — Create testing report
5. **Present to client** — Wait for approval before deploy

### QA Agent Output

```
✅ TESTING COMPLETE

📊 TEST REPORT

Status: [APPROVED / CHANGES_REQUESTED]

✅/❌ Acceptance Criteria
✅/❌ Security Tests
✅/❌ Performance Tests

📝 Findings:
[Detail issues if any]

🔍 FINAL REVIEW BEFORE DEPLOY
```

---

## Two-Level Testing Strategy

| Type | Tool | Use For | Speed |
|------|------|---------|-------|
| **Unit Tests** | bun:test | Business logic, API routes, validation | ⚡ Fast (ms) |
| **E2E Tests** | Playwright | Critical user flows, integration | 🐢 Slower (seconds) |

### Test Priority

1. **Unit test** for business logic (service.ts)
2. **Unit test** for API routes (api.ts)
3. **E2E test** for critical user flows only

---

## Unit Tests (bun:test)

**Default choice** for all features. Test business logic and API in isolation.

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

**Note:** E2E tests are excluded from `bun test` because Playwright uses different syntax (`test.describe`).

---

## E2E Tests (Playwright)

**Only for critical flows** that involve:
- Multi-step user journeys (register → login → dashboard)
- Browser-specific behavior (cookies, redirects)
- UI interactions (drag-drop, file upload, modals)
- Cross-page integration

### Don't Create E2E Tests For

- Simple CRUD (already covered by unit tests)
- Form validation (unit tests are faster)
- API response structure (unit tests are more reliable)

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

- **Test business logic** in the service layer
- **Test API routes** for happy path and error cases
- **Mock database** for test isolation
- **Fast feedback** - unit tests should be fast (< 100ms)

### E2E Tests

- **Focus on user journeys**, not individual features
- **Minimize test count** - only critical flows
- **Use data-testid** for stable selectors
- **Idempotent** - tests can be run repeatedly

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

Each stage has a **mandatory review point**. No auto-skip.
