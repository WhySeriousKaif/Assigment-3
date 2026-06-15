"use client";

import Link from "next/link";
import Image from "next/image";

export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-neutral-950/80 backdrop-blur-md border-b border-neutral-800">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="relative w-8 h-8 rounded-lg overflow-hidden group-hover:scale-110 transition-transform">
            <Image src="/logo.png" alt="NotebookTruth Logo" fill className="object-cover" />
          </div>
          <span className="font-bold text-xl tracking-tight text-neutral-50">Notebook<span className="text-indigo-400">Truth</span></span>
        </Link>
        
        <div className="flex items-center gap-6">
          <Link href="/" className="text-sm font-medium text-neutral-400 hover:text-neutral-50 transition-colors">Home</Link>
          <Link 
            href="/chat" 
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-full text-sm font-semibold transition-all shadow-lg shadow-indigo-500/20"
          >
            Launch App
          </Link>
        </div>
      </div>
    </nav>
  );
}
