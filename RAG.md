# RAG Architecture

## Ingestion Pipeline

1. Upload source document to Supabase Storage
2. Extract normalized text by file type
3. Chunk content with configurable size and overlap
4. Generate embeddings
5. Persist chunks and vectors
6. Mark document ready for retrieval

## Retrieval Pipeline

1. Build query from ticket content and detected intent
2. Fetch top-k semantic matches from `KnowledgeChunk`
3. Apply organization scope and document status filters
4. Return chunk metadata for citation rendering

## Generation Rules

- AI can answer only from retrieved context
- If evidence is weak or absent, AI must ask follow-up questions or escalate
- Responses must include citation references to chunk and document identifiers
- Missing knowledge must be stated explicitly

## Retrieval Quality Controls

- Configurable top-k
- Configurable chunk size and overlap
- Document checksum deduplication
- Logged retrieval set per AI run for post-hoc inspection
