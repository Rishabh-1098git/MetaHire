import React from "react";
import { motion } from "framer-motion";
import { UserPlus, ClipboardList, Video, BarChart2, Sparkles } from "lucide-react";

const steps = [
  {
    icon: UserPlus,
    label: "Sign Up",
    title: "Create your account",
    description: "Register in seconds and set up your profile with your skills, experience, and target roles.",
    color: "#22d3ee",
  },
  {
    icon: ClipboardList,
    label: "Configure",
    title: "Set up your interview",
    description: "Upload your resume and choose your role, level, target company, and tech stack.",
    color: "#1A6EFA",
  },
  {
    icon: Video,
    label: "Interview",
    title: "Take the mock interview",
    description: "Answer 8 tailored behavioral questions and 2 coding challenges in a proctored session.",
    color: "#818cf8",
  },
  {
    icon: BarChart2,
    label: "Results",
    title: "Review your scores",
    description: "Get a per-question score breakdown with a total out of 100, tracked in your history.",
    color: "#1A6EFA",
  },
  {
    icon: Sparkles,
    label: "Feedback",
    title: "AI-powered insights",
    description: "Receive detailed Gemini feedback on each answer to identify gaps and improve fast.",
    color: "#22d3ee",
  },
];

export default function Roadmap() {
  return (
    <section className="py-24 px-4 font-mainFont">
      <div className="max-w-3xl mx-auto">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl lg:text-5xl font-bold font-display mb-4">
            How{" "}
            <span
              style={{
                background: "linear-gradient(135deg, #60a5fa, #22d3ee)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              it works
            </span>
          </h2>
          <p className="text-slate-400 text-lg">
            From sign-up to actionable feedback in five steps.
          </p>
        </motion.div>

        <div className="relative">
          {/* Vertical line */}
          <div
            className="absolute left-6 top-6 bottom-6 w-px hidden sm:block"
            style={{ background: "linear-gradient(180deg, rgba(26,110,250,0.4), rgba(34,211,238,0.4))" }}
          />

          <div className="space-y-4">
            {steps.map((step, i) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.45, delay: i * 0.1 }}
                  className="flex gap-5 group"
                >
                  {/* Icon node */}
                  <div className="relative flex-shrink-0 hidden sm:flex flex-col items-center">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center z-10 transition-all duration-300 group-hover:scale-110"
                      style={{
                        background: `${step.color}15`,
                        border: `1px solid ${step.color}30`,
                        boxShadow: `0 0 16px ${step.color}20`,
                      }}
                    >
                      <Icon size={18} style={{ color: step.color }} />
                    </div>
                  </div>

                  {/* Card */}
                  <div
                    className="flex-1 rounded-2xl p-5 transition-all duration-200 group-hover:-translate-y-0.5 mb-0"
                    style={{
                      background: "rgba(13, 20, 37, 0.7)",
                      border: "1px solid rgba(255,255,255,0.06)",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.border = `1px solid ${step.color}25`;
                      e.currentTarget.style.boxShadow = `0 0 20px ${step.color}10`;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.border = "1px solid rgba(255,255,255,0.06)";
                      e.currentTarget.style.boxShadow = "none";
                    }}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      {/* Mobile icon */}
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center sm:hidden flex-shrink-0"
                        style={{ background: `${step.color}15`, border: `1px solid ${step.color}30` }}
                      >
                        <Icon size={14} style={{ color: step.color }} />
                      </div>
                      <div>
                        <span
                          className="text-xs font-mono uppercase tracking-widest"
                          style={{ color: step.color }}
                        >
                          Step {i + 1} — {step.label}
                        </span>
                      </div>
                    </div>
                    <h3 className="text-white font-semibold text-sm font-display mb-1">
                      {step.title}
                    </h3>
                    <p className="text-slate-400 text-sm leading-relaxed">{step.description}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
