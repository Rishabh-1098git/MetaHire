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
    <div className="flex flex-col h-screen bg-gray-800 text-white">
      {/* Upper Section: Video and Interview Description */}
      <div className="flex items-center justify-between px-8 py-6 bg-[#212121]">
        <div className="w-56 h-32   overflow-hidden shadow-xl rounded-md">
          <video
            ref={videoRef}
            autoPlay
            muted
            className="w-56 h-32 object-cover"
          />
        </div>
        <div className="ml-6 text-center text-gray-300">
          <h2 className="text-2xl font-semibold font-mono text-slate-200 mb-2">
            Interview in Progress
          </h2>
          <p className="text-lg font-mono">
            Answer the questions with your best abilities. Good luck!
          </p>
        </div>
        <div className="text-2xl font-semibold font-mono text-white">
          Time Left:{" "}
          <span className="text-red-500">{formatTime(timeLeft)}</span>
        </div>
      </div>

      {/* Lower Section: Question and Answer / Code Editor */}
      <div className="flex h-full">
        {/* Question Section */}
        <div className="flex flex-col justify-between items-center w-1/2 px-8 py-6 bg-white overflow-y-auto">
          <p className="text-2xl font-bold text-black text-center">
            Question {currentQuestionIndex + 1}
          </p>
          <p className="text-lg mt-4 text-black font-mono text-center bg-[#E0E0E0] shadow-xl">
            {currentQuestion}
          </p>

          {/* Fixed Next Question Button */}
          <div className="mt-auto ">
            <button
              onClick={moveToNextQuestion}
              className="py-2 px-8 mt-4 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-teal-400 focus:ring-opacity-50 transition duration-300 ease-in-out"
            >
              Next Question
            </button>
          </div>
        </div>

        {/* Answer or Code Editor Section */}
        <div className="w-1/2 bg-[#424242] p-8 flex flex-col justify-between">
          {currentQuestionIndex >= questions.length - 2 ? (
            <div>
              <CodeMirror
                value={codeSolutions[currentQuestionIndex]}
                height="330px"
                extensions={[javascript()]}
                theme={oneDark}
                onChange={(value) => saveCodeSolution(value)}
                className="rounded-lg border border-gray-700 text-xl"
              />
              <button
                onClick={runCode}
                className="py-2 px-6 mt-4 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition duration-200 ease-in-out"
              >
                Run Code
              </button>
              <div className="mt-4 bg-[#212121] p-4 rounded-lg text-gray-200 border border-gray-700">
                <p className="font-semibold text-lg">Output:</p>
                <pre className="mt-2 whitespace-pre-wrap">{output}</pre>
              </div>
            </div>
          ) : (
            <div className="mb-6">
              <p className="text-lg font-semibold text-white mb-3">
                Your Answer:
              </p>
              <div className="bg-[#212121] text-gray-200 font-mono text-xl p-4 rounded-lg h-96 overflow-y-auto ">
                {transcript || "Start speaking your answer..."}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyInterviewPage;
