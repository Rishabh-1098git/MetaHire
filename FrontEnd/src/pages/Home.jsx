import React, { memo, useEffect } from "react";
import { motion, useReducedMotion } from "framer-motion";
import Roadmap from "../components/Roadmap";
import Header from "../components/Header";
import { useNavigate } from "react-router-dom";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../components/ui/accordion";
import {
  ArrowRight,
  Zap,
  Shield,
  BarChart3,
  Code2,
  Mic,
  Target,
  CheckCircle2,
  FileText,
  Brain,
  TrendingUp,
  Clock,
  MessageSquare,
  Cpu,
  Eye,
  GitBranch,
  Award,
} from "lucide-react";
import TestimonialSection from "../components/TestimonialSection";

/* ─── Feature Card Visuals ─── */

const ResumeVisual = memo(() => {
  const questions = [
    "Based on your React experience, how would you…",
    "Your resume mentions Project X — walk me through…",
    "How did you optimise performance in your last role?",
  ];
  return (
    <div
      className="relative h-48 overflow-hidden rounded-t-2xl p-4 flex flex-col"
      style={{ background: "rgba(6,10,22,0.9)" }}
    >
      <div
        className="flex items-center gap-2 mb-3 px-2.5 py-1.5 rounded-lg"
        style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}
      >
        <div
          className="w-6 h-6 rounded flex items-center justify-center text-[7px] font-bold text-red-300 flex-shrink-0"
          style={{ background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.2)" }}
        >
          PDF
        </div>
        <span className="text-[11px] text-slate-300 flex-1">Resume.pdf</span>
        <span className="flex items-center gap-1 text-[10px] text-emerald-400">
          <CheckCircle2 size={9} /> Parsed
        </span>
      </div>
      <div className="space-y-2 flex-1">
        {questions.map((q, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 + i * 0.35, duration: 0.4 }}
            className="flex items-start gap-2"
          >
            <span
              className="text-[9px] font-mono mt-0.5 px-1 py-0.5 rounded flex-shrink-0"
              style={{ background: "rgba(26,110,250,0.12)", color: "#60a5fa" }}
            >
              Q{i + 1}
            </span>
            <p className="text-[10px] text-slate-400 leading-snug line-clamp-2">{q}</p>
          </motion.div>
        ))}
      </div>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 1, 0] }}
        transition={{ delay: 1.6, duration: 1.2, repeat: Infinity, repeatDelay: 3 }}
        className="flex items-center gap-1.5 mt-2"
      >
        {[0, 1, 2].map((i) => (
          <span key={i} className="w-1 h-1 rounded-full bg-blue-400 animate-bounce"
            style={{ animationDelay: `${i * 0.15}s` }} />
        ))}
        <span className="text-[9px] text-blue-400">Generating more…</span>
      </motion.div>
    </div>
  );
});

const InterviewVisual = memo(() => {
  const bars = Array.from({ length: 22 }, (_, i) => ({
    h: 10 + Math.abs(Math.sin(i * 0.7 + 1.2) * 16) + Math.abs(Math.sin(i * 1.3) * 8),
    delay: i * 0.04,
  }));
  return (
    <div
      className="relative h-48 overflow-hidden rounded-t-2xl p-4 flex flex-col"
      style={{ background: "rgba(6,10,22,0.9)" }}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
          <span className="text-[10px] font-mono text-red-400 uppercase tracking-widest">Live</span>
        </div>
        <div
          className="text-[11px] font-mono px-2 py-0.5 rounded"
          style={{ background: "rgba(255,255,255,0.04)", color: "#94a3b8" }}
        >
          02:34
        </div>
      </div>
      <p className="text-[11px] text-slate-200 leading-snug mb-auto">
        "How would you design a scalable notification system for millions of users?"
      </p>
      <div className="flex items-end justify-center gap-[2px] h-10 mt-3">
        {bars.map(({ h, delay }, i) => (
          <motion.div
            key={i}
            className="w-[3px] rounded-full"
            animate={{ height: [h * 0.4, h, h * 0.5, h * 0.8, h * 0.4] }}
            transition={{ duration: 1.1, delay, repeat: Infinity, ease: "easeInOut" }}
            style={{ background: "rgba(26,110,250,0.7)", minHeight: "3px" }}
          />
        ))}
      </div>
      <p className="text-[9px] text-blue-400 text-center mt-1.5 tracking-wide">● Listening</p>
    </div>
  );
});

const FeedbackVisual = memo(() => {
  const rows = [
    { label: "Q1", score: 8, color: "#22d3ee" },
    { label: "Q2", score: 6, color: "#1A6EFA" },
    { label: "Q3", score: 9, color: "#22d3ee" },
    { label: "Q4", score: 4, color: "#f87171" },
    { label: "Q5", score: 7, color: "#1A6EFA" },
  ];
  return (
    <div
      className="relative h-48 overflow-hidden rounded-t-2xl p-4 flex flex-col"
      style={{ background: "rgba(6,10,22,0.9)" }}
    >
      <span className="text-[9px] text-slate-500 uppercase tracking-widest mb-2.5">
        Per-question breakdown
      </span>
      <div className="space-y-2 flex-1">
        {rows.map(({ label, score, color }, i) => (
          <div key={label} className="flex items-center gap-2">
            <span className="text-[9px] font-mono text-slate-500 w-5 flex-shrink-0">{label}</span>
            <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.05)" }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${score * 10}%` }}
                transition={{ delay: 0.3 + i * 0.12, duration: 0.7, ease: "easeOut" }}
                className="h-full rounded-full"
                style={{ background: color }}
              />
            </div>
            <span className="text-[9px] font-mono w-7 text-right flex-shrink-0" style={{ color }}>
              {score}/10
            </span>
          </div>
        ))}
      </div>
      <div className="mt-2 pt-2.5 flex items-center justify-between"
        style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <span className="text-[10px] text-slate-400">Total score</span>
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.0 }}
          className="text-xl font-bold font-mono text-cyan-400"
        >
          72
        </motion.span>
      </div>
    </div>
  );
});

/* ─── Data ─── */

const features = [
  {
    Visual: ResumeVisual,
    icon: <FileText size={14} className="text-blue-400" />,
    title: "Resume-Aware Questions",
    description:
      "Upload your PDF resume and get 10 personalized questions generated from your actual experience, projects, and tech stack.",
  },
  {
    Visual: InterviewVisual,
    icon: <Brain size={14} className="text-cyan-400" />,
    title: "AI Mock Interviews",
    description:
      "Simulate real interviews in a fullscreen, proctored environment with speech-to-text answers and a built-in code editor.",
  },
  {
    Visual: FeedbackVisual,
    icon: <TrendingUp size={14} className="text-blue-400" />,
    title: "Instant AI Feedback",
    description:
      "Every answer is scored by Gemini with detailed per-question feedback, a total score, and actionable improvement tips.",
  },
];

const aiFeatures = [
  { title: "Resume-Based Questions", icon: <Target size={20} className="text-blue-400" /> },
  { title: "Domain-Specific Depth", icon: <Code2 size={20} className="text-cyan-400" /> },
  { title: "Real-Time Scoring", icon: <Zap size={20} className="text-blue-400" /> },
  { title: "AI Scoring Engine", icon: <BarChart3 size={20} className="text-cyan-400" /> },
  { title: "Live Proctoring", icon: <Shield size={20} className="text-blue-400" /> },
  { title: "Voice Recognition", icon: <Mic size={20} className="text-cyan-400" /> },
];

const interviewFormat = [
  {
    phase: "Questions 1–3",
    type: "Behavioural",
    color: "#1A6EFA",
    time: "2 min each",
    desc: "Situational questions about your past work — leadership, teamwork, conflict resolution.",
    icon: <MessageSquare size={15} />,
  },
  {
    phase: "Questions 4–6",
    type: "Technical",
    color: "#818cf8",
    time: "2 min each",
    desc: "Concept and system-design questions specific to your role, level, and chosen tech stack.",
    icon: <Cpu size={15} />,
  },
  {
    phase: "Questions 7–8",
    type: "Resume-Based",
    color: "#22d3ee",
    time: "2 min each",
    desc: "Deep-dive questions pulled directly from your uploaded resume — your projects, wins, and skills.",
    icon: <FileText size={15} />,
  },
  {
    phase: "Questions 9–10",
    type: "Coding",
    color: "#34d399",
    time: "10 min each",
    desc: "Live coding problems in JS, Python, Java, or C++ — difficulty matched to your experience level.",
    icon: <Code2 size={15} />,
  },
];

const whyMetahire = [
  {
    icon: <Eye size={20} className="text-blue-400" />,
    title: "Proctored environment",
    desc: "TensorFlow.js + COCO-SSD detects phones and extra faces in real time. Three strikes and the session auto-submits — just like the real thing.",
  },
  {
    icon: <GitBranch size={20} className="text-cyan-400" />,
    title: "End-to-end AI pipeline",
    desc: "Gemini 1.5 Flash generates your questions, evaluates every answer, and writes detailed feedback — no templates, no canned responses.",
  },
  {
    icon: <Award size={20} className="text-blue-400" />,
    title: "Trackable progress",
    desc: "Every session is saved to your history with per-question scores. Watch your total score climb as you practise more.",
  },
  {
    icon: <Clock size={20} className="text-cyan-400" />,
    title: "30-minute full mock",
    desc: "8 spoken answers + 2 coding problems in one sitting. Built-in timer, code editor, and speech-to-text so nothing slows you down.",
  },
];

/* ─── Home ─── */

export default function Home() {
  const navigate = useNavigate();
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) navigate("/admin");
  }, [navigate]);

  const fadeUp = (delay = 0) => ({
    initial: { opacity: shouldReduceMotion ? 1 : 0, y: shouldReduceMotion ? 0 : 24 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, delay, ease: "easeOut" },
  });

  return (
    <div className="text-slate-200 font-mainFont">
      <div className="relative z-50">
        <Header />
      </div>

      {/* ── Hero ── */}
      <section className="relative min-h-screen flex items-center justify-center px-4 overflow-hidden">
        <div
          className="absolute top-1/4 left-1/3 w-[500px] h-[500px] rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(26,110,250,0.12), transparent 70%)", filter: "blur(40px)" }}
        />
        <div
          className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(0,212,255,0.08), transparent 70%)", filter: "blur(40px)" }}
        />

        <motion.div className="text-center max-w-4xl mx-auto relative z-10" {...fadeUp(0)}>
          <motion.div
            {...fadeUp(0.1)}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium text-blue-300 mb-8 border border-blue-500/20"
            style={{ background: "rgba(26,110,250,0.08)" }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
            Powered by Google Gemini
          </motion.div>

          <motion.h1 {...fadeUp(0.15)} className="text-4xl sm:text-6xl lg:text-8xl font-bold mb-6 font-display leading-tight">
            Ace your next{" "}
            <span style={{
              background: "linear-gradient(135deg, #60a5fa 0%, #22d3ee 50%, #818cf8 100%)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
            }}>
              interview
            </span>
          </motion.h1>

          <motion.p {...fadeUp(0.25)} className="text-base sm:text-lg lg:text-xl text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            Upload your resume. Get AI-generated questions tailored to your experience.
            Practice in a proctored environment and receive instant Gemini-powered feedback.
          </motion.p>

          <motion.div {...fadeUp(0.35)} className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate("/signingsignup")}
              className="group flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl text-white font-semibold transition-all duration-200"
              style={{ background: "linear-gradient(135deg, #1A6EFA, #0ea5e9)", boxShadow: "0 0 24px rgba(26,110,250,0.35)" }}
              onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "0 0 40px rgba(26,110,250,0.55)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "0 0 24px rgba(26,110,250,0.35)"; e.currentTarget.style.transform = "translateY(0)"; }}
            >
              Start for free
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={() => document.getElementById("features")?.scrollIntoView({ behavior: "smooth" })}
              className="flex items-center justify-center px-8 py-3.5 rounded-xl text-slate-300 font-medium transition-all duration-200 border border-white/10 hover:border-white/20 hover:text-white hover:bg-white/[0.04]"
            >
              See how it works
            </button>
          </motion.div>
        </motion.div>
      </section>

      {/* ── Stats ── */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { value: "10", label: "Questions", sub: "per interview session" },
              { value: "8 + 2", label: "Format", sub: "Behavioral & Coding" },
              { value: "100pt", label: "Score", sub: "Gemini-powered scale" },
              { value: "~30m", label: "Duration", sub: "Full mock session" },
            ].map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="flex flex-col items-center text-center px-6 py-7 rounded-2xl"
                style={{
                  background: "rgba(13,20,37,0.7)",
                  border: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                <span
                  className="text-3xl sm:text-4xl font-bold font-display mb-1"
                  style={{
                    background: "linear-gradient(135deg, #60a5fa, #22d3ee)",
                    WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
                  }}
                >
                  {s.value}
                </span>
                <span className="text-sm font-semibold text-white">{s.label}</span>
                <span className="text-xs text-slate-500 mt-0.5">{s.sub}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="py-24 px-4">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-display mb-4">
            Everything you need to{" "}
            <span style={{
              background: "linear-gradient(135deg, #60a5fa, #22d3ee)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
            }}>
              get hired
            </span>
          </h2>
          <p className="text-slate-400 text-lg max-w-xl mx-auto">
            A complete interview prep system built for engineers who want to level up fast.
          </p>
        </motion.div>

        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map(({ Visual, icon, title, description }, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1"
              style={{ background: "rgba(13,20,37,0.7)", border: "1px solid rgba(255,255,255,0.06)", backdropFilter: "blur(8px)" }}
              onMouseEnter={(e) => { e.currentTarget.style.border = "1px solid rgba(26,110,250,0.3)"; e.currentTarget.style.boxShadow = "0 0 30px rgba(26,110,250,0.12)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.border = "1px solid rgba(255,255,255,0.06)"; e.currentTarget.style.boxShadow = "none"; }}
            >
              <Visual />
              <div className="p-6">
                <div className="flex items-center gap-2 mb-2">
                  {icon}
                  <h3 className="text-base font-semibold font-display text-white">{title}</h3>
                </div>
                <p className="text-sm text-slate-400 leading-relaxed">{description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Interview Format Breakdown ── */}
      <section className="py-24 px-4">
        <div className="max-w-5xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-display mb-4">
              Inside your{" "}
              <span style={{
                background: "linear-gradient(135deg, #60a5fa, #22d3ee)",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
              }}>
                30-minute mock
              </span>
            </h2>
            <p className="text-slate-400 text-lg max-w-xl mx-auto">
              10 questions across four formats — tailored to your resume, role, and experience level.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {interviewFormat.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ duration: 0.45, delay: i * 0.1 }}
                className="flex gap-4 rounded-2xl p-5"
                style={{ background: "rgba(13,20,37,0.7)", border: "1px solid rgba(255,255,255,0.06)" }}
              >
                {/* Icon */}
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{ background: `${item.color}15`, border: `1px solid ${item.color}25`, color: item.color }}
                >
                  {item.icon}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span
                      className="text-xs font-semibold font-mono px-2 py-0.5 rounded-full"
                      style={{ background: `${item.color}15`, color: item.color, border: `1px solid ${item.color}25` }}
                    >
                      {item.type}
                    </span>
                    <span className="text-xs text-slate-500">{item.phase}</span>
                    <span
                      className="text-xs text-slate-500 ml-auto flex items-center gap-1"
                    >
                      <Clock size={10} /> {item.time}
                    </span>
                  </div>
                  <p className="text-sm text-slate-400 leading-relaxed">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Proctoring note */}
          <motion.div
            initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-4 flex items-start gap-3 rounded-2xl px-5 py-4"
            style={{ background: "rgba(26,110,250,0.06)", border: "1px solid rgba(26,110,250,0.15)" }}
          >
            <Shield size={16} className="text-blue-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-slate-400 leading-relaxed">
              <span className="text-blue-300 font-medium">AI proctoring runs throughout.</span>{" "}
              TensorFlow.js detects phones and extra faces in real time. Three warnings are issued before the session auto-submits — keeping it fair and pressure-tested.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── Why MetaHire ── */}
      <section className="py-24 px-4">
        <div className="max-w-5xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-display mb-4">
              Why{" "}
              <span style={{
                background: "linear-gradient(135deg, #60a5fa, #22d3ee)",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
              }}>
                MetaHire?
              </span>
            </h2>
            <p className="text-slate-400 text-lg max-w-xl mx-auto">
              Not just another question bank. A complete system that simulates the real pressure of a technical interview.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {whyMetahire.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ duration: 0.45, delay: i * 0.1 }}
                className="flex gap-4 rounded-2xl p-5 transition-all duration-200"
                style={{ background: "rgba(13,20,37,0.7)", border: "1px solid rgba(255,255,255,0.06)" }}
                onMouseEnter={(e) => { e.currentTarget.style.border = "1px solid rgba(26,110,250,0.2)"; e.currentTarget.style.boxShadow = "0 0 20px rgba(26,110,250,0.08)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.border = "1px solid rgba(255,255,255,0.06)"; e.currentTarget.style.boxShadow = "none"; }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{ background: "rgba(26,110,250,0.08)", border: "1px solid rgba(26,110,250,0.15)" }}
                >
                  {item.icon}
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white mb-1">{item.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── AI Capabilities ── */}
      <section className="py-24 px-4">
        <div className="max-w-5xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-display mb-4">
              Powered by AI,{" "}
              <span style={{
                background: "linear-gradient(135deg, #60a5fa, #22d3ee)",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
              }}>
                end to end
              </span>
            </h2>
            <p className="text-slate-400 text-lg max-w-xl mx-auto">
              Every step of your interview — from question generation to feedback — is driven by AI.
            </p>
          </motion.div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {aiFeatures.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ duration: 0.4, delay: index * 0.08 }}
                className="flex items-center gap-3 rounded-xl px-5 py-4 transition-all duration-200 hover:bg-white/[0.04]"
                style={{ background: "rgba(13,20,37,0.5)", border: "1px solid rgba(255,255,255,0.06)" }}
              >
                {item.icon}
                <span className="text-sm font-medium text-slate-300">{item.title}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Roadmap ── */}
      <section className="py-4">
        <Roadmap />
      </section>

      {/* ── Testimonials ── */}
      <TestimonialSection />

      {/* ── FAQ ── */}
      <section className="py-24 px-4">
        <div className="max-w-3xl mx-auto">
          <motion.h2
            className="text-3xl sm:text-4xl font-bold font-display text-center mb-12"
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.5 }}
          >
            Frequently asked questions
          </motion.h2>
          <Accordion type="single" collapsible className="w-full space-y-3">
            {[
              {
                q: "What is MetaHire?",
                a: "MetaHire is an AI-powered interview platform. Upload your resume, configure your target role and company, and take a fully proctored mock interview. Gemini generates your questions and scores every answer with detailed feedback.",
              },
              {
                q: "What does a session look like?",
                a: "Each session is ~30 minutes: 8 spoken questions (behavioural, technical, resume-based — 2 min each) followed by 2 coding problems (10 min each). A built-in code editor supports JavaScript, Python, Java, and C++.",
              },
              {
                q: "How does scoring work?",
                a: "After the session, Gemini evaluates each of your 10 answers independently and assigns a score from 1–10 with written feedback. Scores are summed to give a total out of 100, which is saved to your history so you can track progress.",
              },
              {
                q: "Will my resume be stored securely?",
                a: "Your resume is processed client-side for text extraction — only the extracted text is sent to our server to generate questions. Files uploaded via your profile are stored on Cloudinary with secure access controls.",
              },
              {
                q: "Can I customise my interview?",
                a: "Yes. Before each session you pick your role (SWE, DS, PM…), seniority level, years of experience, technologies, and target company. The first 8 questions are tailored to your resume and these choices; the last 2 are coding problems matched to your level.",
              },
              {
                q: "How does AI proctoring work?",
                a: "During the interview, TensorFlow.js + COCO-SSD runs locally in your browser to detect whether multiple people are in frame or a phone is visible. You receive up to 3 warnings before the session is auto-submitted.",
              },
            ].map((item, i) => (
              <AccordionItem
                key={i}
                value={`item-${i}`}
                className="rounded-xl px-2 border border-white/[0.06]"
                style={{ background: "rgba(13,20,37,0.5)" }}
              >
                <AccordionTrigger className="text-slate-200 text-sm sm:text-base font-medium hover:no-underline px-2 py-4">
                  {item.q}
                </AccordionTrigger>
                <AccordionContent className="text-sm text-slate-400 px-2 pb-4 leading-relaxed">
                  {item.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="py-16 px-4">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.6 }}
            className="relative rounded-3xl overflow-hidden text-center px-8 py-16"
            style={{
              background: "rgba(13,20,37,0.8)",
              border: "1px solid rgba(26,110,250,0.2)",
              boxShadow: "0 0 60px rgba(26,110,250,0.1)",
            }}
          >
            {/* Background glow */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: "radial-gradient(ellipse at 50% 0%, rgba(26,110,250,0.12), transparent 70%)",
              }}
            />
            <div className="relative z-10">
              <span
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium text-blue-300 mb-6 border border-blue-500/20"
                style={{ background: "rgba(26,110,250,0.08)" }}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                Free to start
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold font-display text-white mb-4">
                Ready to practise like it's real?
              </h2>
              <p className="text-slate-400 mb-8 max-w-md mx-auto leading-relaxed">
                Upload your resume, pick your target company, and get 10 personalised questions in under a minute.
              </p>
              <button
                onClick={() => navigate("/signingsignup")}
                className="group inline-flex items-center gap-2 px-8 py-3.5 rounded-xl text-white font-semibold transition-all duration-200"
                style={{ background: "linear-gradient(135deg, #1A6EFA, #0ea5e9)", boxShadow: "0 0 24px rgba(26,110,250,0.4)" }}
                onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "0 0 40px rgba(26,110,250,0.6)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "0 0 24px rgba(26,110,250,0.4)"; e.currentTarget.style.transform = "translateY(0)"; }}
              >
                Get started — it's free
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-white/[0.06] py-8 px-4">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <span
            className="text-lg font-bold font-display"
            style={{
              background: "linear-gradient(135deg, #60a5fa, #22d3ee)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
            }}
          >
            MetaHire
          </span>
          <p className="text-xs text-slate-500 text-center">
            © 2025 MetaHire. Built by Rishabh Saini. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-xs text-slate-500">
            <a href="https://github.com/Rishabh-1098git/MetaHire" target="_blank" rel="noopener noreferrer"
              className="hover:text-slate-300 transition-colors">GitHub</a>
            <a href="mailto:rishabhsaini1098@gmail.com" className="hover:text-slate-300 transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
