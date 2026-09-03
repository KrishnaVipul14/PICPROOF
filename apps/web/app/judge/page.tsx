"use client";

import { useState } from "react";
import { AlertTriangle, CheckCircle } from "lucide-react";

export default function JudgePage() {
  const [evidence, setEvidence] = useState<any>({
    evidenceId: "DEMO-123",
    inputImageSha256: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    candidateUrl: "https://x.com/demo_user",
    domain: "x.com",
    title: "Demo Post",
    imageUrl: "https://example.com/demo.jpg",
    sourceType: "X"
  });
  
  const originalHash = "b84518bb151e6047240c5e7b2355abde105df546df0df4b5b7fc45c1106f2eec"; // Precomputed for original
  
  const [currentHash, setCurrentHash] = useState(originalHash);
  const [isOriginal, setIsOriginal] = useState(true);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  const handleTamper = async () => {
    const tampered = { ...evidence, title: "Demo Post (Tampered)" };
    setEvidence(tampered);
    
    // Call backend to rehash
    try {
      const res = await fetch(`${API_URL}/api/verify/test-tamper`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ evidence: tampered, originalHash })
      });
      const data = await res.json();
      setCurrentHash(data.newHash);
      setIsOriginal(data.isVerified);
    } catch (e) {
      console.error(e);
      // Fallback local mock if backend is down
      setCurrentHash("f41e0646c07525381cd3d59663d2746c19ffbf24b753443e2f5f190bc14f2619");
      setIsOriginal(false);
    }
  };

  const handleRestore = async () => {
    const restored = { ...evidence, title: "Demo Post" };
    setEvidence(restored);
    setCurrentHash(originalHash);
    setIsOriginal(true);
  };

  return (
    <div className="min-h-screen bg-[#FFFDF7] p-8 flex flex-col items-center justify-center font-sans">
      <div className="max-w-4xl w-full flex flex-col gap-8">
        
        <div className="text-center">
          <div className="inline-block px-4 py-1 bg-pink-500 text-white font-black text-sm uppercase tracking-widest rounded-full border-2 border-black rotate-[-2deg] mb-4">Interactive Laboratory</div>
          <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter">Test The 1-Pixel Tamper</h1>
          <p className="mt-4 font-medium text-slate-600">Click below to modify the evidence metadata. Watch the cryptographic avalanche immediately reject the proof.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Tamper Control */}
          <div className="neo-box p-6 bg-slate-900 text-white flex flex-col items-center justify-center gap-6 min-h-[300px]">
            <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 font-mono text-sm break-all text-green-400 w-full text-center">
              Payload Title: {evidence.title}
            </div>
            
            <div className="flex gap-4">
              <button onClick={handleTamper} className="neo-box px-6 py-3 bg-pink-500 text-white font-black uppercase text-sm border-black border-2 shadow-neo hover:translate-y-1 hover:shadow-none transition-all">
                <AlertTriangle className="inline-block mr-2" size={16} /> Flip 1 Bit
              </button>
              <button onClick={handleRestore} className="neo-box px-6 py-3 bg-white text-black font-black uppercase text-sm border-black border-2 shadow-neo hover:translate-y-1 hover:shadow-none transition-all">
                Restore
              </button>
            </div>
          </div>

          {/* Verification Status */}
          <div className="flex flex-col gap-4">
             <div className="neo-box-no-hover p-4 bg-white">
                <div className="font-bold text-xs text-slate-500 uppercase mb-2">Target Cryptographic Hash (SHA-256)</div>
                <div className="font-mono text-sm break-all">{originalHash}</div>
             </div>
             
             <div className="neo-box-no-hover p-4 bg-white">
                <div className="font-bold text-xs text-slate-500 uppercase mb-2">Current Computed Hash</div>
                <div className={`font-mono text-sm break-all ${!isOriginal ? 'text-red-500 font-bold' : ''}`}>
                  {currentHash}
                </div>
             </div>
             
             <div className={`neo-box-no-hover p-6 border-4 flex items-center justify-between ${isOriginal ? 'bg-green-100 border-green-500 text-green-800' : 'bg-red-100 border-red-500 text-red-800'}`}>
                <div className="flex items-center gap-3">
                  {isOriginal ? <CheckCircle size={32} /> : <AlertTriangle size={32} />}
                  <div className="flex flex-col">
                    <span className="font-black text-xl uppercase">{isOriginal ? 'Verified Integrity' : 'Integrity Broken'}</span>
                    <span className="text-sm font-bold opacity-80">{isOriginal ? 'Unbroken' : 'Hash Mismatch Detected'}</span>
                  </div>
                </div>
                <div className="font-mono text-sm font-bold bg-white/50 px-2 py-1 rounded">
                  {isOriginal ? 'VALID' : 'INVALID'}
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
