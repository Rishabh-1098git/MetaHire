import React from "react";
import { useLocation } from "react-router-dom";

function Feedback() {
  const location = useLocation();
  const questions = location.state?.questions || [];
  const answers = location.state?.answers || [];

  console.log("Questions:", questions);
  console.log("Answers:", answers);

  // Calculate total score based on answers (You can add your logic here)
  return (
    <div>
      <h1>Interview Feedback</h1>
      <div>
        <h2>Your Answers:</h2>
        <ul>
          {questions.map((question, index) => (
            <li key={index}>
              <strong>{question}</strong>: {answers[index] || "No answer"}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default Feedback;
