# Folder Structure

## Monorepo Layout

```text
.
├── apps
│   ├── web
│   └── api
├── packages
│   ├── config
│   ├── types
│   ├── ui
│   ├── validation
│   └── ai-contracts
├── prisma
├── docs
│   └── adr
├── tests
│   ├── integration
│   └── e2e
├── .github
│   └── workflows
└── docker
```

## Frontend Structure

```text
apps/web/src
├── app
├── features
├── components
├── hooks
├── lib
├── providers
└── stores
```

## Backend Structure

```text
apps/api/src
├── modules
│   ├── auth
│   ├── users
│   ├── tickets
│   ├── knowledge-base
│   ├── ai-agent
│   ├── analytics
│   ├── logs
│   └── settings
├── common
├── infrastructure
└── main.ts
```

## Design Notes

- Shared packages hold cross-app contracts and primitives only
- Each backend feature owns its controller, DTOs, use cases, entities, repository interfaces, and infrastructure adapters
- Tests mirror runtime modules to keep ownership clear
