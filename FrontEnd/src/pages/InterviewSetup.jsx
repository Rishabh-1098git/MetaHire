import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";
import { Loader2, Upload, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { extractResumeText } from "@/lib/resumeParser";
import { buildInterviewPrompt, extractResumeInsights } from "@/lib/interviewSetup";

const InterviewSetup = () => {
  const [role, setRole] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [resumeText, setResumeText] = useState("");
  const [uploadedResume, setUploadedResume] = useState("");
  const [loading, setLoading] = useState(false);
  const [insights, setInsights] = useState(null);
  const navigate = useNavigate();

  const roles = [
    "Software Engineer",
    "Data Scientist",
    "Product Manager",
    "DevOps Engineer",
    "UI/UX Designer",
  ];

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setLoading(true);
      const text = await extractResumeText(file);
      setResumeText(text);
      setUploadedResume(file.name);
      const extractedInsights = extractResumeInsights(text, role, jobDescription);
      setInsights(extractedInsights);
      toast("Resume parsed successfully. We’ll tailor the interview around it.");
    } catch (error) {
      console.error("Resume parse failed:", error);
      toast.error("Unable to parse the resume. Please try again with a PDF file.");
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    if (!role || !jobDescription.trim() || !resumeText) {
      toast.error("Please choose a role, paste the job description, and upload a resume.");
      return;
    }

    setLoading(true);

    try {
      const prompt = buildInterviewPrompt({
        role,
        jobDescription,
        resumeText,
        insights: insights || extractResumeInsights(resumeText, role, jobDescription),
      });

      const { data: responseData } = await axios.post(
        `${import.meta.env.VITE_REACT_APP_BASE_URL}/api/gemini`,
        { prompt }
      );

      const questions = responseData.questions
        .map((q) => q.trim())
        .filter((q) => q.length > 0)
        .slice(0, 10);

      if (questions?.length) {
        const interviewId = Math.random().toString(36).substring(2, 10);
        navigate(`/admin/interview/${interviewId}`, {
          state: { questions, interviewId, title: role, company: "Target Company" },
        });
      } else {
        toast.error("No questions generated. Please try again.");
      }
    } catch (error) {
      console.error("Error fetching questions:", error);
      toast.error("Failed to generate interview questions. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10 font-mainFont">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className="w-full max-w-3xl"
      >
        <div
          className="rounded-2xl p-8"
          style={{
            background: "rgba(13, 20, 37, 0.8)",
            border: "1px solid rgba(255,255,255,0.08)",
            backdropFilter: "blur(16px)",
            boxShadow: "0 0 60px rgba(26,110,250,0.08)",
          }}
        >
          <div className="mb-8">
            <div className="flex items-center gap-2 text-blue-400 mb-3">
              <Sparkles size={18} />
              <span className="text-sm font-medium uppercase tracking-[0.2em]">Resume-aware interview setup</span>
            </div>
            <h1 className="text-2xl font-semibold text-white">Create a more realistic mock interview</h1>
            <p className="text-sm text-slate-400 mt-2">
              Choose the role, paste the job description, upload your resume, and we’ll build questions around what matters most.
            </p>
          </div>

          <form onSubmit={onSubmit} className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="role" className="text-slate-200">Job role</Label>
                <select
                  id="role"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-white"
                >
                  <option value="" disabled>
                    Select role
                  </option>
                  {roles.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="resume" className="text-slate-200">Resume</Label>
                <label className="flex h-10 cursor-pointer items-center justify-center gap-2 rounded-md border border-dashed border-slate-600 bg-slate-950/40 px-3 text-sm text-slate-300 transition hover:border-blue-400 hover:text-white">
                  <Upload size={16} />
                  {uploadedResume ? uploadedResume : "Upload PDF resume"}
                  <input type="file" accept=".pdf" className="hidden" onChange={handleFileUpload} />
                </label>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="jobDescription" className="text-slate-200">Job description</Label>
              <Textarea
                id="jobDescription"
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste the job description you want to practice for..."
                className="min-h-[180px] bg-slate-950/60 border-slate-700 text-white"
              />
            </div>

            {insights && (
              <div className="rounded-xl border border-slate-700 bg-slate-950/50 p-4">
                <h2 className="text-white font-medium mb-3">What we inferred from your resume</h2>
                <div className="flex flex-wrap gap-2 mb-3">
                  {insights.skills?.map((skill) => (
                    <span key={skill} className="rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-sm text-blue-200">
                      {skill}
                    </span>
                  ))}
                </div>
                <p className="text-sm text-slate-400">{insights.summary}</p>
              </div>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                "Generate interview questions"
              )}
            </Button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default InterviewSetup;
