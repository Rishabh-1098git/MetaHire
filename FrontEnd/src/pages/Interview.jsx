import React, { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import CodeMirror from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { oneDark } from "@codemirror/theme-one-dark"; // Dark theme
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";

const MyInterviewPage = () => {
  const location = useLocation();
  const questions = location.state?.questions || [];

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(120); // 2 minutes
  const [isTimerRunning, setIsTimerRunning] = useState(true);
  const [answers, setAnswers] = useState(Array(questions.length).fill(""));
  const [codeSolutions, setCodeSolutions] = useState(
    Array(questions.length).fill("// Write your solution here...")
  );
  const [output, setOutput] = useState("");

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
      console.log("Answers:", answers);
      console.log("Code Solutions:", codeSolutions);
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
      updatedAnswers[currentQuestionIndex] =
        currentQuestionIndex >= questions.length - 2
          ? codeSolutions[currentQuestionIndex]
          : transcript.trim();
      return updatedAnswers;
    });
    resetTranscript();
  };

  const saveCodeSolution = (code) => {
    setCodeSolutions((prevSolutions) => {
      const updatedSolutions = [...prevSolutions];
      updatedSolutions[currentQuestionIndex] = code;
      return updatedSolutions;
    });
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

  const runCode = () => {
    try {
      const result = eval(codeSolutions[currentQuestionIndex]);
      setOutput(result === undefined ? "Code executed successfully!" : result);
    } catch (error) {
      setOutput(`Error: ${error.message}`);
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
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-gray-800 to-gray-900 text-white">
      {/* Container */}
      <div className="flex flex-col lg:flex-row items-center justify-between w-full max-w-6xl p-6 shadow-2xl bg-gray-950 rounded-xl">
        {/* Video Stream */}
        <div className="flex flex-col items-center w-full lg:w-1/2 mb-6 lg:mb-0">
          <div className="w-60 h-60 lg:w-72 lg:h-72 rounded-full overflow-hidden border-4 border-blue-600 shadow-xl">
            <video ref={videoRef} autoPlay muted className="w-full h-full" />
          </div>
          <p className="mt-4 text-lg text-gray-400 text-center">
            You are being recorded. Stay confident!
          </p>
        </div>

        {/* Question and Answer Section */}
        <div className="flex flex-col justify-between w-full lg:w-1/2 bg-gray-800 rounded-xl p-8 shadow-lg">
          <div className="mb-6">
            <p className="text-2xl font-bold text-blue-400">
              Question {currentQuestionIndex + 1}
            </p>
            <p className="text-lg mt-4 text-gray-300">{currentQuestion}</p>
          </div>

          {/* Code Editor for Last 2 Coding Problems */}
          {currentQuestionIndex >= questions.length - 2 ? (
            <div className="mb-6">
              <p className="text-lg font-semibold mb-3">Code Editor:</p>
              <CodeMirror
                value={codeSolutions[currentQuestionIndex]}
                height="300px"
                extensions={[javascript()]}
                theme={oneDark}
                onChange={(value) => saveCodeSolution(value)}
                className="rounded-lg border border-gray-700"
              />
              <button
                onClick={runCode}
                className="py-2 px-6 mt-4 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition duration-200 ease-in-out"
              >
                Run Code
              </button>
              <div className="mt-4 bg-gray-900 p-4 rounded-lg text-gray-200 border border-gray-700">
                <p className="font-semibold text-lg">Output:</p>
                <pre className="mt-2 whitespace-pre-wrap">{output}</pre>
              </div>
            </div>
          ) : (
            <div className="mb-6">
              <p className="text-lg font-semibold mb-3">Your Answer:</p>
              <div className="bg-gray-900 text-gray-200 p-4 rounded-lg h-28 overflow-y-auto border border-gray-700">
                {transcript || "Start speaking your answer..."}
              </div>
            </div>
          )}

          {/* Timer and Next Button */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-400">
              Time Left:{" "}
              <span className="text-blue-400">{formatTime(timeLeft)}</span>
            </p>
            <button
              onClick={moveToNextQuestion}
              className="py-2 px-8 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition duration-200 ease-in-out"
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
