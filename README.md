# NotebookLM RAG Clone

This is a RAG-powered application built as a clone of Google NotebookLM. It allows users to upload a PDF document and have a natural language conversation with it.

## Features
- **Upload PDF:** Drag & drop your PDF file to ingest it.
- **Chunking Strategy:** Uses LangChain's `RecursiveCharacterTextSplitter` (chunk size: 1000, overlap: 200).
- **Vector Database:** Uses **Qdrant** to store embedded chunks.
- **LLM Integration:** Uses **OpenAI GPT-4o-mini** and **text-embedding-3-small** for grounded answers with page citations.
- **Modern UI:** Built with Next.js App Router and Tailwind CSS.

## Setup Instructions

### 1. Clone the repository

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Variables
Rename `.env.local.example` (or create a `.env.local` file) in the root directory and add the following keys:
```env
OPENAI_API_KEY=your_openai_api_key_here
# For Local Qdrant (Docker)
QDRANT_URL=http://localhost:6333
# Or for Qdrant Cloud:
# QDRANT_URL=https://your-cluster-url.cloud.qdrant.io
# QDRANT_API_KEY=your_qdrant_api_key
```

### 4. Run Qdrant Locally (Optional)
If you don't use Qdrant Cloud, run Qdrant locally using Docker:
```bash
docker run -p 6333:6333 -p 6334:6334 \
    -v $(pwd)/qdrant_storage:/qdrant/storage:z \
    qdrant/qdrant
```

### 5. Start the Development Server
```bash
npm run dev
```

Visit `http://localhost:3000` to start chatting with your documents.

## Deployment to Vercel
1. Push this repository to GitHub.
2. Sign in to [Vercel](https://vercel.com/) and import the repository.
3. In the Vercel dashboard, add the environment variables:
   - `OPENAI_API_KEY`
   - `QDRANT_URL` (must be a Qdrant Cloud URL)
   - `QDRANT_API_KEY`
4. Click Deploy.
