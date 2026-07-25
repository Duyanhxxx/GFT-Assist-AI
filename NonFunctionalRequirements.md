# Non-Functional Requirements

## Reliability

- System must fail closed for unsupported or low-confidence AI outcomes
- Background ingestion and AI workflows must be retryable and idempotent
- Critical ticket operations require transactional consistency

## Security

- Enforce RBAC on all privileged actions
- Validate and sanitize all inputs
- Store secrets only in managed environment variables
- Apply rate limiting, secure headers, and audit logging

## Scalability

- Architecture must support horizontal scaling of API and worker processes
- Retrieval and analytics queries must use indexed access paths
- AI processing must be decoupled from synchronous user requests where practical

## Maintainability

- Feature-based modular architecture
- Clean architecture boundaries between controllers, services, domain, and persistence
- Strong typing across frontend, backend, and AI contracts
- Reusable UI primitives and shared validation schemas

## Performance

- Dashboard queries should use pre-aggregated or indexed data paths
- Ticket list and logs endpoints must support filtering, sorting, and pagination
- Retrieval latency should stay within acceptable support workflow limits

## Explainability

- Every AI decision must include evidence, confidence, and outcome traceability
- Unsupported answers must explicitly say information was insufficient

## Testability

- Unit, integration, and end-to-end coverage for business-critical workflows
- Deterministic structured-output contracts for AI orchestration

## Deployability

- Frontend deployable to Vercel
- Backend deployable to Render
- Database and storage deployable on Supabase
- CI must validate linting, types, tests, and build health
