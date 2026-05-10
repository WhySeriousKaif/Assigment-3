"use client";

import { useState, useRef, useEffect } from "react";
import { useChat } from "@ai-sdk/react";
import { useDropzone } from "react-dropzone";
import { UploadCloud, FileText, Send, Loader2, Bot, User, ChevronLeft, ChevronRight, Search, ZoomIn, ZoomOut } from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Navbar from "@/components/Navbar";
import dynamic from "next/dynamic";

const PDFDocument = dynamic(() => import("react-pdf").then(mod => mod.Document), { ssr: false });
const Page = dynamic(() => import("react-pdf").then(mod => mod.Page), { ssr: false });

// Set up PDF.js worker
if (typeof window !== "undefined") {
  const { pdfjs } = require("react-pdf");
  pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
}

export default function ChatPage() {
  const [collectionName, setCollectionName] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState("");
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.0);
  
  const scrollRef = useRef<HTMLDivElement>(null);

  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: "/api/chat",
    body: {
      collectionName,
    },
    onError: (err) => {
      console.error(err);
      alert("Error generating response. Make sure API keys are set correctly.");
    }
  });

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const onDrop = async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setPdfFile(file);
    setPdfUrl(URL.createObjectURL(file));
    setPageNumber(1);
    setIsUploading(true);
    setUploadProgress("Preparing document...");
    
    const newCollectionName = `doc_${uuidv4().replace(/-/g, '_')}`;
    const formData = new FormData();
    formData.append("file", file);
    formData.append("collectionName", newCollectionName);

    try {
      setUploadProgress("Indexing PDF for search...");
      const res = await fetch("/api/ingest", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      
      if (res.ok) {
        setCollectionName(newCollectionName);
        setUploadProgress("Ready!");
      } else {
        alert(data.error || "Failed to ingest document");
        setUploadProgress("Upload failed.");
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred during upload.");
      setUploadProgress("Upload failed.");
    } finally {
      setIsUploading(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"] },
    maxFiles: 1,
  });

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
  }

  return (
    <div className="h-screen bg-neutral-950 text-neutral-50 flex flex-col overflow-hidden selection:bg-indigo-500/30">
      <Navbar />
      
      <div className="flex-1 flex flex-col md:flex-row pt-16 overflow-hidden">
        
        {/* Left Side: PDF Viewer & Upload */}
        <div className="w-full md:w-1/2 border-r border-neutral-800 flex flex-col bg-neutral-900/50 overflow-hidden">
          
          {/* PDF Controls */}
          <div className="h-12 border-b border-neutral-800 flex items-center justify-between px-4 bg-neutral-900 shrink-0">
            <div className="flex items-center gap-2">
              {!pdfUrl && <span className="text-sm text-neutral-500 font-medium">No document loaded</span>}
              {pdfUrl && (
                <>
                  <button 
                    onClick={() => setPageNumber(prev => Math.max(prev - 1, 1))}
                    disabled={pageNumber <= 1}
                    className="p-1 hover:bg-neutral-800 rounded disabled:opacity-30"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <span className="text-xs font-mono">
                    Page {pageNumber} of {numPages || "?"}
                  </span>
                  <button 
                    onClick={() => setPageNumber(prev => Math.min(prev + 1, numPages || prev))}
                    disabled={pageNumber >= (numPages || 1)}
                    className="p-1 hover:bg-neutral-800 rounded disabled:opacity-30"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button onClick={() => setScale(s => s - 0.1)} className="p-1 hover:bg-neutral-800 rounded">
                <ZoomOut className="h-4 w-4" />
              </button>
              <button onClick={() => setScale(s => s + 0.1)} className="p-1 hover:bg-neutral-800 rounded">
                <ZoomIn className="h-4 w-4" />
              </button>
              <div 
                {...getRootProps()} 
                className="ml-4 bg-indigo-600 hover:bg-indigo-700 text-[10px] uppercase tracking-wider font-bold px-3 py-1 rounded cursor-pointer transition-colors"
              >
                <input {...getInputProps()} />
                {isUploading ? "Uploading..." : "Replace PDF"}
              </div>
            </div>
          </div>

          {/* PDF Content Area */}
          <div className="flex-1 overflow-auto bg-neutral-950 flex items-start justify-center p-4 custom-scrollbar">
            {!pdfUrl ? (
              <div 
                {...getRootProps()} 
                className={`w-full max-w-md aspect-[3/4] border-2 border-dashed rounded-3xl flex flex-col items-center justify-center space-y-6 transition-all mt-12
                  ${isDragActive ? 'border-indigo-500 bg-indigo-500/10' : 'border-neutral-800 hover:border-neutral-700 bg-neutral-900/50'}
                `}
              >
                <input {...getInputProps()} />
                <div className="p-6 bg-neutral-800 rounded-full">
                  <UploadCloud className="h-12 w-12 text-neutral-500" />
                </div>
                <div className="text-center px-6">
                  <p className="text-lg font-bold mb-2">Upload your PDF</p>
                  <p className="text-neutral-500 text-sm">Drag and drop your file here to start the magic.</p>
                </div>
              </div>
            ) : (
              <div className="shadow-2xl shadow-black">
                <PDFDocument
                  file={pdfUrl}
                  onLoadSuccess={onDocumentLoadSuccess}
                  loading={<Loader2 className="h-8 w-8 animate-spin text-indigo-500 mt-20" />}
                >
                  <Page 
                    pageNumber={pageNumber} 
                    scale={scale} 
                    renderAnnotationLayer={false} 
                    renderTextLayer={true}
                    className="max-w-full"
                  />
                </PDFDocument>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Chat */}
        <div className="w-full md:w-1/2 flex flex-col bg-neutral-950 overflow-hidden">
          
          {/* Chat Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-6 opacity-50">
                <div className="h-20 w-20 bg-neutral-900 rounded-3xl flex items-center justify-center">
                  <Bot className="h-10 w-10 text-indigo-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold mb-2">AI Document Assistant</h2>
                  <p className="text-neutral-500 max-w-xs mx-auto text-sm">
                    Ask anything about the document. I'll provide answers grounded in the text.
                  </p>
                </div>
              </div>
            ) : (
              messages.map((message) => (
                <div 
                  key={message.id} 
                  className={`flex items-start gap-4 ${message.role === "user" ? "flex-row-reverse" : ""}`}
                >
                  <div className={`shrink-0 h-8 w-8 rounded-full flex items-center justify-center ${message.role === 'user' ? 'bg-indigo-500 shadow-lg shadow-indigo-500/20' : 'bg-neutral-900 border border-neutral-800'}`}>
                    {message.role === 'user' ? <User className="h-4 w-4 text-white" /> : <Bot className="h-4 w-4 text-indigo-400" />}
                  </div>
                  <div 
                    className={`px-5 py-4 rounded-2xl max-w-[90%] text-sm leading-relaxed
                      ${message.role === "user" 
                        ? "bg-indigo-600 text-white rounded-tr-sm" 
                        : "bg-neutral-900/80 text-neutral-200 border border-neutral-800 rounded-tl-sm"
                      }
                    `}
                  >
                    <div className="max-w-none text-neutral-200">
                      <ReactMarkdown 
                        remarkPlugins={[remarkGfm]}
                        components={{
                          p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                          ul: ({ children }) => <ul className="list-disc pl-4 mb-2">{children}</ul>,
                          ol: ({ children }) => <ol className="list-decimal pl-4 mb-2">{children}</ol>,
                          li: ({ children }) => <li className="mb-1">{children}</li>,
                          strong: ({ children }) => <strong className="font-bold text-indigo-300">{children}</strong>,
                        }}
                      >
                        {message.content}
                      </ReactMarkdown>
                    </div>
                  </div>
                </div>
              ))
            )}
            
            {isLoading && (
              <div className="flex items-start gap-4">
                <div className="shrink-0 h-8 w-8 rounded-full flex items-center justify-center bg-neutral-900 border border-neutral-800">
                  <Bot className="h-4 w-4 text-indigo-400 animate-pulse" />
                </div>
                <div className="px-5 py-4 rounded-2xl bg-neutral-900/50 border border-neutral-800 rounded-tl-sm flex gap-1 items-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-neutral-600 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-1.5 h-1.5 rounded-full bg-neutral-600 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-1.5 h-1.5 rounded-full bg-neutral-600 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}
          </div>

          {/* Chat Input */}
          <div className="p-6 bg-neutral-950/80 backdrop-blur-sm border-t border-neutral-900">
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                if (!collectionName) {
                  alert("Please upload a PDF first!");
                  return;
                }
                handleSubmit(e);
              }} 
              className="max-w-2xl mx-auto relative group"
            >
              <div className="relative">
                <input
                  className="w-full bg-neutral-900 border border-neutral-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-2xl px-6 py-4 pr-16 text-sm text-white placeholder-neutral-500 outline-none transition-all shadow-2xl"
                  value={input}
                  placeholder={collectionName ? "Ask a question..." : "Upload a document to chat..."}
                  onChange={handleInputChange}
                  disabled={!collectionName || isLoading}
                />
                <button 
                  type="submit"
                  disabled={!(input || "").trim() || !collectionName || isLoading}
                  className="absolute right-2 top-2 bottom-2 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-neutral-800 disabled:text-neutral-500 text-white rounded-xl flex items-center justify-center transition-all shadow-lg"
                >
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </button>
              </div>
              {!collectionName && (
                <p className="text-[10px] text-neutral-600 mt-2 text-center uppercase tracking-widest font-bold">
                  Document indexing required before chat
                </p>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
