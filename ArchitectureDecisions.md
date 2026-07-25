# Architecture Decisions

## ADR-0001: Modular Monolith First

- Status: accepted
- Decision: start with a NestJS modular monolith instead of microservices
- Why: faster delivery, simpler local development, easier interview demonstration, and cleaner transactional consistency while the domain is still stabilizing
- Trade-off: service extraction is deferred, so module boundaries must stay strict from day one

## ADR-0002: Multi-Tenant Organization Model

- Status: accepted
- Decision: design data ownership around `Organization` even for an initial single-tenant demo
- Why: better SaaS credibility, cleaner RBAC, and safer growth path
- Trade-off: slightly more schema and authorization complexity upfront

## ADR-0003: Fail-Safe AI

- Status: accepted
- Decision: low-confidence or weak-evidence outcomes escalate instead of forcing an answer
- Why: aligns with support operations, reduces hallucination risk, and keeps the system explainable
- Trade-off: lower raw automation rate, higher trust and correctness

## ADR-0004: Append-Only AI Run Logs

- Status: accepted
- Decision: store each AI execution as a new `AiRun` record
- Why: preserves observability, supports audits, and enables quality analytics
- Trade-off: more storage and reporting logic than mutating a single current-state record

## ADR-0005: Pgvector In PostgreSQL

- Status: accepted
- Decision: keep vectors in Supabase PostgreSQL using pgvector
- Why: simpler operations, shared transactional boundary, and production credibility without extra infrastructure
- Trade-off: dedicated vector platforms may outperform this design at larger scale

## ADR-0006: Gemini For LLM Orchestration

- Status: accepted
- Decision: use the Gemini API for classification and decisioning instead of OpenAI
- Why: aligns with the chosen runtime provider for this project and still supports structured JSON outputs for governed AI workflows
- Trade-off: prompt and SDK integration differ from the original platform brief, so provider abstraction should remain in place for future swaps

## ADR-0007: Hybrid Retrieval During Rollout

- Status: accepted
- Decision: use Gemini embeddings with pgvector search when available, and fall back to lexical chunk scoring when vector indexing is unavailable
- Why: keeps the product operational during local setup and staged infrastructure rollout without blocking grounded-response features
- Trade-off: retrieval quality is environment-dependent until pgvector is provisioned everywhere

## ADR-0008: Expose Observability In The Operator Workspace

- Status: accepted
- Decision: surface analytics summaries and append-only `AiRun` logs directly inside the protected Next.js operator app
- Why: makes AI decisions inspectable during normal support workflows and demonstrates auditability without requiring separate admin tooling
- Trade-off: dashboard pages now depend on authenticated API availability, so degraded backend access reduces operator visibility

## ADR-0009: Store Organization-Level Runtime AI Settings

- Status: accepted
- Decision: keep AI model selection, confidence threshold, embedding model, chunking, and retrieval parameters in `OrganizationSettings` and resolve them at runtime inside AI and knowledge workflows
- Why: makes the platform demonstrably configurable for SaaS tenants and ensures settings changes immediately affect retrieval and decisioning behavior
- Trade-off: runtime flows now depend on settings resolution, so default provisioning and validation must stay reliable

## ADR-0010: Deploy Web And API As Separate Services From One Monorepo

- Status: accepted
- Decision: keep the monorepo for shared types and coordinated builds, but ship the Next.js app and NestJS API as separate deployable services with dedicated Dockerfiles
- Why: matches the target hosting model of Vercel plus Render while preserving shared contracts and a single CI pipeline
- Trade-off: deployment configuration is slightly more involved than a single container, and environment variables must stay coordinated across both services
