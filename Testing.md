# Testing

## Automated Checks

The current repository verification flow is command-driven and runs cleanly in CI:

```bash
npm test
npm run typecheck
npm run build
```

## Current Coverage

### API Unit Tests

`apps/api/src/modules/knowledge-base/services/chunking.service.test.ts`

Validates:

- chunk splitting with overlap
- whitespace trimming
- token estimation

Run API tests directly:

```bash
npm run test --workspace @gft-assist/api
```

## Static Verification

- `npm run typecheck` validates strict TypeScript contracts across web, API, and shared packages.
- `npm run build` verifies the NestJS production build and the Next.js production bundle.

## Manual Smoke Checklist

Use this checklist against a configured environment:

1. Sign in through `/login`.
2. Open `/dashboard` and verify analytics cards load.
3. Create a ticket through `/submit-ticket`.
4. Review the ticket queue and ticket detail pages.
5. Upload a knowledge document from `/knowledge-base`.
6. Run AI triage and grounded response from a ticket detail page.
7. Open `/ai-runs` and confirm the new AI execution is visible.
8. Open `/settings` and confirm admins can save configuration changes.

## CI

GitHub Actions runs the same validation flow defined in `.github/workflows/ci.yml`, so local verification and pull request verification stay aligned.
