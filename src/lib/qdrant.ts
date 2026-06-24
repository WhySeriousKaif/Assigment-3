// Qdrant's REST client passes an undici `dispatcher` to fetch, which breaks
// Next.js/Turbopack's patched fetch ("invalid onError method"). Strip it.
if (typeof globalThis.fetch === "function") {
  const originalFetch = globalThis.fetch.bind(globalThis);
  globalThis.fetch = ((url, init) => {
    if (init && typeof init === "object") {
      const { dispatcher: _d, ...safeInit } = init as RequestInit & {
        dispatcher?: unknown;
      };
      return originalFetch(url, safeInit);
    }
    return originalFetch(url, init);
  }) as typeof fetch;
}

import { QdrantClient } from "@qdrant/js-client-rest";
import { QdrantVectorStore } from "@langchain/qdrant";
import { OpenAIEmbeddings } from "@langchain/openai";

function normalizeQdrantUrl(url: string): string {
  const trimmed = url.replace(/\/$/, "");
  // Qdrant Cloud REST API expects explicit :6333 on the cluster URL
  if (trimmed.includes("cloud.qdrant.io") && !trimmed.match(/:\d+$/)) {
    return `${trimmed}:6333`;
  }
  return trimmed;
}

export function getQdrantClient(): QdrantClient {
  const url = normalizeQdrantUrl(
    process.env.QDRANT_URL || "http://localhost:6333"
  );

  return new QdrantClient({
    url,
    apiKey: process.env.QDRANT_API_KEY,
    checkCompatibility: false,
  });
}

export function getEmbeddings() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not set. Add it to .env.local");
  }

  return new OpenAIEmbeddings({
    model: "text-embedding-3-small",
    apiKey,
  });
}

export function getQdrantStoreOptions(collectionName: string) {
  return {
    client: getQdrantClient(),
    collectionName,
  };
}

export async function getVectorStore(collectionName: string) {
  const embeddings = getEmbeddings();

  return await QdrantVectorStore.fromExistingCollection(
    embeddings,
    getQdrantStoreOptions(collectionName)
  );
}
