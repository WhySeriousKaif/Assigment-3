import { getVectorStore } from "@/lib/qdrant";
import { streamText } from "ai";
import { createOpenAI } from "@ai-sdk/openai";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const CHAT_MODELS = ["gpt-4o-mini", "gpt-4o"] as const;

function getMessageText(content: unknown): string {
  if (typeof content === "string") return content;
  if (Array.isArray(content)) {
    return content
      .map((part) => {
        if (typeof part === "string") return part;
        if (part && typeof part === "object" && "text" in part) {
          return String((part as { text?: string }).text ?? "");
        }
        return "";
      })
      .join("");
  }
  return "";
}

export async function POST(req: Request) {
  try {
    const { messages, collectionName } = await req.json();

    if (!collectionName) {
      return new Response("Missing collectionName", { status: 400 });
    }

    if (!messages?.length) {
      return new Response("Missing messages", { status: 400 });
    }

    if (!process.env.OPENAI_API_KEY) {
      return new Response("OPENAI_API_KEY is not configured", { status: 500 });
    }

    const lastMessage = messages[messages.length - 1];
    const userQuery = getMessageText(lastMessage.content).trim();

    if (!userQuery) {
      return new Response("Empty user message", { status: 400 });
    }

    const vectorStore = await getVectorStore(collectionName);
    const retriever = vectorStore.asRetriever({
      k: 4,
    });

    const searchedChunks = await retriever.invoke(userQuery);

    const contextText = searchedChunks
      .map((doc) => `[Page ${doc.metadata.pageNumber}]: ${doc.pageContent}`)
      .join("\n\n---\n\n");

    const systemPrompt = `You are an AI Assistant for a RAG application similar to Google NotebookLM.
Your goal is to answer the user's queries BASED ONLY ON THE PROVIDED CONTEXT.
Each piece of context starts with [Page X]. Always cite the page number(s) you use in your answer (e.g., "According to page 5...").
If the answer is not contained in the context, tell the user that you don't know or the document doesn't contain that information.
Do not hallucinate or use your general knowledge.

CONTEXT:
${contextText}`;

    const openai = createOpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    let lastError: Error | null = null;

    for (const modelName of CHAT_MODELS) {
      try {
        const result = await streamText({
          model: openai(modelName),
          system: systemPrompt,
          messages: messages,
          maxRetries: 2,
        });

        return result.toDataStreamResponse();
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        console.warn(`Chat model ${modelName} failed:`, lastError.message);
      }
    }

    throw lastError ?? new Error("All chat models failed");
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Something went wrong";
    console.error("Error in chat API:", error);
    return new Response(message, { status: 500 });
  }
}
