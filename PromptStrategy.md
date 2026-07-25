# Prompt Strategy

## Principles

- Prefer structured outputs over free-form parsing
- Force grounded answers with explicit evidence requirements
- Make non-answering a first-class valid outcome
- Version prompts to keep behavior reviewable

## Prompt Layers

- System prompt: role, constraints, escalation policy, no-hallucination rule
- Task prompt: triage, response, follow-up, or summarization objective
- Context payload: ticket data, settings, retrieved chunks, and prior thread state
- Output schema: typed result with scores, rationale, citations, and outcome

## Required Behaviors

- Never claim knowledge outside retrieved context
- Ask clarifying questions when key fields are missing
- Escalate when confidence or evidence quality is insufficient
- Cite evidence for each substantive claim in a customer-facing answer

## Versioning

- Store `promptVersion` on every AI run
- Release prompt changes behind documented decision notes
- Evaluate prompt revisions against regression scenarios before rollout
