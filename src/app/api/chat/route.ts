import { getVectorStore } from "@/lib/qdrant";
import { streamText, tool } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";

export async function POST(req: Request) {
  try {
    const { messages, collectionName } = await req.json();

    if (!collectionName) {
      return new Response("Missing collectionName", { status: 400 });
    }

    const lastMessage = messages[messages.length - 1];
    const userQuery = lastMessage.content;

    // Retrieve context from Qdrant
    const vectorStore = await getVectorStore(collectionName);
    const retriever = vectorStore.asRetriever({
      k: 4,
    });
    
    const searchedChunks = await retriever.invoke(userQuery);
    
    const contextText = searchedChunks.map(doc => doc.pageContent).join("\n\n---\n\n");

    const systemPrompt = `You are an AI Assistant for a RAG application similar to Google NotebookLM.
Your goal is to answer the user's queries BASED ONLY ON THE PROVIDED CONTEXT.
If the answer is not contained in the context, tell the user that you don't know or the document doesn't contain that information.
Do not hallucinate or use your general knowledge.

CONTEXT:
${contextText}`;

    const googleProvider = createGoogleGenerativeAI({
      apiKey: process.env.GOOGLE_API_KEY
    });

    const result = await streamText({
      model: googleProvider('gemini-flash-latest'),
      system: systemPrompt,
      messages: messages,
    });

    return result.toDataStreamResponse();
  } catch (error: any) {
    console.error("Error in chat API:", error);
    return new Response(error.message || "Something went wrong", { status: 500 });
  }
}
