# GFT-Assist-AI

Production-ready AI-powered customer support and intelligent ticket routing platform.

## Foundation Documents

1. [ProductRequirements.md](./ProductRequirements.md)
2. [FunctionalRequirements.md](./FunctionalRequirements.md)
3. [NonFunctionalRequirements.md](./NonFunctionalRequirements.md)
4. [Architecture.md](./Architecture.md)
5. [FolderStructure.md](./FolderStructure.md)
6. [Database.md](./Database.md)
7. [`prisma/schema.prisma`](./prisma/schema.prisma)
8. [API.md](./API.md)
9. [UIUX.md](./UIUX.md)
10. [AI.md](./AI.md)
11. [RAG.md](./RAG.md)
12. [PromptStrategy.md](./PromptStrategy.md)
13. [Roadmap.md](./Roadmap.md)
14. [ArchitectureDecisions.md](./ArchitectureDecisions.md)
15. [Deployment.md](./Deployment.md)
16. [Testing.md](./Testing.md)

## Product Goals

- Receive and triage customer support requests across channels
- Ground AI answers in internal knowledge with citations
- Escalate low-confidence or urgent cases to human operators
- Track every AI decision for observability, governance, and analytics
- Stay deployable, testable, and interview-ready at every stage

## Proposed Platform Modules

- Authentication
- Dashboard
- Tickets
- Knowledge Base
- AI Agent
- Analytics
- Logs
- Settings

## Delivery Approach

- Phase 1: product and architecture foundation
- Phase 2: platform scaffolding and shared infrastructure
- Phase 3: module-by-module implementation with verification gates
- Phase 4: production hardening, deployment, and demo readiness

## Workspace

- `apps/web`: Next.js operator and public intake application
- `apps/api`: NestJS API for auth, tickets, knowledge, AI, analytics, logs, and settings
- `packages/types`: shared TypeScript contracts used by both apps
- `prisma`: normalized PostgreSQL schema and Prisma configuration

## Local Development

1. Copy `.env.example` to `.env` and fill in Supabase, Gemini, and PostgreSQL values.
2. Install dependencies:
   `npm ci`
3. Generate Prisma client:
   `npm run db:generate`
4. Start the frontend:
   `npm run dev:web`
5. Start the API:
   `npm run dev:api`

## Verification

- Tests: `npm test`
- Type safety: `npm run typecheck`
- Production builds: `npm run build`

## Deployment

- Local container orchestration: [`docker-compose.yml`](./docker-compose.yml)
- API container: [`apps/api/Dockerfile`](./apps/api/Dockerfile)
- Web container: [`apps/web/Dockerfile`](./apps/web/Dockerfile)
- CI workflow: [`.github/workflows/ci.yml`](./.github/workflows/ci.yml)
