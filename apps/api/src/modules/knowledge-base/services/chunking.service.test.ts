import assert from "node:assert/strict";
import test from "node:test";

import { ChunkingService } from "./chunking.service.js";

test("chunking service splits text with overlap", () => {
  const service = new ChunkingService();
  const chunks = service.chunk("abcdefghijklmnopqrst", {
    chunkSize: 10,
    chunkOverlap: 2,
  });

  assert.equal(chunks.length, 3);
  assert.deepEqual(
    chunks.map((chunk) => chunk.content),
    ["abcdefghij", "ijklmnopqr", "qrst"],
  );
});

test("chunking service trims whitespace and estimates tokens", () => {
  const service = new ChunkingService();
  const chunks = service.chunk("   hello world   ", {
    chunkSize: 50,
    chunkOverlap: 0,
  });

  assert.equal(chunks.length, 1);
  assert.equal(chunks[0]?.content, "hello world");
  assert.equal(chunks[0]?.tokenCount, 3);
});
