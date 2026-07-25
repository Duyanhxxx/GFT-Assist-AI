# UI/UX Design

## Product Experience Goals

- Make operator decision-making faster than inbox-style support tools
- Keep AI behavior visible, not hidden behind opaque automation
- Surface urgency, confidence, and evidence at the point of action

## Primary Screens

- Sign in and password reset
- Dashboard overview
- Ticket queue
- Ticket detail with conversation, AI analysis, and citations
- Knowledge base document management
- AI run logs and override history
- Settings

## Ticket Detail Layout

- Left column: ticket metadata, requester details, assignment, status controls
- Center column: conversation timeline and reply composer
- Right column: AI insights, confidence, duplicate candidates, retrieved evidence, and escalation reason

## UX Rules

- Critical and urgent tickets are visually distinct and queue-prioritized
- AI suggestions are never auto-hidden; operators can inspect reasoning and evidence
- Escalation and override actions require clear confirmation and reason capture
- Knowledge citations link directly to source document and chunk context

## Design System Direction

- Tailwind CSS v4 plus shadcn/ui primitives
- Clear density for operations workflows
- Accessible contrast, keyboard navigation, and form states
- Reusable status badges, metric cards, data tables, and side panels
