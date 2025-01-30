import React, { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Box,
  TextField,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Button,
  Chip,
  OutlinedInput,
  Typography,
  Grid,
} from "@mui/material";
import { Upload } from "@mui/icons-material";
import pdfToText from "react-pdftotext";

const InterviewSetup = () => {
  const [uploadedResume, setUploadedResume] = useState("");
  const [resumeText, setResumeText] = useState("");
  const [loading, setLoading] = useState(false);

  function extractText(file) {
    setLoading(true);
    pdfToText(file)
      .then((text) => {
        setResumeText(text);
        console.log(text);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Failed to extract text from pdf");
        alert("Failed to extract text from PDF. Please try again.");
        setLoading(false);
      });
  }

  const {
    control,
    handleSubmit,
    setValue,
    getValues,
    formState: { errors },
  } = useForm({
    defaultValues: {
      role: "",
      level: "",
      experience: "",
      technologies: [],
      targetCompany: "",
      resume: "",
    },
  });

  const navigate = useNavigate();

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

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadedResume(file.name);
      setValue("resume", file);
      const fileType = file.name.split(".").pop().toLowerCase();
      if (fileType === "pdf") {
        extractText(file);
      } else {
        alert("Unsupported file format. Please upload a PDF or Word document.");
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
  - Resume Text: ${resumeText}  // Add extracted resume text

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
          state: { questions, interviewId },
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
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="100vh"
      px={3}
    >
      <Box maxWidth={800} width="100%" bgcolor="white" borderRadius={2} p={4}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={3}>
            {/* Role */}
            <Grid item xs={12} sm={6}>
              <Controller
                name="role"
                control={control}
                rules={{ required: "Role is required" }}
                render={({ field }) => (
                  <FormControl fullWidth>
                    <InputLabel id="role-label">Role</InputLabel>
                    <Select
                      {...field}
                      labelId="role-label"
                      label="Role"
                      error={!!errors.role}
                    >
                      {roles.map((role) => (
                        <MenuItem key={role} value={role}>
                          {role}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
              />
            </Grid>

            {/* Level */}
            <Grid item xs={12} sm={6}>
              <Controller
                name="level"
                control={control}
                rules={{ required: "Level is required" }}
                render={({ field }) => (
                  <FormControl fullWidth>
                    <InputLabel id="level-label">Level</InputLabel>
                    <Select
                      {...field}
                      labelId="level-label"
                      label="Level"
                      error={!!errors.level}
                    >
                      {levels.map((level) => (
                        <MenuItem key={level} value={level}>
                          {level}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
              />
            </Grid>

            {/* Experience */}
            <Grid item xs={12}>
              <Controller
                name="experience"
                control={control}
                rules={{
                  required: "Experience is required",
                  min: { value: 0, message: "Experience must be at least 0" },
                }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Experience (in years)"
                    type="number"
                    error={!!errors.experience}
                    helperText={errors.experience?.message}
                  />
                )}
              />
            </Grid>

            {/* Technologies */}
            <Grid item xs={12}>
              <Controller
                name="technologies"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth>
                    <InputLabel id="technologies-label">
                      Technologies
                    </InputLabel>
                    <Select
                      {...field}
                      labelId="technologies-label"
                      multiple
                      input={<OutlinedInput label="Technologies" />}
                      renderValue={(selected) => (
                        <Box display="flex" gap={1} flexWrap="wrap">
                          {selected.map((value) => (
                            <Chip key={value} label={value} />
                          ))}
                        </Box>
                      )}
                    >
                      {technologies.map((tech) => (
                        <MenuItem key={tech} value={tech}>
                          {tech}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
              />
            </Grid>

            {/* Target Company */}
            <Grid item xs={12}>
              <Controller
                name="targetCompany"
                control={control}
                rules={{ required: "Target company is required" }}
                render={({ field }) => (
                  <FormControl fullWidth>
                    <InputLabel id="company-label">Target Company</InputLabel>
                    <Select
                      {...field}
                      labelId="company-label"
                      label="Target Company"
                      error={!!errors.targetCompany}
                    >
                      {companies.map((company) => (
                        <MenuItem key={company} value={company}>
                          {company}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
              />
            </Grid>

            {/* Resume Upload */}
            <Grid item xs={12}>
              <div className="mb-4">
                <label className="block text-gray-600 mb-2">
                  Upload Resume
                </label>
                <Button
                  variant="contained"
                  component="label"
                  fullWidth
                  startIcon={<Upload />}
                  style={{
                    backgroundColor: "#4CAF50",
                    color: "white",
                  }}
                >
                  Upload Resume
                  <input
                    type="file"
                    hidden
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileUpload}
                  />
                </Button>
                {uploadedResume && (
                  <Typography
                    variant="body2"
                    color="textSecondary"
                    textAlign="center"
                    mt={1}
                  >
                    {uploadedResume}
                  </Typography>
                )}
              </div>
            </Grid>

            {/* Submit Button */}
            <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                fullWidth
                color="primary"
                disabled={loading}
              >
                {loading ? "Generating..." : "Generate Interview Questions"}
              </Button>
            </Grid>
          </Grid>
        </form>
      </Box>
    </Box>
  );
};

export default InterviewSetup;
