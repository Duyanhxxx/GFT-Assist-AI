# API Design

## Standards

- RESTful JSON API under `/api/v1`
- Request validation with DTOs and Zod-compatible contracts where shared
- Consistent response envelope for list metadata and error payloads
- RBAC enforced with guards and organization scoping

## Core Resources

- `POST /auth/forgot-password`
- `GET /me`
- `GET /dashboard/summary`
- `GET /tickets`
- `POST /tickets`
- `GET /tickets/:ticketId`
- `POST /tickets/:ticketId/messages`
- `POST /tickets/:ticketId/assign`
- `POST /tickets/:ticketId/escalate`
- `POST /tickets/:ticketId/resolve`
- `GET /knowledge-documents`
- `POST /knowledge-documents`
- `GET /knowledge-documents/:documentId`
- `POST /knowledge-documents/:documentId/reprocess`
- `POST /ai/tickets/:ticketId/retry`
- `GET /ai-runs`
- `GET /human-overrides`
- `GET /settings`
- `PATCH /settings`

## Response Conventions

```json
{
  "data": {},
  "meta": {
    "requestId": "req_123",
    "timestamp": "2026-07-25T14:00:00.000Z"
  }
}
```

## Error Contract

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request payload",
    "details": {}
  },
  "meta": {
    "requestId": "req_123",
    "timestamp": "2026-07-25T14:00:00.000Z"
  }
}
```

## Pagination And Filtering

- Cursor pagination for tickets, logs, and AI runs
- Filter fields for status, priority, assignee, category, confidence, and date range
- Sort fields for created time, updated time, priority, and confidence
