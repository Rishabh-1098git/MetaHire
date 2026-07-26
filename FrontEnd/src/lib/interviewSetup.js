const COMMON_SKILLS = [
  "javascript",
  "typescript",
  "react",
  "node",
  "node.js",
  "express",
  "python",
  "java",
  "c++",
  "c#",
  "sql",
  "postgres",
  "mysql",
  "mongodb",
  "aws",
  "docker",
  "kubernetes",
  "azure",
  "git",
  "rest api",
  "api",
  "microservices",
  "linux",
  "system design",
  "testing",
  "jest",
  "redux",
  "nextjs",
  "tailwind",
  "html",
  "css",
  "machine learning",
  "data analysis",
  "spark",
  "hadoop",
  "pytorch",
  "tensorflow",
  "flask",
  "django",
  "spring",
  "agile",
  "scrum",
  "product management",
  "ui/ux",
  "figma",
  "design systems",
];

function normalizeText(value = "") {
  return value.toLowerCase().replace(/[^a-z0-9+#.\s]/g, " ").replace(/\s+/g, " ").trim();
}

function extractYearsOfExperience(text = "") {
  const patterns = [
    /(\d+)\s*\+?\s*years?\s*(?:of\s+experience)?/i,
    /(\d+)\+?\s*yoe/i,
    /experience\s*(?:for|of)?\s*(\d+)\s*years?/i,
    /worked\s+for\s+(\d+)\s+years?/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      return Number(match[1]);
    }
  }

  return null;
}

export function extractResumeInsights(resumeText = "", role = "", jobDescription = "") {
  const combinedText = normalizeText(`${resumeText} ${jobDescription} ${role}`);
  const detectedSkills = COMMON_SKILLS.filter((skill) => combinedText.includes(normalizeText(skill)));
  const experienceYears = extractYearsOfExperience(resumeText);

  return {
    skills: detectedSkills.slice(0, 8),
    experienceYears,
    summary:
      experienceYears !== null
        ? `${experienceYears}+ years of experience inferred from the resume.`
        : "Experience could not be explicitly inferred from the resume text, so the questions will be based on the resume content and role context.",
  };
}

export function buildInterviewPrompt({ role, jobDescription, resumeText, insights }) {
  const skillsText = insights?.skills?.length ? insights.skills.join(", ") : "skills inferred from the resume";
  const experienceLine = insights?.experienceYears !== null ? `${insights.experienceYears} years` : "experience inferred from the resume content and role context";

  return `Generate 10 realistic interview questions for a candidate targeting the following role.

Role: ${role}
Job Description: ${jobDescription}
Resume Text: ${resumeText}
Inferred Skills: ${skillsText}
Inferred Experience: ${experienceLine}

Requirements:
- Make the first 8 questions a mix of behavioral, technical, and resume-based questions tailored to the role, the job description, and the candidate's experience.
- Use the resume details and inferred skills to create grounded questions that feel specific and relevant.
- Do not ask for manual experience input; infer the experience level from the resume content only.
- Make the last 2 questions coding or problem-solving prompts suitable for the role and experience level.
- Return the output as a single string with each question separated by '|'.`;
}
