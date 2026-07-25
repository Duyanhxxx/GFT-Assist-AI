# AI Architecture

## AI Responsibilities

- Detect language
- Classify intent
- Estimate sentiment
- Detect spam
- Detect duplicate likelihood
- Predict priority and urgency
- Decide answer, follow-up, escalation, or urgent routing
- Summarize ticket state and suggest operator replies

## Orchestration Model

- Use structured outputs for every decision-bearing AI call
- Separate triage, response generation, and summarization into distinct run types
- Persist every run as an append-only audit record
- Gate autonomous responses behind confidence thresholds and retrieval quality

## Decision Engine

1. Run classification and scoring
2. Check hard rules for spam, urgency, and confidence floor
3. Run retrieval when knowledge grounding is possible
4. Choose outcome:
   - grounded response
   - follow-up questions
   - escalation
   - urgent routing

## Explainability Contract

Each AI run must store:

- structured output payload
- confidence score
- model and prompt version
- retrieved context references
- citation payload
- latency, tokens, and cost
- escalation or override markers
