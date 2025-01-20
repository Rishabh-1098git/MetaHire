import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Container,
  Typography,
  Box,
  CircularProgress,
  Alert,
  Button,
  Divider,
  Tooltip,
  Fab,
} from "@mui/material";
import { Add, Error } from "@mui/icons-material";
import { styled } from "@mui/system";
import { Carousel } from "react-responsive-carousel"; // For the slider effect
import "react-responsive-carousel/lib/styles/carousel.min.css"; // Carousel styles

// Styled components with custom font-family
const FeedbackHeading = styled(Typography)({
  fontFamily: "'Poppins', sans-serif",
  fontWeight: "600",
  color: "#3f51b5",
  fontSize: "2rem",
});

const FeedbackText = styled(Typography)({
  fontFamily: "'Poppins', sans-serif",
  color: "#212121",
  fontSize: "1rem",
});

const ThankYouText = styled(Typography)({
  fontFamily: "'Poppins', sans-serif",
  color: "gray",
  fontSize: "1.3rem",
  fontWeight: "600",
  marginBottom: "20px",
});

// Define a CSS keyframe for blinking text
const BlinkingText = styled(Typography)({
  fontFamily: "'Poppins', sans-serif",
  fontSize: "1.2rem",
  color: "gray",
  fontWeight: "600",
  animation: "blinkingText 1.5s infinite step-start", // Animation added
  "@keyframes blinkingText": {
    "0%": {
      opacity: 1,
    },
    "50%": {
      opacity: 0,
    },
    "100%": {
      opacity: 1,
    },
  },
});

function Feedback() {
  const location = useLocation();
  const navigate = useNavigate();
  const questions = location.state?.questions || [];
  const answers = location.state?.answers || [];

  const [feedback, setFeedback] = useState([]);
  const [totalScore, setTotalScore] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeStep, setActiveStep] = useState(0); // To track slider step

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
      } catch (err) {
        console.error("Error fetching feedback:", err);
        setError("Failed to load feedback. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchFeedback();
  }, [questions, answers]);

  const handleNext = () => {
    if (activeStep < feedback.length - 1) {
      setActiveStep(activeStep + 1);
    }
  };

  const handleBack = () => {
    if (activeStep > 0) {
      setActiveStep(activeStep - 1);
    }
  };

  const handleFinish = async () => {
    navigate("/admin");
    console.log(feedback);
  };

  return (
    <Container maxWidth="lg" sx={{ paddingTop: 4, paddingBottom: 4 }}>
      {/* Feedback Heading */}
      <FeedbackHeading variant="h4" gutterBottom>
        Thank you for completing your interview!
      </FeedbackHeading>

      {/* Loading Spinner */}
      {loading && (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "60vh",
            flexDirection: "column",
          }}
        >
          <CircularProgress size={60} sx={{ marginBottom: 2 }} />
          {/* Apply blinking effect on the loader text */}
          <BlinkingText variant="h6">Generating your feedback...</BlinkingText>
        </Box>
      )}

      {/* Error Message */}
      {error && (
        <Alert severity="error" icon={<Error />} sx={{ marginBottom: 3 }}>
          {error}
        </Alert>
      )}

      {/* Feedback Section */}
      {!loading && feedback.length > 0 && (
        <>
          <ThankYouText>Here's a summary of your performance:</ThankYouText>

          {/* Score Section */}
          <Box sx={{ marginBottom: 4, textAlign: "center" }}>
            <ThankYouText>Overall Score:</ThankYouText>
            <Typography variant="h5" color="primary" fontWeight="bold">
              {totalScore} / 100
            </Typography>
            <Divider sx={{ marginY: 2 }} />
          </Box>

          {/* Feedback Carousel */}
          <Carousel
            selectedItem={activeStep}
            onChange={setActiveStep}
            showArrows={false}
            showThumbs={false}
            showStatus={false}
            infiniteLoop
          >
            {feedback.map((item, index) => (
              <div
                key={index}
                className="bg-slate-200 shadow-lg rounded-lg p-6 my-4 font-mono"
              >
                <div className="flex flex-col space-y-4">
                  {/* Question Text */}
                  <p className="text-lg text-gray-900 font-medium">
                    <strong>Question {index + 1}: </strong> {item.question}
                  </p>

                  {/* Answer Text */}
                  <p className="text-lg text-gray-900 font-medium">
                    <strong>Your Answer:</strong> {item.answer}
                  </p>

                  {/* Score */}
                  <p className="text-xl text-green-800 font-semibold">
                    <strong>Score:</strong> {item.score} / 10
                  </p>

                  {/* Feedback Text */}
                  <p className="text-lg text-slate-800 font-medium">
                    <strong>Feedback:</strong> {item.feedback}
                  </p>
                </div>
              </div>
            ))}
          </Carousel>

          {/* Navigation Buttons */}
          <Box sx={{ display: "flex", justifyContent: "space-between", mt: 4 }}>
            <Button
              variant="outlined"
              onClick={handleBack}
              disabled={activeStep === 0}
            >
              Back
            </Button>
            {activeStep === feedback.length - 1 ? (
              <Box sx={{ textAlign: "center" }}>
                <Button
                  variant="contained"
                  color="secondary"
                  onClick={handleFinish}
                >
                  Finish and Save Feedback
                </Button>
              </Box>
            ) : (
              <Button
                variant="contained"
                color="primary"
                onClick={handleNext}
                disabled={activeStep === feedback.length - 1}
              >
                Next
              </Button>
            )}
          </Box>
        </>
      )}

      {/* No Feedback Available Message */}
      {!loading && feedback.length === 0 && !error && (
        <Alert severity="info" sx={{ marginTop: 4 }}>
          No feedback available. Please provide valid questions and answers.
        </Alert>
      )}
    </Container>
  );
}

export default Feedback;
