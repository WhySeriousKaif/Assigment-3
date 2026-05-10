"use client";

import { useState } from "react";
import { useChat } from "@ai-sdk/react";
import { useDropzone } from "react-dropzone";
import { UploadCloud, FileText, Send, Loader2, Bot, User } from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Navbar from "@/components/Navbar";

export default function Home() {
  const [collectionName, setCollectionName] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState("");

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

  const onDrop = async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setIsUploading(true);
    setUploadProgress("Preparing document...");
    
    // Generate a unique collection name for this document
    const newCollectionName = `doc_${uuidv4().replace(/-/g, '_')}`;
    
    const formData = new FormData();
    formData.append("file", file);
    formData.append("collectionName", newCollectionName);

    try {
      setUploadProgress("Chunking and Embedding PDF...");
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
    accept: {
      "application/pdf": [".pdf"],
    },
    maxFiles: 1,
  });

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-50 flex flex-col selection:bg-indigo-500/30">
      <Navbar />
      
      <div className="flex-1 flex flex-col md:flex-row pt-16">
      {/* Sidebar for Upload */}
      <div className="w-full md:w-1/3 bg-neutral-900 border-r border-neutral-800 p-6 flex flex-col items-center justify-center min-h-[30vh] md:min-h-screen">
        <div className="max-w-sm w-full space-y-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent mb-2">NotebookLM Clone</h1>
            <p className="text-neutral-400 text-sm">Upload a PDF to start chatting with it.</p>
          </div>

          <div 
            {...getRootProps()} 
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200 ease-in-out group
              ${isDragActive ? 'border-blue-500 bg-blue-500/10' : 'border-neutral-700 hover:border-indigo-500 hover:bg-neutral-800'}
              ${collectionName && !isUploading ? 'border-green-500/50 bg-green-500/5' : ''}
            `}
          >
            <input {...getInputProps()} />
            
            <div className="flex flex-col items-center justify-center space-y-4">
              {isUploading ? (
                <Loader2 className="h-10 w-10 text-indigo-400 animate-spin" />
              ) : collectionName ? (
                <FileText className="h-10 w-10 text-green-400 group-hover:scale-110 transition-transform" />
              ) : (
                <UploadCloud className="h-10 w-10 text-neutral-500 group-hover:text-indigo-400 group-hover:scale-110 transition-transform" />
              )}
              
              <div className="text-sm">
                {isUploading ? (
                  <span className="text-indigo-300 font-medium">{uploadProgress}</span>
                ) : collectionName ? (
                  <span className="text-green-400 font-medium">Document Loaded Successfully</span>
                ) : isDragActive ? (
                  <span className="text-blue-400 font-medium">Drop the PDF here...</span>
                ) : (
                  <span className="text-neutral-300 font-medium">Drag & drop or click to upload PDF</span>
                )}
              </div>
            </div>
          </div>

          {collectionName && !isUploading && (
            <div className="bg-neutral-800/50 rounded-lg p-4 text-xs text-neutral-400 flex items-start gap-3">
              <div className="p-2 bg-indigo-500/10 rounded-md shrink-0">
                <FileText className="h-4 w-4 text-indigo-400" />
              </div>
              <p>Your document has been chunked, embedded, and stored in Qdrant. You can now ask questions about it in the chat interface.</p>
            </div>
          )}
        </div>
      </div>

      {/* Chat Interface */}
      <div className="flex-1 flex flex-col h-[70vh] md:h-screen relative bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-neutral-900 via-neutral-950 to-neutral-950">
        
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 scroll-smooth">
          <div className="max-w-3xl mx-auto space-y-6 pb-20">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-4 mt-32">
                <div className="h-16 w-16 bg-neutral-800 rounded-2xl flex items-center justify-center shadow-lg shadow-neutral-900">
                  <Bot className="h-8 w-8 text-indigo-400" />
                </div>
                <h2 className="text-xl font-medium text-neutral-200">Waiting for context...</h2>
                <p className="text-neutral-500 max-w-sm">
                  Upload a document on the left, then ask a question. I will only answer based on the provided document.
                </p>
              </div>
            ) : (
              messages.map((message) => (
                <div 
                  key={message.id} 
                  className={`flex items-start gap-4 ${message.role === "user" ? "flex-row-reverse" : ""}`}
                >
                  <div className={`shrink-0 h-8 w-8 rounded-full flex items-center justify-center ${message.role === 'user' ? 'bg-indigo-500' : 'bg-neutral-800 border border-neutral-700'}`}>
                    {message.role === 'user' ? <User className="h-4 w-4 text-white" /> : <Bot className="h-4 w-4 text-indigo-400" />}
                  </div>
                  <div 
                    className={`px-5 py-3.5 rounded-2xl max-w-[85%] text-sm leading-relaxed
                      ${message.role === "user" 
                        ? "bg-indigo-500 text-white rounded-tr-sm" 
                        : "bg-neutral-800/80 text-neutral-200 border border-neutral-700/50 rounded-tl-sm shadow-sm"
                      }
                    `}
                  >
                    <div className="prose prose-invert prose-sm max-w-none">
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
            
            {isLoading && messages[messages.length - 1]?.role === 'user' && (
              <div className="flex items-start gap-4">
                <div className="shrink-0 h-8 w-8 rounded-full flex items-center justify-center bg-neutral-800 border border-neutral-700">
                  <Bot className="h-4 w-4 text-indigo-400 animate-pulse" />
                </div>
                <div className="px-5 py-4 rounded-2xl bg-neutral-800/50 border border-neutral-700/50 rounded-tl-sm flex gap-1 items-center">
                  <div className="w-2 h-2 rounded-full bg-neutral-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 rounded-full bg-neutral-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 rounded-full bg-neutral-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Input Form */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-neutral-950 via-neutral-950 to-transparent">
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              if (!collectionName) {
                alert("Please upload a PDF first before chatting.");
                return;
              }
              handleSubmit(e);
            }} 
            className="max-w-3xl mx-auto relative group"
          >
            <input
              className="w-full bg-neutral-900 border border-neutral-700 focus:border-indigo-500 rounded-full px-6 py-4 pr-14 text-sm text-white placeholder-neutral-500 outline-none transition-all shadow-xl"
              value={input}
              placeholder={collectionName ? "Ask a question about your document..." : "Upload a PDF first..."}
              onChange={handleInputChange}
              disabled={!collectionName || isLoading}
            />
            <button 
              type="submit"
              disabled={!(input || "").trim() || !collectionName || isLoading}
              className="absolute right-2 top-2 bottom-2 aspect-square bg-indigo-500 hover:bg-indigo-600 disabled:bg-neutral-800 disabled:text-neutral-500 text-white rounded-full flex items-center justify-center transition-colors"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>

      </div>
      </div>
    </div>
  );
}
