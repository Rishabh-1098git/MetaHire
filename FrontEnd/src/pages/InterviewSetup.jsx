import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const InterviewSetup = () => {
  const [formData, setFormData] = useState({
    role: "",
    level: "",
    experience: "",
    technologies: [],
    targetCompany: "",
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleMultiSelectChange = (e) => {
    const selectedOptions = Array.from(e.target.selectedOptions).map(
      (option) => option.value
    );
    setFormData({ ...formData, technologies: selectedOptions });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const prompt = `Generate 10 interview questions for the following details in the format of a single string separated by '|':
  - Role: ${formData.role}
  - Level: ${formData.level}
  - Experience: ${formData.experience} years
  - Technologies: ${formData.technologies.join(", ")}
  - Target Company: ${formData.targetCompany}

Ensure the first 8 questions include a mix of behavioral and technical questions that are concise, relevant, and suitable for the specified role, level, and experience. The last 2 questions should be coding problems with the following structure:

1. Problem description: A concise explanation of the task.
2. Input: Clearly defined input format.
3. Output: Clearly defined output format.
4. Example:
   - Input: [example input]
   - Output: [expected output]

Return the output as a single string with each question separated by '|'.`;

      const { data } = await axios.post("http://localhost:5000/api/gemini", {
        prompt,
      });

      const questions = data.questions;

      if (questions && questions.length > 0) {
        navigate("/admin/interview-setup/interview", { state: { questions } }); // Navigate with questions
      } else {
        alert("No questions generated. Please try again.");
      }
    } catch (error) {
      console.error("Error fetching questions:", error);
      alert("Failed to fetch interview questions. Please try again.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <h1 className="text-4xl font-bold text-gray-800 mb-6">Interview Setup</h1>
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-lg shadow-lg w-96"
      >
        {/* Role Dropdown */}
        <div className="mb-4">
          <label className="block text-gray-600 mb-2">Role</label>
          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none"
            required
          >
            <option value="">Select a role</option>
            {roles.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>
        </div>

        {/* Level Dropdown */}
        <div className="mb-4">
          <label className="block text-gray-600 mb-2">Level</label>
          <select
            name="level"
            value={formData.level}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none"
            required
          >
            <option value="">Select a level</option>
            {levels.map((level) => (
              <option key={level} value={level}>
                {level}
              </option>
            ))}
          </select>
        </div>

        {/* Experience Input */}
        <div className="mb-4">
          <label className="block text-gray-600 mb-2">
            Experience (in years)
          </label>
          <input
            type="number"
            name="experience"
            value={formData.experience}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none"
            required
          />
        </div>

        {/* Technologies Multi-Select */}
        <div className="mb-4">
          <label className="block text-gray-600 mb-2">
            Technologies/Skills
          </label>
          <select
            name="technologies"
            multiple
            value={formData.technologies}
            onChange={handleMultiSelectChange}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none"
          >
            {technologies.map((tech) => (
              <option key={tech} value={tech}>
                {tech}
              </option>
            ))}
          </select>
          <p className="text-sm text-gray-500 mt-1">
            Hold Ctrl (Cmd on Mac) to select multiple options.
          </p>
        </div>

        {/* Company Dropdown */}
        <div className="mb-4">
          <label className="block text-gray-600 mb-2">Target Company</label>
          <select
            name="targetCompany"
            value={formData.targetCompany}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none"
            required
          >
            <option value="">Select a company</option>
            {companies.map((company) => (
              <option key={company} value={company}>
                {company}
              </option>
            ))}
          </select>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
        >
          Give Interview
        </button>
      </form>
    </div>
  );
};

export default InterviewSetup;
