if (typeof globalThis.fetch === 'function') {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = function (url, init) {
    if (init && typeof init === "object" && "dispatcher" in init) {
      const newInit = { ...init };
      delete newInit.dispatcher;
      return originalFetch(url, newInit);
    }
    return originalFetch(url, init);
  };
}

import { QdrantVectorStore } from "@langchain/qdrant";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";

export function getEmbeddings() {
  return new GoogleGenerativeAIEmbeddings({
    model: "gemini-embedding-001",
    // apiKey will be automatically picked up from process.env.GOOGLE_API_KEY
  });
}

export async function getVectorStore(collectionName: string) {
  const embeddings = getEmbeddings();
  
  return await QdrantVectorStore.fromExistingCollection(embeddings, {
    url: process.env.QDRANT_URL || "http://localhost:6333",
    apiKey: process.env.QDRANT_API_KEY,
    collectionName: collectionName,
  });
}
