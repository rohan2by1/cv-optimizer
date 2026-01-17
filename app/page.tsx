"use client";

import { useState, useEffect } from "react";

// Types for our History System
interface HistoryItem {
  id: string;
  timestamp: string;
  label: string;
  result: string;
}

export default function Home() {
  // Core State
  const [cvText, setCvText] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  
  // UI & History State
  const [statusMsg, setStatusMsg] = useState("");
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [view, setView] = useState<"current" | "history">("current");

  // 1. LOAD DATA ON MOUNT
  useEffect(() => {
    try {
      const savedDraft = localStorage.getItem("johny_cv_draft");
      const savedJd = localStorage.getItem("johny_jd");
      const savedResult = localStorage.getItem("johny_result");
      const masterCv = localStorage.getItem("johny_master_cv");
      const savedHistory = localStorage.getItem("johny_history_list");

      if (savedDraft) setCvText(savedDraft);
      else if (masterCv) setCvText(masterCv);

      if (savedJd) setJobDescription(savedJd);
      if (savedResult) setResult(savedResult);
      if (savedHistory) setHistory(JSON.parse(savedHistory));
    } catch (e) {
      console.error("Storage load error", e);
    }
    setIsLoaded(true);
  }, []);

  // 2. AUTO-SAVE INPUTS
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem("johny_cv_draft", cvText);
        localStorage.setItem("johny_jd", jobDescription);
      } catch (e) { console.warn("Storage full"); }
    }
  }, [cvText, jobDescription, isLoaded]);

  // 3. MASTER CV ACTIONS
  const saveAsMaster = () => {
    try {
      localStorage.setItem("johny_master_cv", cvText);
      showStatus("✅ Saved as Master CV");
    } catch (e) { alert("Storage Full!"); }
  };

  const resetToMaster = () => {
    const master = localStorage.getItem("johny_master_cv");
    if (master) {
      if (confirm("Discard changes and reload Master CV?")) {
        setCvText(master);
        showStatus("🔄 Reset to Master");
      }
    } else { alert("No Master CV saved yet."); }
  };

  // 4. HISTORY ACTIONS
  const addToHistory = (newResult: string) => {
    // Try to extract "CV Review for X at Y" to use as a label
    const titleMatch = newResult.match(/CV Review for (.*)/i);
    const label = titleMatch ? titleMatch[1] : `Optimization`;

    // Generate readable Time + Date (e.g. "Jan 17, 10:05 PM")
    const timeString = new Date().toLocaleString('en-US', {
      month: 'short', 
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });

    const newItem: HistoryItem = {
      id: Date.now().toString(),
      timestamp: timeString, // <--- Updated here
      label: label.substring(0, 40) + (label.length > 40 ? "..." : ""),
      result: newResult,
    };

    // Keep only last 10 items
    const updatedHistory = [newItem, ...history].slice(0, 10);
    
    setHistory(updatedHistory);
    try {
      localStorage.setItem("johny_history_list", JSON.stringify(updatedHistory));
    } catch (e) { console.warn("History full"); }
  };

  const loadHistoryItem = (item: HistoryItem) => {
    setResult(item.result);
    setView("current");
    showStatus(`Loaded: ${item.label}`);
  };

  const deleteHistoryItem = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const updated = history.filter(h => h.id !== id);
    setHistory(updated);
    localStorage.setItem("johny_history_list", JSON.stringify(updated));
  };

  // 5. API SUBMISSION
  const handleSubmit = async () => {
    if (!cvText || !jobDescription) { alert("Inputs missing"); return; }
    
    setLoading(true);
    setView("current"); 
    setResult(""); 

    try {
      const response = await fetch("/api/optimize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cvText, jobDescription }),
      });

      const data = await response.json();
      
      if (data.error) {
        alert("Error: " + data.error);
      } else {
        setResult(data.result);
        localStorage.setItem("johny_result", data.result);
        addToHistory(data.result); 
      }
    } catch (error) {
      alert("Network Error");
    } finally {
      setLoading(false);
    }
  };

  const showStatus = (msg: string) => {
    setStatusMsg(msg);
    setTimeout(() => setStatusMsg(""), 3000);
  };

  if (!isLoaded) return null;

  return (
    <main className="min-h-screen bg-gray-50 p-4 md:p-8 font-sans">
      <div className="max-w-[1400px] mx-auto space-y-6">
        
        {/* Top Header */}
        <div className="flex flex-col md:flex-row justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-200">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              🤖 Johny's CV Optimizer
            </h1>
          </div>
          <div className="flex gap-2 mt-2 md:mt-0">
             <button onClick={saveAsMaster} className="text-xs font-semibold text-blue-700 bg-blue-50 px-4 py-2 rounded hover:bg-blue-100 transition border border-blue-200">
                💾 Save Default
             </button>
             <button onClick={resetToMaster} className="text-xs font-semibold text-gray-700 bg-gray-50 px-4 py-2 rounded hover:bg-gray-100 transition border border-gray-200">
                🔄 Reset Default
             </button>
          </div>
        </div>

        {statusMsg && (
          <div className="bg-emerald-100 text-emerald-800 px-4 py-2 rounded-lg text-center text-sm font-semibold animate-pulse shadow-sm">
            {statusMsg}
          </div>
        )}

        {/* Main Grid */}
        <div className="grid lg:grid-cols-12 gap-6 h-[80vh]">
          
          {/* LEFT: Inputs (5 cols) */}
          <div className="lg:col-span-5 flex flex-col gap-4 h-full">
            <div className="flex-1 flex flex-col">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">LaTeX Source</label>
                <textarea
                  className="flex-1 p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 font-mono text-xs resize-none shadow-sm"
                  value={cvText}
                  onChange={(e) => setCvText(e.target.value)}
                  placeholder="\documentclass{article}..."
                />
            </div>
            <div className="flex-1 flex flex-col">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">Target Job Description</label>
                <textarea
                  className="flex-1 p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 text-sm resize-none shadow-sm"
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="Paste Job Description here..."
                />
            </div>
            <button
                onClick={handleSubmit}
                disabled={loading}
                className={`w-full py-4 rounded-xl text-white font-bold text-lg shadow-lg transition-all transform active:scale-95 ${
                loading 
                    ? "bg-gray-400 cursor-not-allowed" 
                    : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                }`}
            >
                {loading ? "Johny is Thinking..." : "✨ Optimize CV"}
            </button>
          </div>

          {/* RIGHT: Output & History (7 cols) */}
          <div className="lg:col-span-7 flex flex-col h-full bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
            
            {/* Right Header Tabs */}
            <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex justify-between items-center">
                <div className="flex gap-1 bg-gray-200 p-1 rounded-lg">
                    <button 
                        onClick={() => setView("current")}
                        className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${view === "current" ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
                    >
                        Current Result
                    </button>
                    <button 
                        onClick={() => setView("history")}
                        className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${view === "history" ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
                    >
                        History ({history.length})
                    </button>
                </div>

                {view === "current" && result && (
                    <button
                        onClick={() => {navigator.clipboard.writeText(result); showStatus("Copied Code!");}}
                        className="text-xs bg-white border border-gray-300 px-3 py-1.5 rounded hover:bg-gray-50 text-gray-700 font-medium"
                    >
                        Copy LaTeX
                    </button>
                )}
            </div>

            {/* Right Content Area */}
            <div className="flex-1 overflow-hidden relative bg-[#1e1e1e]">
                
                {/* VIEW 1: CURRENT RESULT */}
                {view === "current" && (
                    <div className="h-full overflow-auto custom-scrollbar">
                         {result ? (
                            <pre className="p-6 text-green-400 font-mono text-xs whitespace-pre-wrap leading-relaxed">
                                {result}
                            </pre>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-gray-500 space-y-4">
                                {loading ? (
                                    <>
                                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                                        <p className="text-gray-400 animate-pulse">Analyzing Keywords...</p>
                                    </>
                                ) : (
                                    <div className="text-center p-10 opacity-40">
                                        <div className="text-6xl mb-4">📄</div>
                                        <p className="text-gray-400">Ready to optimize.</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* VIEW 2: HISTORY LIST */}
                {view === "history" && (
                    <div className="h-full overflow-auto bg-gray-50 p-4 space-y-3">
                        {history.length === 0 ? (
                            <div className="text-center text-gray-400 mt-20">No history yet.</div>
                        ) : (
                            history.map((item) => (
                                <div 
                                    key={item.id}
                                    onClick={() => loadHistoryItem(item)}
                                    className="bg-white p-4 rounded-lg border border-gray-200 hover:border-blue-400 hover:shadow-md cursor-pointer transition-all group"
                                >
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="font-bold text-gray-800 text-sm">{item.label}</h3>
                                            <p className="text-xs text-gray-500 mt-1 font-mono bg-gray-100 inline-block px-2 py-0.5 rounded">
                                                {item.timestamp}
                                            </p>
                                        </div>
                                        <button 
                                            onClick={(e) => deleteHistoryItem(e, item.id)}
                                            className="text-gray-300 hover:text-red-500 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                            title="Delete"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}