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
} from "@mui/material";
import { Separator } from "../components/ui/separator";
import { Error } from "@mui/icons-material";
import { styled } from "@mui/system";
import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css";

// Styled components
const FeedbackHeading = styled(Typography)({
  color: "#e0e0e0",
  fontWeight: "bold",
  textAlign: "center",
  marginBottom: 20,
  fontSize: "2.5rem",
});

const BlinkingText = styled(Typography)({
  fontSize: "1.2rem",
  color: "#9ca3af",
  fontWeight: "600",
  animation: "blinkingText 1.5s infinite step-start",
  "@keyframes blinkingText": {
    "0%": { opacity: 1 },
    "50%": { opacity: 0 },
    "100%": { opacity: 1 },
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
  const [activeStep, setActiveStep] = useState(0);

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
    <Container
      maxWidth="full"
      sx={{
        paddingTop: 4,
        paddingBottom: 4,
        backgroundColor: "black",
        minHeight: "100vh",
      }}
    >
      <FeedbackHeading variant="h4" gutterBottom>
        Interview Performance Insights
      </FeedbackHeading>
      <Separator />
      {loading && (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "60vh",
            flexDirection: "column",
            backgroundColor: "black",
            borderRadius: 2,
          }}
        >
          <CircularProgress
            size={60}
            sx={{
              marginBottom: 2,
              color: "#9ca3af",
            }}
          />
          <BlinkingText variant="h6">
            Analyzing your performance...
          </BlinkingText>
        </Box>
      )}

      {error && (
        <Alert
          severity="error"
          icon={<Error />}
          sx={{
            marginBottom: 3,
            backgroundColor: "#282828",
            color: "#f8fafc",
          }}
        >
          {error}
        </Alert>
      )}

      {!loading && feedback.length > 0 && (
        <>
          <Box
            sx={{
              marginBottom: 4,
              textAlign: "center",
              backgroundColor: "black",
              padding: 3,
              borderRadius: 2,
            }}
          >
            <Typography
              variant="h5"
              sx={{
                color: "#28C244",
                fontWeight: "bold",
              }}
            >
              Overall Score: {totalScore} / 100
            </Typography>
          </Box>

          <Carousel
            selectedItem={activeStep}
            onChange={setActiveStep}
            showArrows={false}
            showThumbs={false}
            showStatus={false}
            showIndicators={false}
            infiniteLoop
          >
            {feedback.map((item, index) => (
              <Box
                key={index}
                sx={{
                  backgroundColor: "black",
                  boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                  borderRadius: 2,
                  padding: 3,
                  margin: "14px 0",
                  display: "flex",
                  flexDirection: { xs: "column", sm: "row" }, // Stack on small screens, side-by-side otherwise
                  gap: 4,
                }}
              >
                {/* Left Side: User's Answer */}
                <Box
                  sx={{
                    flex: 1,
                    backgroundColor: "#1e293b",
                    borderRadius: 2,
                    padding: 3,
                  }}
                >
                  <Typography
                    variant="h6"
                    sx={{
                      fontSize: "1.3rem",
                      color: "white",
                      fontWeight: 500,
                      marginBottom: 2,
                    }}
                  >
                    Question {index + 1}: {item.question}
                  </Typography>
                  <Separator />
                  <Typography
                    variant="body1"
                    sx={{
                      fontSize: "1.3rem",
                      color: "white",
                      marginTop: 2,
                    }}
                  >
                    Your Answer:
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: "1.2rem",
                      color: "#9ca3af",
                      marginTop: 1,
                      fontWeight: 400,
                    }}
                  >
                    {item.answer}
                  </Typography>
                </Box>

                {/* Right Side: Feedback */}
                <Box
                  sx={{
                    flex: 1,
                    backgroundColor: "#0f172a",
                    borderRadius: 2,
                    padding: 3,
                  }}
                >
                  <Typography
                    variant="body1"
                    sx={{
                      fontSize: "1.3rem",
                      color: "#FFA116",
                      marginBottom: 2,
                    }}
                  >
                    Feedback:
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: "1.2rem",
                      color: "#e0e0e0",
                      fontWeight: 400,
                    }}
                  >
                    {item.feedback}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Carousel>

          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              mt: 4,
              gap: 2,
            }}
          >
            <Button
              variant="outlined"
              onClick={handleBack}
              disabled={activeStep === 0}
              sx={{
                borderColor: "#64748b",
                color: "#64748b",
                "&:hover": {
                  backgroundColor: "#475569",
                },
                "&.Mui-disabled": {
                  borderColor: "#334155",
                  color: "#334155",
                },
              }}
            >
              Back
            </Button>
            {activeStep === feedback.length - 1 ? (
              <Button
                variant="contained"
                onClick={handleFinish}
                sx={{
                  backgroundColor: "#64748b",
                  "&:hover": {
                    backgroundColor: "#475569",
                  },
                }}
              >
                Finish and Save Feedback
              </Button>
            ) : (
              <Button
                variant="contained"
                onClick={handleNext}
                sx={{
                  backgroundColor: "#64748b",
                  "&:hover": {
                    backgroundColor: "#475569",
                  },
                }}
              >
                Next
              </Button>
            )}
          </Box>
        </>
      )}

      {!loading && feedback.length === 0 && !error && (
        <Alert
          severity="info"
          sx={{
            marginTop: 4,
            backgroundColor: "#475569",
            color: "#e0e0e0",
          }}
        >
          No feedback available. Please provide valid questions and answers.
        </Alert>
      )}
    </Container>
  );
}

export default Feedback;
