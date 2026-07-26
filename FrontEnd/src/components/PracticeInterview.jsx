import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Upload, ArrowRight, CheckCircle2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { extractResumeText } from "@/lib/resumeParser";
import { buildInterviewPrompt, extractResumeInsights } from "@/lib/interviewSetup";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";

const InterviewSetup = () => {
  const [role, setRole] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [resumeText, setResumeText] = useState("");
  const [uploadedResume, setUploadedResume] = useState("");
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const roles = ["Software Engineer", "Data Scientist", "Product Manager", "DevOps Engineer", "UI/UX Designer"];
  const navigate = useNavigate();

  const instructions = [
    "Wear headphones for clear audio quality",
    "Sit in a quiet, distraction-free environment",
    "Speak answers only after the question is read aloud",
    "8 behavioral questions — 2 minutes each",
    "2 coding problems — 10 minutes each",
    "Stable internet connection required",
  ];

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setLoading(true);
      const text = await extractResumeText(file);
      setResumeText(text);
      setUploadedResume(file.name);
      setInsights(extractResumeInsights(text, role, jobDescription));
      toast("Resume parsed successfully. We’ll tailor the questions around it.");
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
    <>
      <ResizablePanelGroup
        direction="horizontal"
        className="w-full rounded-2xl overflow-hidden"
        style={{ border: "1px solid rgba(99,102,241,0.12)", minHeight: "400px" }}
      >
        <ResizablePanel defaultSize={60}>
          <div className="flex flex-col h-full items-center justify-center p-8 text-center gap-6">
            <div>
              <div className="flex items-center justify-center gap-2 text-indigo-400 mb-3">
                <Sparkles size={18} />
                <span className="text-sm uppercase tracking-[0.2em]">Resume-aware interview setup</span>
              </div>
              <h1 className="font-display text-2xl sm:text-3xl font-bold text-white mb-3">
                AI-Powered Mock Interviews
              </h1>
              <p className="text-slate-400 text-sm sm:text-base leading-relaxed max-w-sm mx-auto">
                Choose your target role, paste the job description, upload your resume, and we’ll generate questions around the real match.
              </p>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="group flex items-center gap-2 px-7 py-3 rounded-xl text-white font-semibold text-sm transition-all duration-200"
              style={{
                background: "linear-gradient(135deg, #6366F1, #8B5CF6)",
                boxShadow: "0 0 24px rgba(99,102,241,0.35)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = "0 0 40px rgba(99,102,241,0.55)";
                e.currentTarget.style.transform = "translateY(-2px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = "0 0 24px rgba(99,102,241,0.35)";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              Start Practice Interview
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </ResizablePanel>

        <ResizableHandle className="bg-white/[0.04] hover:bg-indigo-500/20 transition-colors" />

        <ResizablePanel defaultSize={40}>
          <div className="h-full p-6" style={{ borderLeft: "1px solid rgba(255,255,255,0.05)" }}>
            <h2 className="font-display text-sm font-semibold text-slate-300 uppercase tracking-widest mb-5">
              Instructions
            </h2>
            <ul className="space-y-3">
              {instructions.map((instruction, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-slate-400">
                  <CheckCircle2 size={14} className="text-indigo-400/70 mt-0.5 flex-shrink-0" />
                  <span>{instruction}</span>
                </li>
              ))}
            </ul>
            <p className="mt-8 text-sm font-semibold text-indigo-400 font-mainFont">Best of luck! 🚀</p>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent
          className="max-w-2xl"
          style={{
            background: "rgba(10, 14, 26, 0.98)",
            border: "1px solid rgba(99,102,241,0.22)",
            backdropFilter: "blur(20px)",
          }}
        >
          <DialogHeader>
            <DialogTitle className="font-display text-white text-xl">Configure Interview</DialogTitle>
            <DialogDescription className="text-slate-400">Customize your practice session</DialogDescription>
          </DialogHeader>

          <form onSubmit={onSubmit} className="space-y-4 mt-2">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-slate-300 text-sm">Role</Label>
                <Select value={role} onValueChange={setRole}>
                  <SelectTrigger className="h-10 border-white/10 bg-white/[0.04] text-white placeholder:text-slate-500">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-950 border-white/10 text-slate-200">
                    {roles.map((option) => (
                      <SelectItem key={option} value={option} className="focus:bg-indigo-500/10 focus:text-white">
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-slate-300 text-sm">Resume (PDF)</Label>
                <label className="flex h-10 cursor-pointer items-center justify-center gap-2 rounded-lg border border-indigo-500/20 bg-indigo-500/10 px-3 text-sm text-slate-200 transition hover:bg-indigo-500/20">
                  <Upload size={14} />
                  {uploadedResume ? uploadedResume : "Upload PDF"}
                  <Input type="file" accept=".pdf" className="hidden" onChange={handleFileUpload} />
                </label>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-slate-300 text-sm">Job description</Label>
              <Textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste the job description you want to practice for..."
                className="min-h-[140px] bg-white/[0.04] border-white/10 text-white placeholder:text-slate-600"
              />
            </div>

            {insights && (
              <div className="rounded-lg border border-white/10 bg-white/[0.03] p-3">
                <h3 className="text-sm font-medium text-white mb-2">Resume insights</h3>
                <div className="flex flex-wrap gap-2 mb-2">
                  {insights.skills?.map((skill) => (
                    <span key={skill} className="rounded-full border border-indigo-500/20 bg-indigo-500/10 px-2.5 py-1 text-xs text-indigo-200">
                      {skill}
                    </span>
                  ))}
                </div>
                <p className="text-sm text-slate-400">{insights.summary}</p>
              </div>
            )}

            <Button type="submit" disabled={loading} className="w-full h-11 font-medium mt-2 text-white" style={{ background: "linear-gradient(135deg, #6366F1, #8B5CF6)" }}>
              {loading ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Generating questions...</>
              ) : (
                "Generate Interview Questions"
              )}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default InterviewSetup;
