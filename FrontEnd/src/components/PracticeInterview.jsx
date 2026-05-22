import React, { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Loader2, Upload, ArrowRight, CheckCircle2 } from "lucide-react";
import pdfToText from "react-pdftotext";
import { Badge } from "@/components/ui/badge";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";

const InterviewSetup = () => {
  const [uploadedResume, setUploadedResume] = useState("");
  const [resumeText, setResumeText] = useState("");
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const roles = ["Software Engineer", "Data Scientist", "Product Manager", "DevOps Engineer", "UI/UX Designer"];
  const levels = ["Fresher", "Junior", "Mid-Level", "Senior", "Lead"];
  const companies = ["Google", "Microsoft", "Amazon", "Meta", "Apple", "Netflix"];
  const technologies = ["JavaScript", "Python", "Java", "React", "Node.js", "SQL", "AWS", "Docker", "Kubernetes"];

  const { control, handleSubmit, setValue, formState: { errors } } = useForm({
    defaultValues: { role: "", level: "", experience: "", technologies: [], targetCompany: "", resume: null },
  });

  const navigate = useNavigate();

  const renderSelectedTechnologies = (selected) => {
    if (!selected || selected.length === 0) return "Select technologies";
    return (
      <div className="flex flex-wrap gap-1">
        {selected.map((tech) => (
          <Badge key={tech} variant="secondary" className="text-xs bg-indigo-500/10 text-indigo-300 border-indigo-500/20">
            {tech}
          </Badge>
        ))}
      </div>
    );
  };

  function extractText(file) {
    setLoading(true);
    pdfToText(file)
      .then((text) => { setResumeText(text); setLoading(false); })
      .catch(() => { alert("Failed to extract text from PDF. Please try again."); setLoading(false); });
  }

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadedResume(file.name);
      setValue("resume", file);
      if (file.name.split(".").pop().toLowerCase() === "pdf") extractText(file);
      else alert("Unsupported file format. Please upload a PDF.");
    }
  };

  const onSubmit = async (data) => {
    if (!resumeText) { alert("Please upload and extract resume text before proceeding."); return; }
    setLoading(true);
    try {
      const prompt = `Generate 10 interview questions for the following details in the format of a single string separated by '|':
  - Role: ${data.role}
  - Level: ${data.level}
  - Experience: ${data.experience} years
  - Technologies: ${data.technologies.join(", ")}
  - Target Company: ${data.targetCompany}
  - Resume Text: ${resumeText}

Ensure the first 8 questions include a mix of behavioral, technical, and resume-related questions that are concise, relevant, and suitable for the specified role, level, and experience. For example, include questions like:
- "Based on your resume, can you tell us about your experience with [specific technology or project]?"
- "How did your experience with [specific skill/technology] contribute to the success of your previous projects?"
- "Can you explain a challenging situation from your previous roles as described in your resume and how you overcame it?"

The last 2 questions should be coding problems according to the level and experience with the following structure:

 Problem description: A concise explanation of the task.
 Input: Clearly defined input format.
 Output: Clearly defined output format.
 Example:
   - Input: [example input]
   - Output: [expected output]

Return the output as a single string with each question separated by '|'.`;

      const { data: responseData } = await axios.post(
        `${import.meta.env.VITE_REACT_APP_BASE_URL}/api/gemini`,
        { prompt }
      );
      const questions = responseData.questions;
      if (questions && questions.length > 0) {
        const interviewId = Math.random().toString(36).substring(2, 10);
        navigate(`/admin/interview/${interviewId}`, {
          state: { questions, interviewId, title: data.role, company: data.targetCompany },
        });
      } else {
        alert("No questions generated. Please try again.");
      }
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error("Error fetching questions:", error);
      alert("Failed to fetch interview questions. Please try again.");
    }
  };

  const instructions = [
    "Wear headphones for clear audio quality",
    "Sit in a quiet, distraction-free environment",
    "Speak answers only after the question is read aloud",
    "8 behavioral questions — 2 minutes each",
    "2 coding problems — 10 minutes each",
    "Stable internet connection required",
  ];

  return (
    <>
      <ResizablePanelGroup
        direction="horizontal"
        className="w-full rounded-2xl overflow-hidden"
        style={{ border: "1px solid rgba(99,102,241,0.12)", minHeight: "400px" }}
      >
        {/* Left: CTA */}
        <ResizablePanel defaultSize={60}>
          <div className="flex flex-col h-full items-center justify-center p-8 text-center gap-6">
            <div>
              <h1 className="font-display text-2xl sm:text-3xl font-bold text-white mb-3">
                AI-Powered Mock Interviews
              </h1>
              <p className="text-slate-400 text-sm sm:text-base leading-relaxed max-w-sm mx-auto">
                Upload your resume and get 10 personalized questions. Behavioral, technical, and coding — all tailored to your role and experience.
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

        {/* Right: Instructions */}
        <ResizablePanel defaultSize={40}>
          <div
            className="h-full p-6"
            style={{ borderLeft: "1px solid rgba(255,255,255,0.05)" }}
          >
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
            <p className="mt-8 text-sm font-semibold text-indigo-400 font-mainFont">
              Best of luck! 🚀
            </p>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>

      {/* Setup Dialog */}
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
            <DialogDescription className="text-slate-400">
              Customize your practice session
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-2">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-slate-300 text-sm">Role</Label>
                <Controller name="role" control={control} rules={{ required: true }}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className="bg-white/[0.04] border-white/10 text-white h-10">
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent style={{ background: "rgba(10,14,26,0.98)", border: "1px solid rgba(99,102,241,0.22)" }}>
                        {roles.map((r) => <SelectItem key={r} value={r} className="text-slate-300 focus:bg-indigo-500/10 focus:text-white">{r}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-300 text-sm">Level</Label>
                <Controller name="level" control={control} rules={{ required: true }}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className="bg-white/[0.04] border-white/10 text-white h-10">
                        <SelectValue placeholder="Select level" />
                      </SelectTrigger>
                      <SelectContent style={{ background: "rgba(10,14,26,0.98)", border: "1px solid rgba(99,102,241,0.22)" }}>
                        {levels.map((l) => <SelectItem key={l} value={l} className="text-slate-300 focus:bg-indigo-500/10 focus:text-white">{l}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-slate-300 text-sm">Years of experience</Label>
              <Controller name="experience" control={control} rules={{ required: true, min: 0 }}
                render={({ field }) => (
                  <Input type="number" placeholder="e.g. 3" {...field}
                    className="bg-white/[0.04] border-white/10 text-white placeholder:text-slate-600 h-10 focus:border-indigo-500/50" />
                )}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-slate-300 text-sm">Technologies</Label>
              <Controller name="technologies" control={control} defaultValue={[]}
                render={({ field }) => (
                  <Select onValueChange={(value) => {
                    const cur = field.value || [];
                    field.onChange(cur.includes(value) ? cur.filter((t) => t !== value) : [...cur, value]);
                  }}>
                    <SelectTrigger className="bg-white/[0.04] border-white/10 text-white min-h-10">
                      <SelectValue>{renderSelectedTechnologies(field.value)}</SelectValue>
                    </SelectTrigger>
                    <SelectContent style={{ background: "rgba(10,14,26,0.98)", border: "1px solid rgba(99,102,241,0.22)" }}>
                      {technologies.map((tech) => (
                        <SelectItem key={tech} value={tech} className="text-slate-300 focus:bg-indigo-500/10 focus:text-white">
                          <div className="flex items-center gap-2">
                            {tech}
                            {field.value?.includes(tech) && <CheckCircle2 size={12} className="text-indigo-400" />}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-slate-300 text-sm">Target company</Label>
              <Controller name="targetCompany" control={control} rules={{ required: true }}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger className="bg-white/[0.04] border-white/10 text-white h-10">
                      <SelectValue placeholder="Select company" />
                    </SelectTrigger>
                    <SelectContent style={{ background: "rgba(10,14,26,0.98)", border: "1px solid rgba(99,102,241,0.22)" }}>
                      {companies.map((c) => <SelectItem key={c} value={c} className="text-slate-300 focus:bg-indigo-500/10 focus:text-white">{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-slate-300 text-sm">Resume (PDF)</Label>
              <div className="flex items-center gap-3">
                <Input type="file" accept=".pdf" onChange={handleFileUpload} className="hidden" id="resume-upload" />
                <Label
                  htmlFor="resume-upload"
                  className="flex items-center gap-2 cursor-pointer text-sm text-slate-300 hover:text-white px-4 py-2 rounded-lg transition-colors"
                  style={{ background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.22)" }}
                >
                  <Upload size={14} />
                  {uploadedResume ? "Change file" : "Upload PDF"}
                </Label>
                {uploadedResume && (
                  <span className="text-xs text-indigo-400 flex items-center gap-1">
                    <CheckCircle2 size={12} /> {uploadedResume}
                  </span>
                )}
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-11 font-medium mt-2 text-white"
              style={{ background: "linear-gradient(135deg, #6366F1, #8B5CF6)" }}
            >
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
