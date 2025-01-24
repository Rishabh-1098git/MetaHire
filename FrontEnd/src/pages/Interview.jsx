import React, { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import CodeMirror from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { oneDark } from "@codemirror/theme-one-dark"; // Dark theme
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
const MyInterviewPage = () => {
  const location = useLocation();
  const questions = location.state?.questions || [];
  const interviewId = location.state?.interviewId;
  const title = location.state?.title;
  const role = location.state?.role;

  const navigate = useNavigate();

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(120); // 2 minutes
  const [isTimerRunning, setIsTimerRunning] = useState(true);
  const [answers, setAnswers] = useState(Array(questions.length).fill(""));
  const [codeSolutions, setCodeSolutions] = useState(
    Array(questions.length).fill("")
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

  // Function to go full screen when interview starts
  const enterFullScreen = () => {
    const doc = document.documentElement;
    if (doc.requestFullscreen) {
      doc.requestFullscreen();
    } else if (doc.mozRequestFullScreen) {
      // Firefox
      doc.mozRequestFullScreen();
    } else if (doc.webkitRequestFullscreen) {
      // Chrome, Safari and Opera
      doc.webkitRequestFullscreen();
    } else if (doc.msRequestFullscreen) {
      // IE/Edge
      doc.msRequestFullscreen();
    }
    document.body.style.overflow = "hidden"; // Disable scrolling
  };

  // Function to exit full screen
  const exitFullScreen = () => {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.mozCancelFullScreen) {
      // Firefox
      document.mozCancelFullScreen();
    } else if (document.webkitExitFullscreen) {
      // Chrome, Safari and Opera
      document.webkitExitFullscreen();
    } else if (document.msExitFullscreen) {
      // IE/Edge
      document.msExitFullscreen();
    }
    document.body.style.overflow = "auto"; // Enable scrolling
  };

  useEffect(() => {
    // Enter full screen when the component mounts
    enterFullScreen();

    // Cleanup and exit full screen when the component unmounts or interview ends
    return () => {
      exitFullScreen();
    };
  }, []);

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
      setIsTimerRunning(false);
      answers[9] = codeSolutions[9];
      console.log("Answers:", answers);
      console.log("Code Solutions:", codeSolutions);
      exitFullScreen();

      // Navigate and pass the state (questions and answers)
      navigate(`/admin/interview/${interviewId}/results`, {
        state: { questions, answers },
      });
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
    const newTimeLeft =
      currentQuestionIndex >= questions.length - 3 ? 600 : 120; // 10 minutes for last 2 questions, 2 minutes otherwise
    setTimeLeft(newTimeLeft);
    setIsTimerRunning(true);
  };

  const speakQuestion = (text) => {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      const voices = window.speechSynthesis.getVoices();
      console.log("Available Voices:", voices);
      utterance.lang = "en-GB";
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
    <div className="flex flex-col h-screen bg-[#121212] text-[#E0E0E0]">
      {/* Upper Section: Video and Interview Description */}
      <div className="flex items-center justify-between px-8 py-6 bg-[#1E1E1E] border-b border-[#2C2C2C]">
        <div className="w-56 h-32 overflow-hidden shadow-xl rounded-md">
          <video
            ref={videoRef}
            autoPlay
            muted
            className="w-56 h-32 object-cover border-slate-200  border-2"
          />
        </div>
        <div className="ml-6 text-center">
          <h2 className="text-2xl font-semibold text-[#FFFFFF] mb-2">
            {title + " Interview"}
          </h2>
          <p className="text-lg text-[#B0B0B0]">{role}</p>
        </div>
        <div className="text-2xl font-semibold">
          Time Left:{" "}
          <span className="text-[#00B4D8]">{formatTime(timeLeft)}</span>
        </div>
      </div>

      {/* Lower Section: Question and Answer / Code Editor */}
      <div className="flex h-full">
        {/* Question Section */}
        <div className="flex flex-col justify-between items-center w-1/2 px-8 py-6 bg-[#121212] overflow-y-auto border-r border-[#2C2C2C]">
          <p className="text-2xl font-bold  text-center text-[#00B4D8]">
            Question {currentQuestionIndex + 1}
          </p>
          <p className="text-xl mt-4 text-slate-200  bg-[#2C2C2C] h-96 p-10 rounded-xl shadow-2xl">
            {currentQuestion}
          </p>

          <div className="mt-auto">
            {currentQuestionIndex != questions.length - 1 ? (
              <button
                onClick={moveToNextQuestion}
                className="py-2 px-8 mt-4 bg-[#00B4D8] hover:bg-[#0096B7] text-white font-semibold rounded-lg transition duration-300"
              >
                Next Question
              </button>
            ) : (
              <Dialog>
                <DialogTrigger>
                  <Button>Finish Interview</Button>
                </DialogTrigger>
                <DialogContent className="bg-black">
                  <DialogHeader>
                    <DialogTitle>
                      You want tho finish the Interview ? This action can't be
                      revert.
                    </DialogTitle>
                    <DialogDescription>
                      <Button
                        onClick={moveToNextQuestion}
                        className="mt-6 w-32"
                      >
                        Finish
                      </Button>
                    </DialogDescription>
                  </DialogHeader>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>

        {/* Answer or Code Editor Section */}
        <div className="w-1/2 bg-[#121212] p-8 flex flex-col justify-between">
          {currentQuestionIndex >= questions.length - 2 ? (
            <div>
              <CodeMirror
                value={codeSolutions[currentQuestionIndex]}
                height="330px"
                extensions={[javascript()]}
                theme={oneDark}
                onChange={(value) => saveCodeSolution(value)}
                className="rounded-lg border border-[#2C2C2C]"
              />
              <button
                onClick={runCode}
                className="py-2 px-6 mt-4 bg-[#28C242] hover:bg-[#45A049] text-white font-medium rounded-lg transition duration-200"
              >
                Run Code
              </button>
              <div className="mt-4 bg-[#1E1E1E] p-4 rounded-lg text-[#B0B0B0] border border-[#2C2C2C]">
                <p className="font-semibold text-lg text-[#FFFFFF]">Output:</p>
                <pre className="mt-2 whitespace-pre-wrap">{output}</pre>
              </div>
            </div>
          ) : (
            <div className="mb-6">
              <p className="text-xl font-semibold text-[#28C242] mb-3">
                Your Answer:
              </p>
              <div className="bg-[#2C2C2C] text-slate-300 font-mono text-xl p-4 rounded-lg h-96 overflow-y-auto border border-[#2C2C2C]">
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
