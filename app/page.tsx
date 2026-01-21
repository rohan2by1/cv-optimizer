"use client";

import { useState, useEffect } from "react";

interface HistoryItem {
  id: string;
  timestamp: string;
  label: string;
  result: string;
}

export default function Home() {
  const [cvText, setCvText] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [view, setView] = useState<"current" | "history">("current");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
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

  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem("johny_cv_draft", cvText);
        localStorage.setItem("johny_jd", jobDescription);
      } catch (e) {
        console.warn("Storage full");
      }
    }
  }, [cvText, jobDescription, isLoaded]);

  const saveAsMaster = () => {
    try {
      localStorage.setItem("johny_master_cv", cvText);
      showStatus("✓ Saved as your default CV!");
    } catch (e) {
      alert("Storage Full!");
    }
  };

  const resetToMaster = () => {
    const master = localStorage.getItem("johny_master_cv");
    if (master) {
      if (confirm("Discard changes and reload your default CV?")) {
        setCvText(master);
        showStatus("↺ Reset to default!");
      }
    } else {
      alert("No default CV saved yet!");
    }
  };

  const addToHistory = (newResult: string) => {
    const titleMatch = newResult.match(/CV Review for (.*)/i);
    const label = titleMatch ? titleMatch[1] : `Optimization`;
    const timeString = new Date().toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });

    const newItem: HistoryItem = {
      id: Date.now().toString(),
      timestamp: timeString,
      label: label.substring(0, 40) + (label.length > 40 ? "..." : ""),
      result: newResult,
    };

    const updatedHistory = [newItem, ...history].slice(0, 10);
    setHistory(updatedHistory);
    try {
      localStorage.setItem("johny_history_list", JSON.stringify(updatedHistory));
    } catch (e) {
      console.warn("History full");
    }
  };

  const loadHistoryItem = (item: HistoryItem) => {
    setResult(item.result);
    setView("current");
    showStatus(`Loaded: ${item.label}`);
  };

  const deleteHistoryItem = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const updated = history.filter((h) => h.id !== id);
    setHistory(updated);
    localStorage.setItem("johny_history_list", JSON.stringify(updated));
  };

  const handleSubmit = async () => {
    if (!cvText || !jobDescription) {
      alert("Please fill in both fields!");
      return;
    }

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
    <main className="h-screen w-screen overflow-hidden fixed inset-0">
      {/* Dark Dotted Background */}
      <div className="absolute inset-0 bg-[#313131]">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(rgba(255, 255, 255, 0.171) 2px, transparent 0)`,
            backgroundSize: "30px 30px",
            backgroundPosition: "-5px -5px",
          }}
        />
        {/* Subtle glow effects */}
        <div className="absolute top-20 left-20 w-64 h-64 bg-amber-500/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-cyan-500/5 rounded-full blur-[100px]" />
      </div>

      {/* Main Container */}
      <div className="relative z-10 h-full flex flex-col p-3 md:p-4 lg:p-5 max-w-[1600px] mx-auto">
        
        {/* Header */}
        <header
          className={`sketch-card flex-shrink-0 p-3 md:p-4 mb-4 ${mounted ? "animate-sketch-in" : "opacity-0"}`}
        >
          <div className="flex flex-col md:flex-row justify-between items-center gap-3">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-12 h-12 md:w-14 md:h-14 sketch-circle bg-amber-500/20 flex items-center justify-center">
                  <span className="text-2xl md:text-3xl" style={{ transform: "rotate(-5deg)" }}>📝</span>
                </div>
                <div className="absolute -top-1 -right-1 w-5 h-5 sketch-circle-small bg-rose-500 flex items-center justify-center">
                  <span className="text-[9px] font-bold text-white">AI</span>
                </div>
              </div>
              <div>
                <h1 className="text-xl md:text-2xl font-bold text-white sketch-underline inline-block">
                  CV Optimizer
                </h1>
                <p className="text-xs text-white/50 mt-0.5 ml-1">
                  ✨ making your resume sparkle!
                </p>
              </div>
            </div>

            {/* Stats + Buttons */}
            <div className="flex items-center gap-3 flex-wrap justify-center">
              <div className="flex gap-2">
                <div className="sketch-stat-mini">
                  <span className="text-base font-semibold text-cyan-400">{cvText.length}</span>
                  <span className="text-[10px] text-white/40">cv</span>
                </div>
                <div className="sketch-stat-mini">
                  <span className="text-base font-semibold text-emerald-400">{jobDescription.length}</span>
                  <span className="text-[10px] text-white/40">jd</span>
                </div>
                <div className="sketch-stat-mini">
                  <span className="text-base font-semibold text-amber-400">{history.length}</span>
                  <span className="text-[10px] text-white/40">saves</span>
                </div>
              </div>
              
              <div className="flex gap-2">
                <button onClick={saveAsMaster} className="sketch-button-secondary-sm">
                  <span className="flex items-center gap-1">
                    <span>💾</span>
                    <span className="text-sm hidden sm:inline">Save</span>
                  </span>
                </button>
                <button onClick={resetToMaster} className="sketch-button-ghost-sm">
                  <span className="flex items-center gap-1">
                    <span>↺</span>
                    <span className="text-sm hidden sm:inline">Reset</span>
                  </span>
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Status Toast */}
        {statusMsg && (
          <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 animate-bounce-in">
            <div className="sketch-toast">
              <span className="text-sm text-white">{statusMsg}</span>
            </div>
          </div>
        )}

        {/* Main Grid */}
        <div className="flex-1 grid lg:grid-cols-12 gap-4 min-h-0">
          
          {/* Left Panel */}
          <div className="lg:col-span-5 flex flex-col gap-3 min-h-0">
            
            {/* CV Input */}
            <div
              className={`sketch-card flex-1 flex flex-col min-h-0 ${mounted ? "animate-sketch-in" : "opacity-0"}`}
              style={{ animationDelay: "100ms" }}
            >
              <div className="flex items-center gap-2 mb-2 flex-shrink-0">
                <div className="sketch-icon-box-sm bg-cyan-500/20">
                  <span>📄</span>
                </div>
                <h2 className="text-sm font-semibold text-white">LaTeX CV</h2>
                <div className="ml-auto sketch-badge-sm bg-cyan-500/20">
                  <span className="text-[10px] text-cyan-400">editable</span>
                </div>
              </div>
              <div className="relative flex-1 min-h-0">
                <textarea
                  className="sketch-textarea sketch-scrollbar w-full h-full"
                  value={cvText}
                  onChange={(e) => setCvText(e.target.value)}
                  placeholder="Paste your LaTeX CV here..."
                />
              </div>
            </div>

            {/* Job Description */}
            <div
              className={`sketch-card flex-1 flex flex-col min-h-0 ${mounted ? "animate-sketch-in" : "opacity-0"}`}
              style={{ animationDelay: "200ms" }}
            >
              <div className="flex items-center gap-2 mb-2 flex-shrink-0">
                <div className="sketch-icon-box-sm bg-amber-500/20">
                  <span>💼</span>
                </div>
                <h2 className="text-sm font-semibold text-white">Job Description</h2>
                <div className="ml-auto sketch-badge-sm bg-amber-500/20">
                  <span className="text-[10px] text-amber-400">target</span>
                </div>
              </div>
              <div className="relative flex-1 min-h-0">
                <textarea
                  className="sketch-textarea sketch-scrollbar w-full h-full"
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="Paste the job posting here..."
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              disabled={loading}
              className={`sketch-button-primary flex-shrink-0 ${mounted ? "animate-sketch-in" : "opacity-0"} ${loading ? "opacity-70" : ""}`}
              style={{ animationDelay: "300ms" }}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="sketch-spinner">⚙️</span>
                  <span className="text-sm font-semibold">Working...</span>
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <span className="text-lg">✨</span>
                  <span className="text-sm font-semibold">Optimize my CV!</span>
                  <span className="text-lg">🚀</span>
                </span>
              )}
            </button>
          </div>

          {/* Right Panel */}
          <div
            className={`lg:col-span-7 sketch-card-large flex flex-col min-h-0 ${mounted ? "animate-sketch-in" : "opacity-0"}`}
            style={{ animationDelay: "150ms" }}
          >
            {/* Tabs - Pill/Round Style */}
            <div className="flex items-center justify-between mb-3 flex-shrink-0">
              <div className="flex gap-2">
                <button
                  onClick={() => setView("current")}
                  className={`sketch-tab ${view === "current" ? "sketch-tab-active" : ""}`}
                >
                  <span className="flex items-center gap-1.5">
                    <span>📋</span>
                    <span className="text-xs">Result</span>
                  </span>
                </button>
                <button
                  onClick={() => setView("history")}
                  className={`sketch-tab ${view === "history" ? "sketch-tab-active" : ""}`}
                >
                  <span className="flex items-center gap-1.5">
                    <span>📚</span>
                    <span className="text-xs">History</span>
                    {history.length > 0 && (
                      <span className="sketch-badge-count-sm">{history.length}</span>
                    )}
                  </span>
                </button>
              </div>

              {view === "current" && result && (
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(result);
                    showStatus("📋 Copied!");
                  }}
                  className="sketch-button-small"
                >
                  <span className="flex items-center gap-1.5">
                    <span>📎</span>
                    <span className="text-xs">Copy</span>
                  </span>
                </button>
              )}
            </div>

            {/* Content Area */}
            <div className="flex-1 sketch-content-area overflow-hidden min-h-0">
              {/* Current Result */}
              {view === "current" && (
                <div className="h-full overflow-auto sketch-scrollbar">
                  {result ? (
                    <div className="p-4">
                      <div className="sketch-result-box">
                        <div className="flex items-center gap-2 mb-2 pb-2 border-b-2 border-dashed border-emerald-500/30">
                          <span>✅</span>
                          <span className="text-sm font-semibold text-emerald-400">Optimized Output</span>
                        </div>
                        <pre className="text-xs text-white/80 leading-relaxed whitespace-pre-wrap">
                          {result}
                        </pre>
                      </div>
                    </div>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center p-4">
                      {loading ? (
                        <div className="text-center">
                          <div className="sketch-loading-animation mb-3">
                            <span className="text-4xl">🤖</span>
                          </div>
                          <p className="text-sm font-medium text-white/70 mb-1">Analyzing...</p>
                          <div className="flex items-center justify-center gap-1">
                            <span className="sketch-dot animate-bounce" style={{ animationDelay: "0ms" }}>•</span>
                            <span className="sketch-dot animate-bounce" style={{ animationDelay: "150ms" }}>•</span>
                            <span className="sketch-dot animate-bounce" style={{ animationDelay: "300ms" }}>•</span>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center">
                          <div className="sketch-empty-state-sm mb-3">
                            <span className="text-4xl">📝</span>
                          </div>
                          <p className="text-sm font-medium text-white/60 mb-1">Ready when you are!</p>
                          <p className="text-xs text-white/40">
                            Click "Optimize" to start ↙️
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* History */}
              {view === "history" && (
                <div className="h-full overflow-auto sketch-scrollbar p-3">
                  {history.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center">
                      <div className="sketch-empty-state-sm mb-3">
                        <span className="text-4xl">📚</span>
                      </div>
                      <p className="text-sm font-medium text-white/60 mb-1">No history yet!</p>
                      <p className="text-xs text-white/40">
                        Your optimizations appear here
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {history.map((item, index) => (
                        <div
                          key={item.id}
                          onClick={() => loadHistoryItem(item)}
                          className="sketch-history-card group"
                        >
                          <div className="flex items-center gap-3">
                            <div className="sketch-history-icon-sm">
                              <span>📄</span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="text-xs font-medium text-white truncate group-hover:text-cyan-400">
                                {item.label}
                              </h3>
                              <span className="text-[10px] text-white/40">
                                🕐 {item.timestamp}
                              </span>
                            </div>
                            <button
                              onClick={(e) => deleteHistoryItem(e, item.id)}
                              className="sketch-delete-btn opacity-0 group-hover:opacity-100"
                              title="Delete"
                            >
                              ✕
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Global Styles */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;500;600;700&display=swap');

        * {
          box-sizing: border-box;
        }

        html, body {
          margin: 0;
          padding: 0;
          overflow: hidden;
          height: 100%;
          width: 100%;
          background: #313131;
          font-family: 'JetBrains Mono', monospace;
        }

        /* ==================== CARDS ==================== */
        .sketch-card {
          background: rgba(45, 45, 45, 0.8);
          backdrop-filter: blur(10px);
          border: 2px solid rgba(255, 255, 255, 0.15);
          border-radius: 12px;
          padding: 14px;
          position: relative;
          box-shadow: 
            0 4px 20px rgba(0, 0, 0, 0.3),
            inset 0 1px 0 rgba(255, 255, 255, 0.05);
          transition: all 0.2s ease;
        }

        .sketch-card::before {
          content: '';
          position: absolute;
          top: -3px;
          left: -3px;
          right: -3px;
          bottom: -3px;
          border: 1.5px dashed rgba(255, 255, 255, 0.1);
          border-radius: 14px;
          pointer-events: none;
        }

        .sketch-card:hover {
          border-color: rgba(255, 255, 255, 0.25);
          box-shadow: 
            0 6px 30px rgba(0, 0, 0, 0.4),
            inset 0 1px 0 rgba(255, 255, 255, 0.08);
        }

        .sketch-card-large {
          background: rgba(45, 45, 45, 0.8);
          backdrop-filter: blur(10px);
          border: 2px solid rgba(255, 255, 255, 0.15);
          border-radius: 14px;
          padding: 14px;
          box-shadow: 
            0 4px 20px rgba(0, 0, 0, 0.3),
            inset 0 1px 0 rgba(255, 255, 255, 0.05);
        }

        /* ==================== CIRCLES ==================== */
        .sketch-circle {
          border: 2px solid rgba(255, 255, 255, 0.2);
          border-radius: 50%;
          backdrop-filter: blur(5px);
        }

        .sketch-circle-small {
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-radius: 50%;
        }

        /* ==================== UNDERLINE ==================== */
        .sketch-underline {
          position: relative;
        }

        .sketch-underline::after {
          content: '';
          position: absolute;
          bottom: -4px;
          left: 0;
          right: 0;
          height: 3px;
          background: linear-gradient(90deg, #f59e0b 0%, #fbbf24 100%);
          border-radius: 2px;
          opacity: 0.8;
        }

        /* ==================== BUTTONS ==================== */
        .sketch-button-primary {
          background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%);
          border: 2px solid rgba(255, 255, 255, 0.2);
          border-radius: 12px;
          padding: 14px 24px;
          color: white;
          cursor: pointer;
          font-family: 'JetBrains Mono', monospace;
          box-shadow: 
            0 4px 15px rgba(14, 165, 233, 0.4),
            inset 0 1px 0 rgba(255, 255, 255, 0.2);
          transition: all 0.2s ease;
        }

        .sketch-button-primary:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 
            0 6px 25px rgba(14, 165, 233, 0.5),
            inset 0 1px 0 rgba(255, 255, 255, 0.3);
        }

        .sketch-button-primary:active:not(:disabled) {
          transform: translateY(0);
        }

        .sketch-button-secondary-sm {
          background: rgba(255, 255, 255, 0.1);
          border: 2px solid rgba(255, 255, 255, 0.2);
          border-radius: 8px;
          padding: 6px 12px;
          color: white;
          cursor: pointer;
          font-family: 'JetBrains Mono', monospace;
          transition: all 0.2s ease;
        }

        .sketch-button-secondary-sm:hover {
          background: rgba(251, 191, 36, 0.2);
          border-color: rgba(251, 191, 36, 0.4);
        }

        .sketch-button-ghost-sm {
          background: transparent;
          border: 2px dashed rgba(255, 255, 255, 0.2);
          border-radius: 8px;
          padding: 6px 12px;
          color: rgba(255, 255, 255, 0.7);
          cursor: pointer;
          font-family: 'JetBrains Mono', monospace;
          transition: all 0.2s ease;
        }

        .sketch-button-ghost-sm:hover {
          background: rgba(255, 255, 255, 0.05);
          border-color: rgba(255, 255, 255, 0.3);
          border-style: solid;
          color: white;
        }

        .sketch-button-small {
          background: rgba(255, 255, 255, 0.1);
          border: 2px solid rgba(255, 255, 255, 0.15);
          border-radius: 50px;
          padding: 6px 14px;
          color: white;
          cursor: pointer;
          font-family: 'JetBrains Mono', monospace;
          transition: all 0.2s ease;
        }

        .sketch-button-small:hover {
          background: rgba(6, 182, 212, 0.2);
          border-color: rgba(6, 182, 212, 0.4);
        }

        /* ==================== TEXTAREA ==================== */
        .sketch-textarea {
          background: rgba(30, 30, 30, 0.8);
          border: 2px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          padding: 12px;
          font-family: 'JetBrains Mono', monospace;
          font-size: 12px;
          line-height: 1.6;
          color: white;
          resize: none;
          transition: all 0.2s ease;
        }

        .sketch-textarea::placeholder {
          color: rgba(255, 255, 255, 0.3);
          font-style: normal;
        }

        .sketch-textarea:focus {
          outline: none;
          border-color: rgba(6, 182, 212, 0.5);
          box-shadow: 
            0 0 0 3px rgba(6, 182, 212, 0.1),
            inset 0 0 20px rgba(6, 182, 212, 0.05);
        }

        /* ==================== TABS - PILL/ROUND STYLE ==================== */
        .sketch-tab {
          background: rgba(255, 255, 255, 0.05);
          border: 2px solid rgba(255, 255, 255, 0.1);
          border-radius: 50px;
          padding: 8px 18px;
          color: rgba(255, 255, 255, 0.6);
          cursor: pointer;
          font-family: 'JetBrains Mono', monospace;
          transition: all 0.25s ease;
        }

        .sketch-tab-active {
          background: linear-gradient(135deg, rgba(6, 182, 212, 0.2) 0%, rgba(14, 165, 233, 0.15) 100%);
          border-color: rgba(6, 182, 212, 0.5);
          color: white;
          box-shadow: 
            0 0 20px rgba(6, 182, 212, 0.15),
            inset 0 1px 0 rgba(255, 255, 255, 0.1);
        }

        .sketch-tab:hover:not(.sketch-tab-active) {
          background: rgba(255, 255, 255, 0.08);
          border-color: rgba(255, 255, 255, 0.2);
          color: white;
          transform: translateY(-1px);
        }

        .sketch-tab:active {
          transform: translateY(0);
        }

        /* ==================== CONTENT AREA ==================== */
        .sketch-content-area {
          background: rgba(30, 30, 30, 0.6);
          border: 2px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          position: relative;
        }

        .sketch-content-area::before {
          content: '';
          position: absolute;
          inset: 0;
          background-image: radial-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 0);
          background-size: 20px 20px;
          pointer-events: none;
          border-radius: inherit;
        }

        /* ==================== BADGES ==================== */
        .sketch-badge-sm {
          border: 1.5px solid currentColor;
          border-radius: 12px;
          padding: 2px 8px;
          opacity: 0.8;
        }

        .sketch-badge-count-sm {
          background: #f59e0b;
          color: #1a1a1a;
          border-radius: 50%;
          width: 18px;
          height: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'JetBrains Mono', monospace;
          font-size: 10px;
          font-weight: bold;
        }

        /* ==================== ICON BOX ==================== */
        .sketch-icon-box-sm {
          width: 28px;
          height: 28px;
          border: 2px solid rgba(255, 255, 255, 0.15);
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
        }

        /* ==================== STATS ==================== */
        .sketch-stat-mini {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 4px 10px;
          border: 1.5px dashed rgba(255, 255, 255, 0.15);
          border-radius: 6px;
          background: rgba(255, 255, 255, 0.03);
        }

        /* ==================== HISTORY CARD ==================== */
        .sketch-history-card {
          background: rgba(255, 255, 255, 0.03);
          border: 2px solid rgba(255, 255, 255, 0.08);
          border-radius: 10px;
          padding: 10px 12px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .sketch-history-card:hover {
          background: rgba(6, 182, 212, 0.1);
          border-color: rgba(6, 182, 212, 0.3);
        }

        .sketch-history-icon-sm {
          width: 32px;
          height: 32px;
          background: rgba(255, 255, 255, 0.05);
          border: 2px solid rgba(255, 255, 255, 0.1);
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
          flex-shrink: 0;
        }

        .sketch-delete-btn {
          width: 24px;
          height: 24px;
          border: none;
          border-radius: 4px;
          background: transparent;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          color: rgba(255, 255, 255, 0.3);
          font-family: 'JetBrains Mono', monospace;
          transition: all 0.2s ease;
          flex-shrink: 0;
        }

        .sketch-delete-btn:hover {
          background: rgba(239, 68, 68, 0.2);
          color: #ef4444;
        }

        /* ==================== RESULT BOX ==================== */
        .sketch-result-box {
          background: rgba(16, 185, 129, 0.05);
          border: 2px dashed rgba(16, 185, 129, 0.3);
          border-radius: 10px;
          padding: 14px;
        }

        .sketch-result-box pre {
          font-family: 'JetBrains Mono', monospace;
        }

        /* ==================== EMPTY STATES ==================== */
        .sketch-empty-state-sm {
          width: 80px;
          height: 80px;
          border: 2px dashed rgba(255, 255, 255, 0.15);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto;
          background: rgba(255, 255, 255, 0.02);
        }

        /* ==================== LOADING ==================== */
        .sketch-loading-animation {
          animation: wobble 0.8s ease-in-out infinite;
        }

        .sketch-dot {
          font-size: 20px;
          color: #0ea5e9;
          font-weight: bold;
        }

        .sketch-spinner {
          display: inline-block;
          animation: spin 0.8s linear infinite;
          font-size: 20px;
        }

        /* ==================== TOAST ==================== */
        .sketch-toast {
          background: rgba(45, 45, 45, 0.95);
          backdrop-filter: blur(10px);
          border: 2px solid rgba(16, 185, 129, 0.4);
          border-radius: 50px;
          padding: 10px 20px;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.4);
          font-family: 'JetBrains Mono', monospace;
        }

        /* ==================== CUSTOM SCROLLBAR ==================== */
        .sketch-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: rgba(6, 182, 212, 0.4) transparent;
        }

        .sketch-scrollbar::-webkit-scrollbar {
          width: 10px;
          height: 10px;
        }

        .sketch-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.03);
          border-radius: 10px;
          margin: 4px;
        }

        .sketch-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(180deg, 
            rgba(6, 182, 212, 0.4) 0%, 
            rgba(14, 165, 233, 0.3) 50%,
            rgba(6, 182, 212, 0.4) 100%
          );
          border-radius: 10px;
          border: 2px solid rgba(30, 30, 30, 0.8);
          box-shadow: inset 0 0 6px rgba(6, 182, 212, 0.2);
        }

        .sketch-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(180deg, 
            rgba(6, 182, 212, 0.6) 0%, 
            rgba(14, 165, 233, 0.5) 50%,
            rgba(6, 182, 212, 0.6) 100%
          );
          box-shadow: 
            inset 0 0 8px rgba(6, 182, 212, 0.3),
            0 0 10px rgba(6, 182, 212, 0.2);
        }

        .sketch-scrollbar::-webkit-scrollbar-thumb:active {
          background: linear-gradient(180deg, 
            rgba(6, 182, 212, 0.8) 0%, 
            rgba(14, 165, 233, 0.7) 50%,
            rgba(6, 182, 212, 0.8) 100%
          );
        }

        .sketch-scrollbar::-webkit-scrollbar-corner {
          background: transparent;
        }

        /* ==================== ANIMATIONS ==================== */
        @keyframes sketch-in {
          0% {
            opacity: 0;
            transform: translateY(20px) scale(0.95);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .animate-sketch-in {
          animation: sketch-in 0.5s ease-out forwards;
        }

        @keyframes bounce-in {
          0% {
            opacity: 0;
            transform: translateX(-50%) translateY(-20px) scale(0.9);
          }
          50% {
            transform: translateX(-50%) translateY(5px) scale(1.02);
          }
          100% {
            opacity: 1;
            transform: translateX(-50%) translateY(0) scale(1);
          }
        }

        .animate-bounce-in {
          animation: bounce-in 0.4s ease-out forwards;
        }

        @keyframes wobble {
          0%, 100% { transform: rotate(-5deg) scale(1); }
          50% { transform: rotate(5deg) scale(1.05); }
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        /* ==================== SELECTION ==================== */
        ::selection {
          background: rgba(6, 182, 212, 0.4);
          color: white;
        }
      `}</style>
    </main>
  );
}
