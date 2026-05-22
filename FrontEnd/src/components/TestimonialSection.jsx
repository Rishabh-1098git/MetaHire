import React from "react";
import { motion } from "framer-motion";
import { Quote, Star } from "lucide-react";

const testimonials = [
  {
    name: "Vipul Khandelwal",
    role: "Software Engineer",
    company: "Google",
    initials: "VK",
    gradient: "linear-gradient(135deg, #1A6EFA, #22d3ee)",
    content:
      "MetaHire's AI mock interviews helped me prepare for tough technical questions. The personalized feedback was invaluable in landing my dream job at Google.",
    stars: 5,
  },
  {
    name: "Pratyush Ojha",
    role: "ML Engineer",
    company: "Adiyog Tech",
    initials: "PO",
    gradient: "linear-gradient(135deg, #818cf8, #1A6EFA)",
    content:
      "The resume analysis feature gave me insights I never would have considered. It completely transformed my approach to technical interviews — 10/10 recommend.",
    stars: 5,
  },
  {
    name: "Dev Goyal",
    role: "Brand Ambassador",
    company: "SwapSo",
    initials: "DG",
    gradient: "linear-gradient(135deg, #22d3ee, #818cf8)",
    content:
      "The domain-specific questions were spot-on. MetaHire helped me gain confidence and improve my technical communication skills significantly.",
    stars: 5,
  },
];

const TestimonialSection = () => {
  return (
    <section className="py-24 px-4 font-mainFont">
      <div className="max-w-6xl mx-auto">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl lg:text-5xl font-bold font-display mb-4">
            Trusted by{" "}
            <span
              style={{
                background: "linear-gradient(135deg, #60a5fa, #22d3ee)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              real engineers
            </span>
          </h2>
          <p className="text-slate-400 text-lg">
            Professionals who used MetaHire to land their next role.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.12 }}
              className="rounded-2xl p-6 flex flex-col gap-5 transition-all duration-300 hover:-translate-y-1"
              style={{
                background: "rgba(13, 20, 37, 0.7)",
                border: "1px solid rgba(255,255,255,0.06)",
                backdropFilter: "blur(8px)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.border = "1px solid rgba(26,110,250,0.25)";
                e.currentTarget.style.boxShadow = "0 0 24px rgba(26,110,250,0.1)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.border = "1px solid rgba(255,255,255,0.06)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              <div className="flex items-start justify-between">
                <Quote size={18} className="text-blue-500/40" />
                <div className="flex gap-0.5">
                  {Array.from({ length: t.stars }).map((_, i) => (
                    <Star
                      key={i}
                      size={11}
                      className="fill-current"
                      style={{ color: "#f59e0b" }}
                    />
                  ))}
                </div>
              </div>

              <p className="text-slate-300 text-sm leading-relaxed flex-1">
                "{t.content}"
              </p>

              <div className="flex items-center gap-3">
                {/* Gradient avatar with initials */}
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
                  style={{
                    background: t.gradient,
                    boxShadow: "0 0 12px rgba(26,110,250,0.3)",
                  }}
                >
                  {t.initials}
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{t.name}</p>
                  <p className="text-xs text-slate-500">
                    {t.role} · {t.company}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialSection;
