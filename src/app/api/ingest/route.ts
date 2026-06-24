import { NextResponse } from "next/server";
import { extractText } from "unpdf";
import { Document } from "@langchain/core/documents";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { QdrantVectorStore } from "@langchain/qdrant";
import { getEmbeddings, getQdrantStoreOptions } from "@/lib/qdrant";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const collectionName = formData.get("collectionName") as string;

    if (!file || !collectionName) {
      return NextResponse.json(
        { error: "File and collectionName are required." },
        { status: 400 }
      );
    }

    // Extract text from PDF using unpdf
    const buffer = await file.arrayBuffer();
    const { text } = await extractText(new Uint8Array(buffer));
    
    const pages = (Array.isArray(text) ? text : [text]).filter(
      (pageText) => typeof pageText === "string" && pageText.trim().length > 0
    );

    if (pages.length === 0) {
      return NextResponse.json(
        { error: "Could not extract readable text from this PDF." },
        { status: 422 }
      );
    }

    const docs = pages.map((pageText, index) =>
      new Document({
        pageContent: pageText,
        metadata: {
          source: file.name,
          pageNumber: index + 1,
        },
      })
    );

    // Chunking: Split the document into smaller chunks for better retrieval
    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });
    
    const chunkedDocs = await textSplitter.splitDocuments(docs);

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "OPENAI_API_KEY is not set. Add it to .env.local" },
        { status: 500 }
      );
    }

    const embeddings = getEmbeddings();

    await QdrantVectorStore.fromDocuments(
      chunkedDocs,
      embeddings,
      getQdrantStoreOptions(collectionName)
    );

    return NextResponse.json({ success: true, message: "Ingestion complete", chunks: chunkedDocs.length });
  } catch (error) {
    const baseMessage =
      error instanceof Error ? error.message : "Something went wrong";
    const cause =
      error instanceof Error && error.cause
        ? String(error.cause)
        : "";
    const message = cause ? `${baseMessage} — ${cause}` : baseMessage;
    console.error("Error during ingestion:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
