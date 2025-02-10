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
import { SyncLoader } from "react-spinners";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

function Feedback2() {
  const location = useLocation();
  const navigate = useNavigate();
  const questions = location.state?.questions || [];
  const answers = location.state?.answers || [];
  const role = location.state?.title || "";
  const company = location.state?.company || "";

  const [selectedQuestionIndex, setSelectedQuestionIndex] = useState(null);
  const [feedback, setFeedback] = useState([]);
  const [totalScore, setTotalScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [questionScores, setQuestionScores] = useState([]);
  const [loading1, setLoading1] = useState(false);

  useEffect(() => {
    const fetchFeedbackWithRetry = async (retries = 3) => {
      if (questions.length === 0 || answers.length === 0) return;

      setLoading(true);
      setError("");

      try {
        const response = await axios.post(
          `${import.meta.env.VITE_REACT_APP_BASE_URL}/api/gemini/feedback`,
          {
            questionsAndAnswers: questions.map((q, index) => ({
              question: q,
              answer: answers[index] || "No answer provided",
            })),
          }
        );

        const { feedback, totalScore } = response.data;

        // Validate response
        if (!feedback || !Array.isArray(feedback)) {
          throw new Error("Invalid feedback format");
        }

        setFeedback(feedback);
        setTotalScore(totalScore);

        const initialScores = feedback.map((f) => f.score || 0);
        setQuestionScores(initialScores);
        setSelectedQuestionIndex(0);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching feedback:", err);

        if (retries > 0) {
          console.log(`Retrying... (${retries} attempts left)`);
          await new Promise((resolve) => setTimeout(resolve, 2000));
          await fetchFeedbackWithRetry(retries - 1);
        } else {
          setError("Failed to generate feedback. Please try again later.");
          setLoading(false);
        }
      }
    };

    fetchFeedbackWithRetry();
  }, [questions, answers]);

  const handleFinish = async () => {
    try {
      setLoading1(true);
      const token = localStorage.getItem("token");
      if (!token) throw new Error("User not authenticated");

      const feedbackData = {
        feedback,
        totalScore,
        role,
        company,
        createdAt: new Date().toISOString(),
      };

      await axios.post(
        `${import.meta.env.VITE_REACT_APP_BASE_URL}/api/user/feedback`,
        feedbackData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      navigate("/admin");
    } catch (error) {
      console.error("Error submitting feedback:", error.message);
      setError("Failed to submit feedback");
    } finally {
      setLoading1(false);
    }
  };

  return (
    <SidebarProvider>
      <div className="flex h-screen overflow-hidden w-full font-mainFont">
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
              <SyncLoader color="#0d57dc" />
              <div className="text-lg mt-5">Generating Results...</div>
            </div>
          ) : error ? (
            <div className="flex flex-col justify-center items-center h-screen text-red-500">
              <p className="text-xl mb-4">{error}</p>
              <Button
                onClick={() => window.location.reload()}
                variant="destructive"
              >
                Try Again
              </Button>
            </div>
          ) : selectedQuestionIndex !== null ? (
            <div className="flex flex-col flex-grow">
              <div className="mb-4">
                <h1 className="text-lg font-bold">
                  {`Question ${selectedQuestionIndex + 1}:`}{" "}
                  {questions[selectedQuestionIndex]}
                </h1>
              </div>

              <div className="flex flex-1 gap-6">
                <div className="flex-1 bg-black p-4 overflow-y-auto border-gray-400 border-2 h-[400px]">
                  <h2 className="text-xl font-semibold mb-2 text-center">
                    Your Solution
                  </h2>
                  <p>{answers[selectedQuestionIndex]}</p>
                </div>

                <div className="flex-1 bg-black p-4 overflow-y-auto border-gray-400 border-2 h-[400px]">
                  <h2 className="text-xl font-semibold mb-2 text-center">
                    Feedback
                  </h2>
                  <p>{feedback[selectedQuestionIndex]?.feedback}</p>
                </div>
              </div>

              <div className="mt-auto">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">
                    Score for this Question:
                  </h3>
                  <span className="bg-black text-white border-gray-400 border p-2 w-16 text-center">
                    {questionScores[selectedQuestionIndex] || 0}
                  </span>
                </div>
              </div>

              <div className="mt-2">
                <h3 className="text-lg font-semibold">
                  Total Score: {totalScore}
                </h3>
                <Button
                  onClick={handleFinish}
                  className="mt-2"
                  disabled={loading1}
                  type="submit"
                >
                  {loading1 ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {"Submitting"}
                    </>
                  ) : (
                    "Finish Feedback"
                  )}
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
