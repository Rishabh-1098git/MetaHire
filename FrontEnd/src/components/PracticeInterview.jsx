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
import { Loader2, Upload, ArrowRight } from "lucide-react";
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

  const roles = [
    "Software Engineer",
    "Data Scientist",
    "Product Manager",
    "DevOps Engineer",
    "UI/UX Designer",
  ];

  const levels = ["Fresher", "Junior", "Mid-Level", "Senior", "Lead"];

  const companies = [
    "Google",
    "Microsoft",
    "Amazon",
    "Meta",
    "Apple",
    "Netflix",
  ];

  const technologies = [
    "JavaScript",
    "Python",
    "Java",
    "React",
    "Node.js",
    "SQL",
    "AWS",
    "Docker",
    "Kubernetes",
  ];

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      role: "",
      level: "",
      experience: "",
      technologies: [],
      targetCompany: "",
      resume: null,
    },
  });

  const navigate = useNavigate();

  const renderSelectedTechnologies = (selected) => {
    if (!selected || selected.length === 0) return "Select Technologies";
    return (
      <div className="flex flex-wrap gap-1">
        {selected.map((tech) => (
          <Badge key={tech} variant="secondary" className="mr-1">
            {tech}
          </Badge>
        ))}
      </div>
    );
  };

  function extractText(file) {
    setLoading(true);
    pdfToText(file)
      .then((text) => {
        setResumeText(text);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Failed to extract text from pdf");
        alert("Failed to extract text from PDF. Please try again.");
        setLoading(false);
      });
  }

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadedResume(file.name);
      setValue("resume", file);
      const fileType = file.name.split(".").pop().toLowerCase();
      if (fileType === "pdf") {
        extractText(file);
      } else {
        alert("Unsupported file format. Please upload a PDF.");
      }
    }
  };

  const onSubmit = async (data) => {
    if (!resumeText) {
      alert("Please upload and extract resume text before proceeding.");
      return;
    }

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
          state: {
            questions,
            interviewId,
            title: data.role,
            company: data.targetCompany,
          },
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

  return (
    <>
      <ResizablePanelGroup
        direction="horizontal"
        className="max-w-full rounded-lg border md:min-w-[450px] mb-10"
      >
        <ResizablePanel defaultSize={70}>
          <div className="flex flex-col h-full items-center justify-center p-6">
            <h1 className="font-mainFont text-3xl my-5 text-center">
              Create Customizable Interview sessions
            </h1>
            <p className="font-mainFont text-xl my-5 text-center">
              Generate customizable, concise, and relevant interview questions
              for any role, level, and experience
            </p>
            <button
              className="bg-black shadow-lg shadow-blue-900 text-blue-200 font-bold py-3 px-6 rounded-full hover:shadow-blue-950 transition-all bg-opacity-60 mt-10 border-blue-200 border-2"
              onClick={() => setIsModalOpen(true)}
            >
              <div className="flex items-center justify-center position-relative">
                Practice Interview <ArrowRight size={24} className="ml-2" />
              </div>
            </button>
          </div>
        </ResizablePanel>
        <ResizableHandle />
        <ResizablePanel defaultSize={30}>
          <ResizablePanelGroup direction="vertical">
            <ResizablePanel defaultSize={7}>
              <div className="flex h-full items-center justify-center p-6">
                <h1 className="font-mainFont text-xl my-5 text-center">
                  Instructions
                </h1>
              </div>
            </ResizablePanel>
            <ResizableHandle />
            <ResizablePanel defaultSize={75}>
              <div className="flex flex-col h-full items-center justify-center p-6 font-mainFont text-white">
                <ul className="space-y-4 text-md text-gray-300">
                  <li>🎧 Wear headphones to ensure clear audio quality.</li>
                  <li>🔇 Sit in a quiet and distraction-free environment.</li>
                  <li>
                    🗣️ Speak your answers only after the interviewer finishes
                    asking the question.
                  </li>
                  <li>
                    📝 You will be asked{" "}
                    <strong className="text-sd-medium">
                      8 behavioral questions
                    </strong>
                    . Answer each question within{" "}
                    <strong className="text-sd-medium">2 minutes</strong>.
                  </li>
                  <li>
                    💻 There will also be{" "}
                    <strong className="text-sd-medium">
                      2 coding problems
                    </strong>
                    . Solve each within{" "}
                    <strong className="text-sd-medium">5 minutes</strong> using
                    the provided code editor.
                  </li>
                  <li>
                    📶 Ensure you have a stable internet connection throughout
                    the session.
                  </li>
                </ul>
                <p className="mt-8 text-xl font-semibold text-sd-medium font-mainFont">
                  Best of luck! 🚀
                </p>
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        </ResizablePanel>
      </ResizablePanelGroup>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl bg-black bg-opacity-90 border-white">
          <DialogHeader>
            <DialogTitle>Interview Setup</DialogTitle>
            <DialogDescription>
              Customize your practice interview
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              {/* Role */}
              <div className="space-y-2">
                <Label>Role</Label>
                <Controller
                  name="role"
                  control={control}
                  rules={{ required: "Role is required" }}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className="bg-black">
                        <SelectValue placeholder="Select Role" />
                      </SelectTrigger>
                      <SelectContent className="bg-black">
                        {roles.map((role) => (
                          <SelectItem key={role} value={role}>
                            {role}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              {/* Level */}
              <div className="space-y-2">
                <Label>Level</Label>
                <Controller
                  name="level"
                  control={control}
                  rules={{ required: "Level is required" }}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className="bg-black">
                        <SelectValue placeholder="Select Level" />
                      </SelectTrigger>
                      <SelectContent className="bg-black">
                        {levels.map((level) => (
                          <SelectItem key={level} value={level}>
                            {level}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            </div>

            {/* Experience */}
            <div className="space-y-2">
              <Label>Experience (years)</Label>
              <Controller
                name="experience"
                control={control}
                rules={{
                  required: "Experience is required",
                  min: { value: 0, message: "Experience must be at least 0" },
                }}
                render={({ field }) => (
                  <Input
                    className="bg-black"
                    type="number"
                    placeholder="Enter years of experience"
                    {...field}
                  />
                )}
              />
            </div>

            {/* Technologies */}
            <div className="space-y-2">
              <Label>Technologies</Label>
              <Controller
                name="technologies"
                control={control}
                defaultValue={[]}
                render={({ field }) => (
                  <Select
                    onValueChange={(value) => {
                      const currentTechs = field.value || [];
                      if (currentTechs.includes(value)) {
                        field.onChange(
                          currentTechs.filter((tech) => tech !== value)
                        );
                      } else {
                        field.onChange([...currentTechs, value]);
                      }
                    }}
                  >
                    <SelectTrigger className="bg-black">
                      <SelectValue>
                        {renderSelectedTechnologies(field.value)}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent className="bg-black">
                      {technologies.map((tech) => (
                        <SelectItem key={tech} value={tech}>
                          <div className="flex items-center">
                            <span>{tech}</span>
                            {field.value?.includes(tech) && (
                              <span className="ml-2">✓</span>
                            )}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            {/* Target Company */}
            <div className="space-y-2">
              <Label>Target Company</Label>
              <Controller
                name="targetCompany"
                control={control}
                rules={{ required: "Target company is required" }}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger className="bg-black">
                      <SelectValue placeholder="Select Company" />
                    </SelectTrigger>
                    <SelectContent className="bg-black">
                      {companies.map((company) => (
                        <SelectItem key={company} value={company}>
                          {company}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            {/* Resume Upload */}
            <div className="space-y-2">
              <Label>Upload Resume</Label>
              <div className="flex items-center space-x-2">
                <Input
                  type="file"
                  accept=".pdf"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="resume-upload"
                />
                <Label
                  htmlFor="resume-upload"
                  className="flex items-center cursor-pointer bg-secondary text-secondary-foreground hover:bg-secondary/80 p-2 rounded-md"
                >
                  <Upload className="mr-2" /> Upload PDF
                </Label>
                {uploadedResume && (
                  <span className="text-sm text-muted-foreground">
                    {uploadedResume}
                  </span>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
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
