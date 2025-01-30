import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import axios from "axios";
import { Navigate, useNavigate } from "react-router-dom";

const InterviewHistory = () => {
  const [feedbackList, setFeedbackList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFeedback = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("User not authenticated");

        const response = await axios.post(
          `${import.meta.env.VITE_REACT_APP_BASE_URL}/api/user/get-feedback`,
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        console.log(response.data.feedbacks);
        setFeedbackList(response.data.feedbacks);
      } catch (err) {
        console.error("Error fetching feedback:", err);
        setError("Failed to load feedback. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchFeedback();
  }, []);

  const handleViewResults = (interview) => {
    console.log("Selected interview:", interview);
    navigate("/admin/view-interview", {
      state: { interview: interview },
    });
  };

  if (loading) {
    return <div className="p-6 text-white">Loading...</div>;
  }

  if (error) {
    return <div className="p-6 text-red-500">{error}</div>;
  }

  return (
    <div className="min-h-screen bg-black p-6 w-full">
      <h1 className="text-xl font-semibold text-white mb-6">
        Previous Interviews
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {feedbackList.map((interview) => (
          <Card
            key={interview._id}
            className="bg-black border-white cursor-pointer hover:border-blue-500 transition-colors"
            onClick={() => handleViewResults(interview)}
          >
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-white">
                {interview.role}
              </CardTitle>
              <p className="text-sm text-gray-400">{interview.company}</p>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-300">
                Date:{" "}
                {interview.createdAt
                  ? interview.createdAt
                      .split("T")[0]
                      .split("-")
                      .reverse()
                      .join("-")
                  : "N/A"}
              </p>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleViewResults(interview);
                }}
              >
                View Results
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default InterviewHistory;
