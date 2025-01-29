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
import { Separator } from "@/components/ui/separator";
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Atom } from "react-loading-indicators";
import { Button } from "@/components/ui/button";

function Feedback() {
  const location = useLocation();
  const navigate = useNavigate();
  const interview = location.state?.interview;
  const [loading, setLoading] = useState(false);
  const [selectedQuestionIndex, setSelectedQuestionIndex] = useState(0);
  const [questionScores, setQuestionScores] = useState({});
  const [totalScore, setTotalScore] = useState(0);

  // Guard clause for missing interview data
  if (!interview || !interview.feedbacks) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-black text-white">
        <p>No interview data found</p>
        <Button onClick={() => navigate(-1)} className="mt-4">
          Go Back
        </Button>
      </div>
    );
  }

  const { company, role, feedbacks } = interview;

  // Calculate total score
  useEffect(() => {
    const total = Object.values(questionScores).reduce(
      (sum, score) => sum + score,
      0
    );
    setTotalScore(total);
  }, [questionScores]);

  const handleScoreChange = (index, score) => {
    setQuestionScores((prev) => ({
      ...prev,
      [index]: Math.max(0, Math.min(10, score)), // Clamp between 0 and 10
    }));
  };

  const handleFinish = () => {
    navigate("/admin");
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
                  {feedbacks.map((feedback, index) => (
                    <SidebarMenuItem key={feedback._id}>
                      <SidebarMenuButton asChild>
                        <button
                          onClick={() => setSelectedQuestionIndex(index)}
                          className={`font-mainFont mt-1 text-lg cursor-pointer text-left w-full p-2 rounded ${
                            selectedQuestionIndex === index
                              ? "bg-blue-600"
                              : "hover:bg-blue-800"
                          }`}
                        >
                          Question {index + 1}
                        </button>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
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
              <div className="mb-4">
                <h1 className="text-lg font-bold">
                  Question {selectedQuestionIndex + 1}:
                </h1>
                <p className="text-lg mt-2">
                  {feedbacks[selectedQuestionIndex].question}
                </p>
              </div>

              <div className="flex flex-1 gap-6">
                <div className="flex-1 bg-black p-4 overflow-y-auto border-gray-400 border-2 h-[400px]">
                  <h2 className="text-xl font-semibold mb-2 text-center">
                    Your Solution
                  </h2>
                  <p>{feedbacks[selectedQuestionIndex].answer}</p>
                </div>

                <div className="flex-1 bg-black p-4 overflow-y-auto border-gray-400 border-2 h-[400px]">
                  <h2 className="text-xl font-semibold mb-2 text-center">
                    Feedback
                  </h2>
                  <p>{feedbacks[selectedQuestionIndex].feedback}</p>
                </div>
              </div>

              <div className="mt-auto pt-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">
                    Score for this Question:
                  </h3>
                  <input
                    type="number"
                    value={
                      questionScores[selectedQuestionIndex] ||
                      feedbacks[selectedQuestionIndex].score
                    }
                    onChange={(e) =>
                      handleScoreChange(
                        selectedQuestionIndex,
                        parseInt(e.target.value)
                      )
                    }
                    className="bg-black text-white border-gray-400 border p-2 w-16"
                    min="0"
                    max="10"
                  />
                </div>

                <div className="mt-4">
                  <h3 className="text-lg font-semibold">
                    Total Score: {totalScore}
                  </h3>
                  <Button onClick={handleFinish} className="mt-2">
                    Close Results
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-lg">
              Please select a question to view the details.
            </div>
          )}
        </div>
      </div>
    </SidebarProvider>
  );
}

export default Feedback;
