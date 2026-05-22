import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { MessageSquare, User, ArrowLeft, Trophy, ChevronRight, Calendar, Building2 } from "lucide-react";

const ScoreBadge = ({ score }) => {
  const color = score >= 7 ? "#22d3ee" : score >= 4 ? "#1A6EFA" : "#f87171";
  return (
    <span
      className="text-xs font-mono font-bold px-2 py-0.5 rounded-full flex-shrink-0"
      style={{ background: `${color}18`, color, border: `1px solid ${color}30` }}
    >
      {score}/10
    </span>
  );
};

function Feedback() {
  const location = useLocation();
  const navigate = useNavigate();
  const interview = location.state?.interview;
  const [selectedIndex, setSelectedIndex] = useState(0);

  if (!interview || !interview.feedbacks) {
    return (
      <div
        className="flex flex-col items-center justify-center h-screen font-mainFont gap-4"
        style={{ background: "hsl(var(--background))" }}
      >
        <p className="text-slate-400 text-sm">No interview data found</p>
        <Button
          onClick={() => navigate(-1)}
          variant="outline"
          className="border-white/10 text-slate-300 text-sm"
        >
          Go Back
        </Button>
      </div>
    );
  }

  const { company, role, feedbacks, totalScore, createdAt } = interview;
  const scoreColor = (totalScore || 0) >= 70 ? "#22d3ee" : (totalScore || 0) >= 40 ? "#1A6EFA" : "#f87171";

  const formatDate = (d) => {
    if (!d) return "";
    try {
      return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    } catch { return ""; }
  };

  return (
    <div
      className="flex h-screen overflow-hidden w-full font-mainFont"
      style={{ background: "hsl(var(--background))" }}
    >
      {/* Sidebar */}
      <div
        className="w-64 flex-shrink-0 flex flex-col overflow-hidden"
        style={{
          background: "rgba(5, 7, 18, 0.95)",
          borderRight: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        {/* Header */}
        <div className="p-5 border-b" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
          <button
            onClick={() => navigate("/admin")}
            className="flex items-center gap-2 text-slate-400 hover:text-white text-xs transition-colors mb-4"
          >
            <ArrowLeft size={12} />
            Back to History
          </button>
          <p
            className="text-sm font-bold font-display truncate"
            style={{
              background: "linear-gradient(135deg, #60a5fa, #22d3ee)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            {role || "Interview"}
          </p>
          <div className="flex items-center gap-1.5 mt-1">
            <Building2 size={11} className="text-slate-600" />
            <p className="text-xs text-slate-500 truncate">{company}</p>
          </div>
          {createdAt && (
            <div className="flex items-center gap-1.5 mt-0.5">
              <Calendar size={11} className="text-slate-600" />
              <p className="text-xs text-slate-600">{formatDate(createdAt)}</p>
            </div>
          )}
        </div>

        {/* Total score */}
        <div className="px-4 py-3 border-b" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Trophy size={11} className="text-slate-500" />
              <span className="text-xs text-slate-500 uppercase tracking-wide">Total Score</span>
            </div>
            <span className="text-lg font-bold font-mono" style={{ color: scoreColor }}>
              {totalScore || 0}
            </span>
          </div>
          <div className="mt-2 h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
            <div
              className="h-full rounded-full"
              style={{
                width: `${Math.min(100, totalScore || 0)}%`,
                background: `linear-gradient(90deg, ${scoreColor}80, ${scoreColor})`,
              }}
            />
          </div>
        </div>

        {/* Question list */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          {feedbacks.map((fb, i) => {
            const isActive = selectedIndex === i;
            return (
              <button
                key={fb._id || i}
                onClick={() => setSelectedIndex(i)}
                className="w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-lg text-sm text-left transition-all duration-150"
                style={{
                  background: isActive ? "rgba(26,110,250,0.12)" : "transparent",
                  border: isActive ? "1px solid rgba(26,110,250,0.25)" : "1px solid transparent",
                  color: isActive ? "#93c5fd" : "#94a3b8",
                }}
              >
                <div className="flex items-center gap-2 min-w-0">
                  {isActive && (
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400 flex-shrink-0" />
                  )}
                  <span className="truncate">Question {i + 1}</span>
                </div>
                <ScoreBadge score={fb.score || 0} />
              </button>
            );
          })}
        </div>

        {/* Close button */}
        <div className="p-4 border-t" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
          <Button
            onClick={() => navigate("/admin")}
            variant="outline"
            className="w-full h-9 text-sm border-white/10 text-slate-300 hover:text-white hover:bg-white/[0.06]"
          >
            Close
          </Button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-y-auto p-6">
        {selectedIndex !== null && feedbacks[selectedIndex] ? (
          <div className="max-w-4xl mx-auto space-y-5">
            {/* Question header */}
            <div
              className="rounded-2xl p-5"
              style={{
                background: "rgba(13, 20, 37, 0.7)",
                border: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <span className="text-xs text-blue-400 font-mono uppercase tracking-widest">
                    Question {selectedIndex + 1} of {feedbacks.length}
                  </span>
                  <p className="mt-2 text-white text-sm leading-relaxed">
                    {feedbacks[selectedIndex].question}
                  </p>
                </div>
                <div
                  className="flex-shrink-0 w-14 h-14 rounded-xl flex items-center justify-center text-base font-bold font-mono"
                  style={{
                    background: `${
                      (feedbacks[selectedIndex].score || 0) >= 7
                        ? "#22d3ee"
                        : (feedbacks[selectedIndex].score || 0) >= 4
                        ? "#1A6EFA"
                        : "#f87171"
                    }15`,
                    color:
                      (feedbacks[selectedIndex].score || 0) >= 7
                        ? "#22d3ee"
                        : (feedbacks[selectedIndex].score || 0) >= 4
                        ? "#1A6EFA"
                        : "#f87171",
                    border: `1px solid ${
                      (feedbacks[selectedIndex].score || 0) >= 7
                        ? "#22d3ee"
                        : (feedbacks[selectedIndex].score || 0) >= 4
                        ? "#1A6EFA"
                        : "#f87171"
                    }30`,
                  }}
                >
                  {feedbacks[selectedIndex].score ?? 0}
                </div>
              </div>
            </div>

            {/* Answer + Feedback panels */}
            <div className="grid md:grid-cols-2 gap-4">
              <div
                className="rounded-2xl p-5 flex flex-col"
                style={{
                  background: "rgba(13, 20, 37, 0.7)",
                  border: "1px solid rgba(255,255,255,0.06)",
                  minHeight: "280px",
                }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <User size={13} className="text-slate-400" />
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Your Answer</span>
                </div>
                <p className="text-sm text-slate-300 leading-relaxed flex-1">
                  {feedbacks[selectedIndex].answer || (
                    <span className="text-slate-600 italic">No answer recorded</span>
                  )}
                </p>
              </div>

              <div
                className="rounded-2xl p-5 flex flex-col"
                style={{
                  background: "rgba(13, 20, 37, 0.7)",
                  border: "1px solid rgba(26,110,250,0.15)",
                  minHeight: "280px",
                }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <MessageSquare size={13} className="text-blue-400" />
                  <span className="text-xs font-semibold text-blue-400 uppercase tracking-wide">AI Feedback</span>
                </div>
                <p className="text-sm text-slate-300 leading-relaxed flex-1">
                  {feedbacks[selectedIndex].feedback || (
                    <span className="text-slate-600 italic">No feedback available</span>
                  )}
                </p>
              </div>
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between pt-2">
              <button
                onClick={() => setSelectedIndex((p) => Math.max(0, p - 1))}
                disabled={selectedIndex === 0}
                className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight size={14} className="rotate-180" /> Previous
              </button>
              <span className="text-xs text-slate-600 font-mono">
                {selectedIndex + 1} / {feedbacks.length}
              </span>
              <button
                onClick={() => setSelectedIndex((p) => Math.min(feedbacks.length - 1, p + 1))}
                disabled={selectedIndex === feedbacks.length - 1}
                className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                Next <ChevronRight size={14} />
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-sm text-slate-500">
            Select a question from the sidebar
          </div>
        )}
      </div>
    </div>
  );
}

export default Feedback;
