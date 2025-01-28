import { SidebarProvider } from "@/components/ui/sidebar";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Separator } from "../components/ui/separator";
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { Atom } from "react-loading-indicators";
import { Button } from "@/components/ui/button";
import { jwtDecode } from "jwt-decode";
function Feedback2() {
  const location = useLocation();
  const navigate = useNavigate();
  const questions = location.state?.questions || [];
  const answers = location.state?.answers || [];
  const role = location.state?.title || "";
  const company = location.state?.company || "";
  const interviewId = location.pathname.split("/").pop();

  const [selectedQuestionIndex, setSelectedQuestionIndex] = useState(null); // Index of the selected question
  const [feedback, setFeedback] = useState([]);
  const [totalScore, setTotalScore] = useState(0);
  const [loading, setLoading] = useState(true); // Start with loading state
  const [error, setError] = useState("");
  const [questionScores, setQuestionScores] = useState([]);

  useEffect(() => {
    const fetchFeedback = async () => {
      if (questions.length === 0 || answers.length === 0) return;

      setLoading(true);
      setError("");

      try {
        const response = await axios.post(
          "http://localhost:5000/api/gemini/feedback",
          {
            questionsAndAnswers: questions.map((q, index) => ({
              question: q,
              answer: answers[index] || "No answer provided",
            })),
          }
        );

        const { feedback, totalScore } = response.data;
        setFeedback(feedback);
        setTotalScore(totalScore);

        // Initialize individual question scores
        const initialScores = feedback.map((f) => f.score || 0);
        setQuestionScores(initialScores);

        // Set the first question as the selected question
        setSelectedQuestionIndex(0); // Default to first question
      } catch (err) {
        console.error("Error fetching feedback:", err);
        setError("Failed to load feedback. Please try again.");
      } finally {
        setLoading(false); // Stop loading once data is fetched
      }
    };

    fetchFeedback();
  }, [questions, answers]);

  const handleScoreChange = (index, newScore) => {
    const updatedScores = [...questionScores];
    updatedScores[index] = newScore;
    setQuestionScores(updatedScores);

    const newTotalScore = updatedScores.reduce((acc, score) => acc + score, 0);
    setTotalScore(newTotalScore);
  };

  const handleFinish = async () => {
    try {
      // Get token from localStorage
      const token = localStorage.getItem("token");
      if (!token) throw new Error("User not authenticated");

      // Decode token to get userId
      const feedbackData = {
        feedback,
        totalScore,
        role,
        company,
        createdAt: new Date().toISOString(),
      };

      // Send feedback to the backend
      await axios.post(
        "http://localhost:5000/api/user/feedback",
        feedbackData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Navigate to a confirmation page
      navigate("/admin");
    } catch (error) {
      console.error("Error submitting feedback:", error.message);
    }
  };

  return (
    <SidebarProvider>
      <div className="flex h-screen overflow-hidden w-full">
        <Sidebar className="w-64 bg-black text-white">
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel className="font-mainFont text-xl">
                {role}
              </SidebarGroupLabel>
              <SidebarGroupLabel className="font-mainFont text-lg mb-2">
                {company}
              </SidebarGroupLabel>
              <Separator />
              <SidebarGroupContent>
                <SidebarMenu>
                  {questions.map((_, index) => (
                    <SidebarMenuItem key={index}>
                      <SidebarMenuButton asChild>
                        <button
                          onClick={() => setSelectedQuestionIndex(index)}
                          className="font-mainFont mt-1 text-lg cursor-pointer text-left w-full"
                        >
                          Question {index + 1}
                        </button>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
            <div className="mt-auto"></div>
          </SidebarContent>
        </Sidebar>

        <div className="flex-1 flex flex-col bg-black text-gray-300 p-4 overflow-auto w-full font-mainFont">
          {loading ? (
            <div className="flex flex-col justify-center items-center h-screen">
              <Atom color="#0d57dc" size="medium" text="" textColor="" />
              <div className="text-lg">Generating Results...</div>
            </div>
          ) : selectedQuestionIndex !== null ? (
            <div className="flex flex-col flex-grow">
              {/* Display selected question details */}
              <div className="mb-4">
                <h1 className="text-lg font-bold">
                  {`Question ${selectedQuestionIndex + 1}:`}{" "}
                  {questions[selectedQuestionIndex]}
                </h1>
                {/* <p className="text-lg mt-2">{answers[selectedQuestionIndex]}</p> */}
              </div>

              <div className="flex flex-1 gap-6">
                <div className="flex-1 bg-black p-4 overflow-y-auto border-gray-400 border-2 h-[400px]">
                  <h2 className="text-xl font-semibold mb-2 text-center">
                    Your Solution
                  </h2>
                  <p>{feedback[selectedQuestionIndex]?.answer}</p>
                </div>

                <div className="flex-1 bg-black p-4 overflow-y-auto border-gray-400 border-2 h-[400px]">
                  <h2 className="text-xl font-semibold mb-2 text-center">
                    Feedback
                  </h2>
                  <p>{feedback[selectedQuestionIndex]?.feedback}</p>
                </div>
              </div>

              {/* Fixed bottom section for score and button */}
              <div className="mt-auto">
                <div className="flex justify-between">
                  <h3 className="text-lg font-semibold">
                    Score for this Question:
                  </h3>
                  <input
                    type="number"
                    value={questionScores[selectedQuestionIndex] || 0}
                    onChange={(e) =>
                      handleScoreChange(
                        selectedQuestionIndex,
                        parseInt(e.target.value)
                      )
                    }
                    className="bg-black text-white border-gray-400 border p-2 w-16"
                    min="0"
                  />
                </div>
              </div>

              <div className="mt-2 ">
                <h3 className="text-lg font-semibold">
                  Total Score: {totalScore}
                </h3>
                <Button onClick={handleFinish} className="mt-2">
                  Finish Feedback
                </Button>
              </div>
            </div>
          ) : (
            <div>Please select a question to view the details.</div>
          )}
        </div>
      </div>
    </SidebarProvider>
  );
}

export default Feedback2;
