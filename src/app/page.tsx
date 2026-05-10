import Link from "next/link";
import { ArrowRight, BookOpen, MessageSquare, Shield, Zap } from "lucide-react";
import Navbar from "@/components/Navbar";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-50 selection:bg-indigo-500/30">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/20 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/20 rounded-full blur-[120px]" />
        </div>

        <div className="max-w-5xl mx-auto text-center space-y-8 relative">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-900 border border-neutral-800 text-xs font-medium text-indigo-400 mb-4">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
            </span>
            Next-Gen RAG Architecture
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-[1.1]">
            Turn your PDFs into <br />
            <span className="bg-gradient-to-r from-indigo-400 via-blue-400 to-indigo-400 bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient">
              Living Knowledge
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-neutral-400 max-w-2xl mx-auto leading-relaxed">
            Upload your documents and chat with them in real-time. Powered by Google Gemini and Qdrant for lightning-fast, grounded responses.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link 
              href="/chat" 
              className="group bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-full text-lg font-bold transition-all shadow-xl shadow-indigo-600/20 flex items-center gap-2"
            >
              Get Started for Free
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <a 
              href="#features" 
              className="text-neutral-400 hover:text-neutral-50 px-8 py-4 rounded-full text-lg font-semibold transition-colors"
            >
              How it works
            </a>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 px-6 bg-neutral-950">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureCard 
              icon={<Zap className="h-6 w-6 text-yellow-400" />}
              title="Instant Ingestion"
              description="Upload large PDFs and have them chunked and indexed in seconds."
            />
            <FeatureCard 
              icon={<Shield className="h-6 w-6 text-green-400" />}
              title="Grounded Truth"
              description="Answers are derived strictly from your documents, minimizing hallucinations."
            />
            <FeatureCard 
              icon={<BookOpen className="h-6 w-6 text-blue-400" />}
              title="Smart Chunking"
              description="Uses Recursive Character Splitting for optimal context preservation."
            />
            <FeatureCard 
              icon={<MessageSquare className="h-6 w-6 text-purple-400" />}
              title="Natural Chat"
              description="Powered by Gemini 1.5 Flash for human-like, rapid conversations."
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-neutral-900 py-12 px-6 bg-neutral-950">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-indigo-500" />
            <span className="font-bold text-lg">NotebookTruth</span>
          </div>
          <p className="text-neutral-500 text-sm">© 2026 NotebookTruth. Built for WhySeriousKaif.</p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="p-8 rounded-2xl bg-neutral-900/50 border border-neutral-800 hover:border-indigo-500/50 transition-all group">
      <div className="mb-4 p-3 bg-neutral-800 rounded-xl w-fit group-hover:bg-indigo-500/10 transition-colors">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-neutral-400 leading-relaxed text-sm">{description}</p>
    </div>
  );
}
