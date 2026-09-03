/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useRef, useEffect } from "react";
import { Upload, CheckCircle, Search, Hash, Link as LinkIcon, AlertTriangle, ShieldCheck } from "lucide-react";
import gsap from "gsap";

type Stage = "idle" | "uploading" | "detecting" | "searching" | "matching" | "hashing" | "anchoring" | "complete" | "error";

export default function InvestigationPage() {
  const [stage, setStage] = useState<Stage>("idle");
  const [investigationId, setInvestigationId] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  
  const [results, setResults] = useState<any>({});
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pipelineRef = useRef<HTMLDivElement>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      setFile(selected);
      setPreview(URL.createObjectURL(selected));
    }
  };

  const startTrace = async () => {
    if (!file) return;
    setStage("uploading");
    
    try {
      // 1. Create investigation
      const initRes = await fetch(`${API_URL}/api/investigations`, { method: 'POST' });
      const { investigationId: id } = await initRes.json();
      setInvestigationId(id);
      
      // 2. Upload
      const formData = new FormData();
      formData.append("file", file);
      
      const uploadRes = await fetch(`${API_URL}/api/investigations/${id}/upload`, {
        method: 'POST',
        body: formData
      });
      const uploadData = await uploadRes.json();
      if (!uploadData.success) throw new Error("Upload failed");
      
      setResults((prev: any) => ({ ...prev, upload: uploadData }));
      
      // 3. Face
      setStage("detecting");
      const faceRes = await fetch(`${API_URL}/api/investigations/${id}/face`, { method: 'POST' });
      const faceData = await faceRes.json();
      setResults((prev: any) => ({ ...prev, face: faceData }));
      if (!faceData.faceDetected) throw new Error("No face detected in image");
      
      // 4. Search
      setStage("searching");
      const searchRes = await fetch(`${API_URL}/api/investigations/${id}/search`, { method: 'POST' });
      const searchData = await searchRes.json();
      setResults((prev: any) => ({ ...prev, search: searchData }));
      if (!searchData.candidates || searchData.candidates.length === 0) throw new Error("No matches found");
      
      // 5. Evidence
      setStage("matching");
      const evidenceRes = await fetch(`${API_URL}/api/investigations/${id}/evidence`, { method: 'POST' });
      const evidenceData = await evidenceRes.json();
      setResults((prev: any) => ({ ...prev, evidence: evidenceData }));
      
      // 6. Anchor
      setStage("anchoring");
      const anchorRes = await fetch(`${API_URL}/api/investigations/${id}/anchor`, { method: 'POST' });
      const anchorData = await anchorRes.json();
      setResults((prev: any) => ({ ...prev, anchor: anchorData }));
      
      setStage("complete");
      
    } catch (err: any) {
      console.error(err);
      setResults((prev: any) => ({ ...prev, error: err.message }));
      setStage("error");
    }
  };

  const getStageColor = (s: string) => {
    const states = ["idle", "uploading", "detecting", "searching", "matching", "hashing", "anchoring", "complete"];
    const currentIndex = states.indexOf(stage);
    const thisIndex = states.indexOf(s);
    
    if (stage === "error" && thisIndex >= currentIndex) return "bg-red-200";
    if (currentIndex > thisIndex || stage === "complete") return "bg-green-300";
    if (currentIndex === thisIndex) return "bg-yellow-300 animate-pulse";
    return "bg-slate-200";
  };

  return (
    <div className="min-h-screen p-8 flex flex-col gap-8 max-w-6xl mx-auto">
      <header className="flex justify-between items-center border-b-4 border-black pb-4">
        <h1 className="text-3xl font-black tracking-tighter uppercase">TRUST//TRACE</h1>
        <div className="font-mono font-bold bg-black text-white px-4 py-1 rounded-full text-sm">
          {investigationId ? `INV-${investigationId.slice(0,8).toUpperCase()}` : "READY"}
        </div>
      </header>
      
      <main className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Upload */}
        <div className="flex flex-col gap-4">
          <div className="neo-box p-6 bg-blue-50 flex flex-col items-center justify-center min-h-[300px] cursor-pointer"
               onClick={() => fileInputRef.current?.click()}>
            <input type="file" className="hidden" ref={fileInputRef} onChange={handleFileChange} accept="image/jpeg, image/png"/>
            
            {preview ? (
              <img src={preview} alt="Evidence" className="max-w-full h-auto rounded-lg border-2 border-black mb-4" />
            ) : (
              <div className="flex flex-col items-center gap-4 text-center">
                <Upload size={48} className="text-blue-500" />
                <h3 className="font-black text-xl uppercase">Drop Evidence Here</h3>
                <p className="font-medium text-sm text-slate-500">JPG or PNG only.</p>
              </div>
            )}
          </div>
          
          {preview && stage === "idle" && (
            <button onClick={startTrace} className="neo-box w-full py-4 bg-pink-500 text-white font-black text-xl uppercase tracking-widest">
              Start Trace &rarr;
            </button>
          )}
        </div>
        
        {/* Center/Right Column: Pipeline & Results */}
        <div className="lg:col-span-2 flex flex-col gap-8">
          
          {/* Pipeline Visualizer */}
          <div className="neo-box-no-hover p-6 bg-white" ref={pipelineRef}>
            <h2 className="font-black uppercase text-lg mb-6 flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-green-500 inline-block animate-pulse"></span>
              Live Pipeline Visualizer
            </h2>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className={`border-2 border-black rounded-xl p-4 flex flex-col gap-2 ${getStageColor("uploading")}`}>
                <Upload size={24} />
                <div className="font-bold text-sm uppercase">1. Ingest</div>
              </div>
              <div className={`border-2 border-black rounded-xl p-4 flex flex-col gap-2 ${getStageColor("detecting")}`}>
                <Search size={24} />
                <div className="font-bold text-sm uppercase">2. Vectorize</div>
              </div>
              <div className={`border-2 border-black rounded-xl p-4 flex flex-col gap-2 ${getStageColor("searching")}`}>
                <Search size={24} />
                <div className="font-bold text-sm uppercase">3. Reverse Crawl</div>
              </div>
              <div className={`border-2 border-black rounded-xl p-4 flex flex-col gap-2 ${getStageColor("anchoring")}`}>
                <LinkIcon size={24} />
                <div className="font-bold text-sm uppercase">4. Anchor</div>
              </div>
            </div>
          </div>
          
          {/* Results Area */}
          {stage === "error" && (
            <div className="neo-box p-6 bg-red-400 text-white flex flex-col gap-4">
               <div className="flex items-center gap-2">
                 <AlertTriangle size={32} />
                 <h2 className="font-black text-2xl uppercase">Integrity Failed</h2>
               </div>
               <p className="font-mono font-bold bg-black/20 p-4 rounded-xl">{results.error}</p>
            </div>
          )}
          
          {stage === "complete" && results.anchor && (
            <div className="flex flex-col gap-6">
              <div className="neo-box p-6 bg-green-400 text-black flex flex-col gap-4">
                 <div className="flex items-center gap-2">
                   <CheckCircle size={32} />
                   <h2 className="font-black text-2xl uppercase">Verified Anchored</h2>
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white/80 p-4 border-2 border-black rounded-xl font-mono text-sm break-all">
                      <span className="font-bold text-green-700">TX HASH:</span><br/>
                      {results.anchor.transactionHash}
                    </div>
                    <div className="bg-white/80 p-4 border-2 border-black rounded-xl font-mono text-sm break-all">
                      <span className="font-bold text-green-700">EVIDENCE SHA-256:</span><br/>
                      {results.evidenceHash}
                    </div>
                 </div>
              </div>
              
              {/* Matched Evidence Card */}
              {results.evidence && results.evidence.evidence && (
                <div className="neo-box p-6 bg-slate-100 flex flex-col gap-4">
                  <h3 className="font-black text-xl uppercase bg-yellow-300 inline-block self-start px-2 py-1 border-2 border-black rotate-1">Match Found</h3>
                  <div className="flex gap-4">
                    <img src={results.evidence.evidence.imageUrl} alt="Match" className="w-32 h-32 object-cover border-2 border-black rounded-xl" />
                    <div className="flex flex-col gap-2">
                      <div className="font-bold text-lg">{results.evidence.evidence.title}</div>
                      <div className="font-mono text-sm text-slate-600 bg-slate-200 p-2 rounded-lg inline-block">
                        Source: {results.evidence.evidence.sourceType} ({results.evidence.evidence.domain})
                      </div>
                      <a href={results.evidence.evidence.candidateUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline font-bold text-sm">
                        View Source &rarr;
                      </a>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
          
        </div>
      </main>
    </div>
  );
}
