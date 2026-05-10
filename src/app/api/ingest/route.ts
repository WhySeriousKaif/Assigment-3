import { NextResponse } from "next/server";
import { extractText } from "unpdf";
import { Document } from "@langchain/core/documents";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { QdrantVectorStore } from "@langchain/qdrant";
import { getEmbeddings } from "@/lib/qdrant";

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
    
    const docs = [
      new Document({
        pageContent: Array.isArray(text) ? text.join("\n") : text,
        metadata: { source: file.name },
      }),
    ];

    // Chunking: Split the document into smaller chunks for better retrieval
    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });
    
    const chunkedDocs = await textSplitter.splitDocuments(docs);

    // Embeddings and Storage
    const embeddings = getEmbeddings();
    
    await QdrantVectorStore.fromDocuments(chunkedDocs, embeddings, {
      url: process.env.QDRANT_URL || "http://localhost:6333",
      apiKey: process.env.QDRANT_API_KEY,
      collectionName: collectionName,
    });

    return NextResponse.json({ success: true, message: "Ingestion complete", chunks: chunkedDocs.length });
  } catch (error: any) {
    console.error("Error during ingestion:", error);
    return NextResponse.json({ error: error.message || "Something went wrong" }, { status: 500 });
  }
}
