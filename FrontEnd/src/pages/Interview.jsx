import React, { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import CodeMirror from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { oneDark } from "@codemirror/theme-one-dark";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

// Sandbox creation for safe code execution
const createSandbox = () => {
  const logs = [];
  const proxiedConsole = {
    log: (...args) => {
      logs.push(["log", ...args]);
    },
    error: (...args) => {
      logs.push(["error", ...args]);
    },
    warn: (...args) => {
      logs.push(["warn", ...args]);
    },
    info: (...args) => {
      logs.push(["info", ...args]);
    },
  };

  const safeEval = (code) => {
    try {
      const func = new Function(
        "console",
        `
        "use strict";
        return (function() {
          ${code}
        })();
      `
      );

      const result = func(proxiedConsole);

      return {
        success: true,
        result: result,
        logs: logs,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        logs: logs,
      };
    }
  };

  return safeEval;
};

const MyInterviewPage = () => {
  const location = useLocation();
  const questions = location.state?.questions || [];
  const interviewId = location.state?.interviewId;
  const title = location.state?.title;
  const company = location.state?.company;

  const navigate = useNavigate();
  const videoRef = useRef(null);

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(120);
  const [isTimerRunning, setIsTimerRunning] = useState(true);
  const [answers, setAnswers] = useState(Array(questions.length).fill(""));
  const [codeSolutions, setCodeSolutions] = useState(
    Array(questions.length).fill("")
  );
  const [mediaStream, setMediaStream] = useState(null);
  const [output, setOutput] = useState("");
  const [isExecuting, setIsExecuting] = useState(false);
  const [activeTab, setActiveTab] = useState("question");
  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
  } = useSpeechRecognition();

  const currentQuestion = questions[currentQuestionIndex];

  // Fullscreen handlers
  const enterFullScreen = () => {
    const doc = document.documentElement;
    if (doc.requestFullscreen) {
      doc.requestFullscreen();
    } else if (doc.mozRequestFullScreen) {
      doc.mozRequestFullScreen();
    } else if (doc.webkitRequestFullscreen) {
      doc.webkitRequestFullscreen();
    } else if (doc.msRequestFullscreen) {
      doc.msRequestFullscreen();
    }
    document.body.style.overflow = "hidden";
  };

  const exitFullScreen = () => {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.mozCancelFullScreen) {
      document.mozCancelFullScreen();
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen();
    } else if (document.msExitFullscreen) {
      document.msExitFullscreen();
    }
    document.body.style.overflow = "auto";
  };

  // Initialize fullscreen and video
  useEffect(() => {
    enterFullScreen();
    return () => {
      exitFullScreen();
      stopMediaStream();
    };
  }, []);

  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        setMediaStream(stream);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      })
      .catch((error) => console.error("Error accessing media devices:", error));

    // Cleanup function
    return () => {
      stopMediaStream();
    };
  }, []);
  const stopMediaStream = () => {
    if (mediaStream) {
      mediaStream.getTracks().forEach((track) => {
        track.stop();
      });
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    }
    setMediaStream(null);
  };
  const stopSpeech = () => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
  };

  // Question navigation and timer
  const moveToNextQuestion = () => {
    saveCurrentAnswer();
    SpeechRecognition.stopListening();
    stopSpeech();

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prevIndex) => prevIndex + 1);
      resetTranscript();
      resetTimer();
    } else {
      setIsTimerRunning(false);
      answers[9] = codeSolutions[9];
      stopMediaStream();
      exitFullScreen();
      navigate(`/admin/interview/results/${interviewId}`, {
        state: { questions, answers, title, company },
      });
    }
  };

  // Timer effect
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

  // Speech recognition effect
  useEffect(() => {
    if (currentQuestion) {
      speakQuestion(currentQuestion);
      SpeechRecognition.startListening({ continuous: true, language: "en-US" });
    } else {
      SpeechRecognition.stopListening();
    }
  }, [currentQuestion]);

  // Answer handling
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

  // Timer reset
  const resetTimer = () => {
    const newTimeLeft =
      currentQuestionIndex >= questions.length - 3 ? 600 : 120;
    setTimeLeft(newTimeLeft);
    setIsTimerRunning(true);
  };

  // Text-to-speech
  const speakQuestion = (text) => {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "en-GB";
      utterance.rate = 1;
      utterance.pitch = 1;
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utterance);
    }
  };

  // Code execution
  const runCode = async () => {
    setIsExecuting(true);
    const safeEval = createSandbox();
    const code = codeSolutions[currentQuestionIndex];

    try {
      const result = safeEval(code);

      let formattedOutput = "";

      // Format console logs
      if (result.logs.length > 0) {
        formattedOutput += result.logs
          .map(([type, ...args]) => {
            const message = args
              .map((arg) =>
                typeof arg === "object"
                  ? JSON.stringify(arg, null, 2)
                  : String(arg)
              )
              .join(" ");

            switch (type) {
              case "error":
                return `❌ ${message}`;
              case "warn":
                return `⚠️ ${message}`;
              case "info":
                return `ℹ️ ${message}`;
              default:
                return `> ${message}`;
            }
          })
          .join("\n");
        formattedOutput += "\n\n";
      }

      // Add execution result
      if (result.success) {
        if (result.result !== undefined) {
          formattedOutput += `✅ Return value: ${
            typeof result.result === "object"
              ? JSON.stringify(result.result, null, 2)
              : result.result
          }`;
        } else {
          formattedOutput += "✅ Code executed successfully!";
        }
      } else {
        formattedOutput += `❌ Error: ${result.error}`;
      }

      setOutput(formattedOutput);
    } catch (error) {
      setOutput(`❌ Runtime Error: ${error.message}`);
    } finally {
      setIsExecuting(false);
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
      {/* Header Section */}
      <div className="flex items-center justify-between px-8 py-6 bg-[#1E1E1E] border-b border-[#2C2C2C]">
        <div className="w-56 h-32 overflow-hidden shadow-xl rounded-md">
          <video
            ref={videoRef}
            autoPlay
            muted
            className="w-56 h-32 object-cover border-slate-200 border-2"
          />
        </div>
        <div className="ml-6 text-center">
          <h2 className="text-2xl font-semibold text-[#FFFFFF] mb-2">
            {company + " Interview"}
          </h2>
          <p className="text-lg text-[#B0B0B0]">{title}</p>
        </div>
        <div className="text-2xl font-semibold">
          Time Left:{" "}
          <span className="text-[#00B4D8]">{formatTime(timeLeft)}</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 h-[calc(100vh-180px)] font-mainFont">
        {/* Left Section with Tabs */}
        <div className="flex flex-col w-1/2 bg-[#121212] border-r border-[#2C2C2C]">
          {/* Tab Headers */}
          <div className="flex border-b border-[#2C2C2C]">
            <button
              onClick={() => setActiveTab("question")}
              className={`px-6 py-3 text-lg font-semibold transition-colors ${
                activeTab === "question"
                  ? "text-[#00B4D8] border-b-2 border-[#00B4D8]"
                  : "text-[#B0B0B0] hover:text-[#FFFFFF]"
              }`}
            >
              Question
            </button>
            {currentQuestionIndex >= questions.length - 2 && (
              <button
                onClick={() => setActiveTab("output")}
                className={`px-6 py-3 text-lg font-semibold transition-colors ${
                  activeTab === "output"
                    ? "text-[#00B4D8] border-b-2 border-[#00B4D8]"
                    : "text-[#B0B0B0] hover:text-[#FFFFFF]"
                }`}
              >
                Output
              </button>
            )}
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto p-8">
            {activeTab === "question" ? (
              <div className="flex flex-col h-full">
                <p className="text-2xl font-bold text-center text-[#00B4D8] mb-4">
                  Question {currentQuestionIndex + 1}
                </p>
                <div className="text-xl text-slate-200 bg-[#1E1E1E] p-10 rounded-xl shadow-2xl flex-1">
                  {currentQuestion}
                </div>
                <div className="mt-4 text-center">
                  {currentQuestionIndex !== questions.length - 1 ? (
                    <button
                      onClick={moveToNextQuestion}
                      className="py-2 px-8 bg-white hover:bg-slate-300 text-black font-semibold rounded-lg transition duration-300"
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
                            Are you sure you want to finish the interview? This
                            action cannot be undone.
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
            ) : (
              <div className="h-full bg-[#1E1E1E] p-4 rounded-lg text-[#B0B0B0] border border-[#2C2C2C]">
                <pre className="font-mono text-sm overflow-y-auto h-full">
                  {output ? (
                    output.split("\n").map((line, i) => (
                      <div
                        key={i}
                        className={`py-1 ${
                          line.startsWith("❌")
                            ? "text-red-400"
                            : line.startsWith("⚠️")
                            ? "text-yellow-400"
                            : line.startsWith("✅")
                            ? "text-green-400"
                            : line.startsWith(">")
                            ? "text-blue-400"
                            : "text-slate-300"
                        }`}
                      >
                        {line}
                      </div>
                    ))
                  ) : (
                    <div className="text-[#B0B0B0] text-center mt-4">
                      Run your code to see the output here
                    </div>
                  )}
                </pre>
              </div>
            )}
          </div>
        </div>

        {/* Right Section - Code Editor */}
        <div className="w-1/2 bg-[#121212] p-2 flex flex-col h-full">
          {currentQuestionIndex >= questions.length - 2 ? (
            // Code Editor Section
            <div className="flex flex-col h-full">
              <div className="flex-1">
                <CodeMirror
                  value={codeSolutions[currentQuestionIndex]}
                  height="calc(100vh - 280px)"
                  extensions={[javascript()]}
                  theme={oneDark}
                  onChange={(value) => saveCodeSolution(value)}
                  className="rounded-lg border border-[#2C2C2C]"
                />
              </div>
              <button
                onClick={() => {
                  runCode();
                  setActiveTab("output");
                }}
                disabled={isExecuting}
                className={`py-2 px-6 bg-[#27BA41] hover:bg-[#45A049] text-white font-medium rounded-lg transition duration-200 w-36 ${
                  isExecuting ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {isExecuting ? "Running..." : "Run Code"}
              </button>
            </div>
          ) : (
            // Speech Answer Section
            <div className="h-full flex flex-col">
              <p className="text-xl font-semibold text-[#27BA41] mb-3">
                Your Answer:
              </p>
              <div className="bg-[#2C2C2C] text-slate-300 font-mono text-xl p-4 rounded-lg flex-1 overflow-y-auto border border-[#2C2C2C]">
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
