import React, { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";

const MyInterviewPage = () => {
  const location = useLocation();
  const questions = location.state?.questions || [];

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(120); // 2 minutes = 120 seconds
  const [isTimerRunning, setIsTimerRunning] = useState(true);
  const [answers, setAnswers] = useState(Array(questions.length).fill(""));
  const videoRef = useRef(null);

  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
  } = useSpeechRecognition();

  const currentQuestion = questions[currentQuestionIndex];

  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      })
      .catch((error) => console.error("Error accessing media devices:", error));
  }, []);

  const moveToNextQuestion = () => {
    saveCurrentAnswer();
    SpeechRecognition.stopListening();

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prevIndex) => prevIndex + 1);
      resetTranscript();
      resetTimer();
    } else {
      alert("Interview finished! Great job!");
      setIsTimerRunning(false);
      console.log(answers);
    }
  };

  useEffect(() => {
    if (isTimerRunning && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);

      return () => clearInterval(timer);
    } else if (timeLeft === 0) {
      moveToNextQuestion();
    }
  }, [isTimerRunning, timeLeft]);

  useEffect(() => {
    if (currentQuestion) {
      speakQuestion(currentQuestion);
      SpeechRecognition.startListening({ continuous: true, language: "en-US" });
    } else {
      SpeechRecognition.stopListening();
    }
  }, [currentQuestion]);

  const saveCurrentAnswer = () => {
    setAnswers((prevAnswers) => {
      const updatedAnswers = [...prevAnswers];
      updatedAnswers[currentQuestionIndex] = transcript.trim();
      return updatedAnswers;
    });
    resetTranscript();
  };

  const resetTimer = () => {
    setTimeLeft(120);
    setIsTimerRunning(true);
  };

  const speakQuestion = (text) => {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(text);

      const voices = window.speechSynthesis.getVoices();
      console.log("Available Voices:", voices);

      utterance.lang = "en-US";
      utterance.rate = 1;
      utterance.pitch = 1;
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utterance);
    } else {
      console.warn("Text-to-Speech is not supported in this browser.");
    }
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  return (
    <div className="flex items-center justify-center h-screen w-screen bg-gray-900 text-white">
      {/* Container */}
      <div className="flex flex-col lg:flex-row items-center justify-between w-full max-w-5xl p-4 lg:p-8">
        {/* Video Stream */}
        <div className="flex flex-col items-center w-full lg:w-1/2 mb-6 lg:mb-0">
          <div className="w-56 h-56 lg:w-64 lg:h-64 rounded-full overflow-hidden border-4 border-blue-500 shadow-lg">
            <video ref={videoRef} autoPlay muted className="w-full h-full" />
          </div>
          <p className="mt-4 text-lg text-gray-400 text-center">
            You are being recorded. Stay confident!
          </p>
        </div>

        {/* Question and Answer Section */}
        <div className="flex flex-col justify-between w-full lg:w-1/2 bg-gray-800 rounded-lg p-6 shadow-lg h-80">
          <div className="mb-4">
            <p className="text-xl font-bold">
              Question {currentQuestionIndex + 1}:
            </p>
            <p className="text-lg mt-2 text-gray-300">{currentQuestion}</p>
          </div>
          <div className="mb-4">
            <p className="text-lg font-semibold mb-2">Your Answer:</p>
            <div className="bg-gray-900 text-gray-200 p-4 rounded-lg h-20 overflow-auto">
              {transcript || "Start speaking your answer..."}
            </div>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-400">
              Time Left:{" "}
              <span className="text-blue-400">{formatTime(timeLeft)}</span>
            </p>
            <button
              onClick={moveToNextQuestion}
              className="py-2 px-6 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition"
            >
              Next Question
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyInterviewPage;
