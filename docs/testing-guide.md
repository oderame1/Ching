# Testing Guide

## Test Structure

```
tests/
├── unit/          # Unit tests
├── integration/   # Integration tests
└── e2e/           # End-to-end tests
```

## Running Tests

```bash
# All tests
npm test

# Unit tests only
npm run test:unit

# Integration tests only
npm run test:integration

# E2E tests only
npm run test:e2e

# With coverage
npm run test:coverage
```

## Test Types

### Unit Tests
- Individual functions and utilities
- Business logic validation
- State machine transitions

### Integration Tests
- API endpoints
- Database operations
- External service integrations (mocked)

### E2E Tests
- Full user workflows
- Browser automation with Playwright
- Real user scenarios

## Example Test

```typescript
// tests/unit/escrow-state.test.ts
import { canTransition, EscrowState } from '@escrow/shared';

describe('Escrow State Transitions', () => {
  it('should allow transition from waiting_for_payment to paid', () => {
    expect(canTransition(EscrowState.WAITING_FOR_PAYMENT, EscrowState.PAID)).toBe(true);
  });

  it('should not allow invalid transitions', () => {
    expect(canTransition(EscrowState.PENDING, EscrowState.RELEASED)).toBe(false);
  });
});
```

## Test Database

Tests use a separate test database:
```
DATABASE_URL=postgresql://.../escrow_db_test
```

Database is reset before each test suite.

## Mocking

- Payment gateways are mocked in tests
- External APIs are mocked
- Redis is mocked for unit tests

## CI/CD

Tests run automatically on:
- Pull requests
- Commits to main/develop branches
- Pre-commit hooks (optional)

