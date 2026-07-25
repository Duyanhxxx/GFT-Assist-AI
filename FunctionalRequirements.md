# Functional Requirements

## Authentication

- Users can sign in with email and password via Supabase Auth
- Users can request password reset
- Protected routes enforce authenticated access
- Role-based access control limits actions by Admin, Operator, and Viewer

## Ticket Intake And Lifecycle

- Customers can submit tickets with subject, message, attachments, and contact details
- System detects language, intent, sentiment, spam likelihood, duplicate likelihood, urgency, and confidence
- Tickets move through statuses: new, in progress, waiting customer, resolved, escalated, spam, closed
- Operators can assign, reassign, respond, resolve, and escalate tickets

## AI Decision Engine

- AI classifies incoming requests
- AI chooses one of four outcomes: grounded response, follow-up questions, escalation, urgent routing
- AI must return structured reasoning, confidence score, and evidence references
- Low-confidence outcomes automatically escalate

## Knowledge Base

- Operators can upload PDF, DOCX, TXT, and Markdown documents
- System extracts text, chunks content, generates embeddings, and stores retrievable vectors
- Knowledge search supports semantic retrieval with configurable top-k
- Each AI answer cites supporting knowledge chunks

## Observability And Governance

- Platform logs every AI run with prompts, model, latency, tokens, cost, retrieved chunks, citations, and outcome
- Operators can review AI decisions and create human overrides
- Dashboard exposes support, quality, and cost metrics

## Settings

- Admins can configure model, temperature, confidence threshold, embedding model, chunk size, overlap, and retrieval top-k
- Settings are versioned and auditable

## API And Documentation

- Backend exposes typed REST endpoints for every feature module
- Requests are validated and responses are documented
- Errors follow a consistent contract
