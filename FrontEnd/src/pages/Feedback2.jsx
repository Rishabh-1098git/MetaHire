import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Loader2, ChevronRight, Trophy, MessageSquare, User, ArrowLeft } from "lucide-react";
import { clearCachedUser } from "@/lib/userCache";

const ScoreBadge = ({ score }) => {
  const color = score >= 7 ? "#22d3ee" : score >= 4 ? "#6366F1" : "#f87171";
  return (
    <span
      className="text-xs font-mono font-bold px-2 py-0.5 rounded-full flex-shrink-0"
      style={{ background: `${color}18`, color, border: `1px solid ${color}30` }}
    >
      {score}/10
    </span>
  );
};

function Feedback2() {
  const location = useLocation();
  const navigate = useNavigate();
  const questions = location.state?.questions || [];
  const answers = location.state?.answers || [];
  const role = location.state?.title || "";
  const company = location.state?.company || "";

  const [selectedIndex, setSelectedIndex] = useState(null);
  const [feedback, setFeedback] = useState([]);
  const [totalScore, setTotalScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchFeedback = async (retries = 3) => {
      if (questions.length === 0 || answers.length === 0) return;
      setLoading(true);
      setError("");
      try {
        const response = await axios.post(
          `${import.meta.env.VITE_REACT_APP_BASE_URL}/api/gemini/feedback`,
          {
            questionsAndAnswers: questions.map((q, i) => ({
              question: q,
              answer: answers[i] || "No answer provided",
            })),
          }
        );
        const { feedback: fb, totalScore: ts } = response.data;
        if (!fb || !Array.isArray(fb)) throw new Error("Invalid feedback format");
        setFeedback(fb);
        setTotalScore(ts);
        setSelectedIndex(0);
      } catch (err) {
        if (retries > 0) {
          await new Promise((r) => setTimeout(r, 2000));
          return fetchFeedback(retries - 1);
        }
        setError("Failed to generate feedback. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchFeedback();
  }, [questions, answers]);

  const handleFinish = async () => {
    try {
      setSubmitting(true);
      const token = localStorage.getItem("token");
      if (!token) throw new Error("User not authenticated");
      await axios.post(
        `${import.meta.env.VITE_REACT_APP_BASE_URL}/api/user/feedback`,
        { feedback, totalScore, role, company, createdAt: new Date().toISOString() },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Bust the cache so Profile and InterviewHistory show the new session immediately
      clearCachedUser();
      navigate("/admin");
    } catch (err) {
      setError("Failed to submit feedback");
    } finally {
      setSubmitting(false);
    }
  };

  const scoreColor = totalScore >= 70 ? "#22d3ee" : totalScore >= 40 ? "#6366F1" : "#f87171";

  return (
    <div
      className="flex h-screen overflow-hidden w-full font-mainFont"
      style={{ background: "hsl(var(--background))" }}
    >
      {/* Sidebar */}
      <div
        className="w-64 flex-shrink-0 flex flex-col overflow-hidden"
        style={{
          background: "hsl(var(--sidebar-background))",
          borderRight: "1px solid rgba(255,255,255,0.07)",
        }}
      >
        {/* Brand header */}
        <div className="p-5 border-b" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
          <button
            onClick={() => navigate("/admin")}
            className="flex items-center gap-2 text-slate-400 hover:text-white text-xs transition-colors mb-4"
          >
            <ArrowLeft size={12} />
            Dashboard
          </button>
          <p
            className="text-sm font-bold font-display truncate"
            style={{
              background: "linear-gradient(135deg, #818cf8, #22d3ee)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            {role || "Interview"}
          </p>
          <p className="text-xs text-slate-500 mt-0.5 truncate">{company}</p>
        </div>

        {/* Total score */}
        {!loading && !error && (
          <div className="px-4 py-3 border-b" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500 uppercase tracking-wide">Total Score</span>
              <span className="text-lg font-bold font-mono" style={{ color: scoreColor }}>
                {totalScore}
              </span>
            </div>
            <div className="mt-2 h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${Math.min(100, totalScore)}%`,
                  background: `linear-gradient(90deg, ${scoreColor}70, ${scoreColor})`,
                }}
              />
            </div>
          </div>
        )}

        {/* Question list */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-10 rounded-lg animate-pulse"
                style={{ background: "rgba(255,255,255,0.04)" }}
              />
            ))
          ) : (
            questions.map((_, i) => {
              const score = feedback[i]?.score || 0;
              const isActive = selectedIndex === i;
              return (
                <button
                  key={i}
                  onClick={() => setSelectedIndex(i)}
                  className="w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-lg text-sm text-left transition-all duration-150"
                  style={{
                    background: isActive ? "rgba(99,102,241,0.12)" : "transparent",
                    border: isActive ? "1px solid rgba(99,102,241,0.28)" : "1px solid transparent",
                    color: isActive ? "#a5b4fc" : "#94a3b8",
                  }}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    {isActive && (
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 flex-shrink-0" />
                    )}
                    <span className="truncate">Question {i + 1}</span>
                  </div>
                  {feedback[i] && <ScoreBadge score={score} />}
                </button>
              );
            })
          )}
        </div>

        {/* Finish button */}
        {!loading && !error && (
          <div className="p-4 border-t" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
            <Button
              onClick={handleFinish}
              disabled={submitting}
              className="w-full h-9 text-sm font-medium text-white"
              style={{ background: "linear-gradient(135deg, #6366F1, #8B5CF6)" }}
            >
              {submitting ? (
                <><Loader2 className="mr-2 h-3 w-3 animate-spin" />Saving...</>
              ) : (
                "Save & Finish"
              )}
            </Button>
          </div>
        )}
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-y-auto p-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-full gap-6">
            <div className="relative">
              <div className="w-16 h-16 rounded-full border-2 border-indigo-500/20 border-t-indigo-500 animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Trophy size={20} className="text-indigo-400" />
              </div>
            </div>
            <div className="text-center">
              <p className="text-white font-semibold">Analysing your answers</p>
              <p className="text-sm text-slate-400 mt-1">Gemini is generating personalised feedback…</p>
            </div>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-full gap-4">
            <p className="text-red-400 text-sm">{error}</p>
            <Button onClick={() => window.location.reload()} variant="outline"
              className="border-white/10 text-slate-300">
              Try Again
            </Button>
          </div>
        ) : selectedIndex !== null ? (
          <div className="max-w-4xl mx-auto space-y-5">
            {/* Question header */}
            <div
              className="rounded-2xl p-5"
              style={{
                background: "hsl(var(--card))",
                border: "1px solid rgba(255,255,255,0.07)",
              }}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <span className="text-xs text-indigo-400 font-mono uppercase tracking-widest">
                    Question {selectedIndex + 1} of {questions.length}
                  </span>
                  <p className="mt-2 text-white text-sm leading-relaxed">
                    {questions[selectedIndex]}
                  </p>
                </div>
                {feedback[selectedIndex] && (
                  <div
                    className="flex-shrink-0 w-14 h-14 rounded-xl flex items-center justify-center text-base font-bold font-mono"
                    style={{
                      background: `${scoreColor}15`,
                      color: scoreColor,
                      border: `1px solid ${scoreColor}30`,
                    }}
                  >
                    {feedback[selectedIndex].score ?? 0}
                  </div>
                )}
              </div>
            </div>

            {/* Answer + Feedback panels */}
            <div className="grid md:grid-cols-2 gap-4">
              <div
                className="rounded-2xl p-5 flex flex-col"
                style={{
                  background: "hsl(var(--card))",
                  border: "1px solid rgba(255,255,255,0.07)",
                  minHeight: "280px",
                }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <User size={13} className="text-slate-400" />
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Your Answer</span>
                </div>
                <p className="text-sm text-slate-300 leading-relaxed flex-1">
                  {answers[selectedIndex] || (
                    <span className="text-slate-600 italic">No answer provided</span>
                  )}
                </p>
              </div>

              <div
                className="rounded-2xl p-5 flex flex-col"
                style={{
                  background: "hsl(var(--card))",
                  border: "1px solid rgba(99,102,241,0.18)",
                  minHeight: "280px",
                }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <MessageSquare size={13} className="text-indigo-400" />
                  <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wide">AI Feedback</span>
                </div>
                <p className="text-sm text-slate-300 leading-relaxed flex-1">
                  {feedback[selectedIndex]?.feedback || (
                    <span className="text-slate-600 italic">Loading feedback…</span>
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
                {selectedIndex + 1} / {questions.length}
              </span>
              <button
                onClick={() => setSelectedIndex((p) => Math.min(questions.length - 1, p + 1))}
                disabled={selectedIndex === questions.length - 1}
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

export default Feedback2;
