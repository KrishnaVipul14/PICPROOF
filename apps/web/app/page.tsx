"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import gsap from "gsap";

export default function Home() {
  const titleRef = useRef<HTMLHeadingElement>(null);
  
  useEffect(() => {
    let ctx = gsap.context(() => {
      gsap.from(titleRef.current, {
        y: 50,
        opacity: 0,
        duration: 0.8,
        ease: "back.out(1.7)"
      });
    });
    return () => ctx.revert();
  }, []);

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-8 text-center gap-12 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-20 left-20 w-32 h-32 bg-blue-400 rounded-full mix-blend-multiply filter blur-2xl opacity-30 animate-blob"></div>
      <div className="absolute top-40 right-20 w-32 h-32 bg-pink-400 rounded-full mix-blend-multiply filter blur-2xl opacity-30 animate-blob animation-delay-2000"></div>
      
      <div className="z-10 max-w-4xl mx-auto flex flex-col items-center gap-8">
        <div className="inline-block px-4 py-2 bg-yellow-300 border-2 border-black rounded-full text-sm font-bold tracking-widest shadow-neo-no-hover uppercase mb-4 rotate-[-2deg]">
          Hacker House Goa · Task 3
        </div>
        
        <h1 ref={titleRef} className="text-6xl md:text-8xl font-black tracking-tighter uppercase text-black leading-none">
          PIC<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-pink-500">PROOF</span>
        </h1>
        
        <p className="text-xl md:text-2xl font-medium max-w-2xl text-slate-800 bg-white/80 p-4 rounded-xl border-2 border-black shadow-neo">
          From Pixels to Proof. We anchor the truth of photographic evidence to an immutable cryptographic ledger.
        </p>
        
        <div className="flex gap-4 mt-8">
          <Link href="/investigation" className="neo-box px-8 py-4 bg-[#FF4D8B] text-white font-black text-xl uppercase tracking-widest flex items-center gap-2">
            Start Live Verification &rarr;
          </Link>
          <Link href="/judge" className="neo-box px-8 py-4 bg-white text-black font-black text-xl uppercase tracking-widest">
            Judge Mode
          </Link>
        </div>
      </div>
      
      <div className="mt-20 z-10 w-full max-w-5xl">
        <h2 className="text-3xl font-black mb-12 uppercase text-center bg-black text-white inline-block px-6 py-2 rounded-xl transform -rotate-1">How it works</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="neo-box-no-hover p-6 flex flex-col gap-4 text-left">
            <div className="w-12 h-12 bg-blue-300 border-2 border-black rounded-full flex items-center justify-center font-black text-xl">1</div>
            <h3 className="font-black text-xl">Ingest & Vectorize</h3>
            <p className="font-medium text-slate-700">We extract high-dimensional facial embeddings using AI without storing raw biometric data.</p>
          </div>
          
          <div className="neo-box-no-hover p-6 flex flex-col gap-4 text-left">
            <div className="w-12 h-12 bg-pink-300 border-2 border-black rounded-full flex items-center justify-center font-black text-xl">2</div>
            <h3 className="font-black text-xl">Reverse Crawl</h3>
            <p className="font-medium text-slate-700">We query public indexes and social registries to locate historical corroborating evidence.</p>
          </div>
          
          <div className="neo-box-no-hover p-6 flex flex-col gap-4 text-left">
            <div className="w-12 h-12 bg-green-300 border-2 border-black rounded-full flex items-center justify-center font-black text-xl">3</div>
            <h3 className="font-black text-xl">Cryptographic Anchor</h3>
            <p className="font-medium text-slate-700">The verified fingerprint is notarized on a public blockchain, creating an immutable proof of integrity.</p>
          </div>
        </div>
      </div>
    </main>
  );
}
