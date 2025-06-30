import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import CodeMirror from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { python } from "@codemirror/lang-python";
import { cpp } from "@codemirror/lang-cpp";
import { java } from "@codemirror/lang-java";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { oneDark } from "@codemirror/theme-one-dark";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { AlertCircle } from "lucide-react";

// Utility function for timestamps
const getTimestamp = () => new Date().toISOString();

// Load scripts with retry mechanism
const loadScript = (src, retries = 5, delay = 1500) => {
  return new Promise((resolve, reject) => {
    const attemptLoad = (attempt) => {
      const script = document.createElement("script");
      script.src = src;
      script.async = true;
      script.onload = () => {
        console.log(`${getTimestamp()} - Loaded script: ${src}`);
        resolve();
      };
      script.onerror = () => {
        if (attempt < retries) {
          console.warn(
            `${getTimestamp()} - Failed to load ${src}, retrying (${
              attempt + 1
            }/${retries})`
          );
          setTimeout(() => attemptLoad(attempt + 1), delay);
        } else {
          console.error(
            `${getTimestamp()} - Failed to load ${src} after ${retries} attempts`
          );
          reject(new Error(`Failed to load script: ${src}`));
        }
      };
      document.head.appendChild(script);
    };
    attemptLoad(1);
  });
};

// Check secure context
const isSecureContext = () =>
  window.isSecureContext || window.location.hostname === "localhost";

const MyInterviewPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const hasRefreshedRef = useRef(false);
  const cocoSsdModelRef = useRef(null);
  const lastWarningMessageRef = useRef(""); // Track last warning message
  const lastWarningCountRef = useRef(0); // Track last warning count

  const questions = location.state?.questions || [];
  const interviewId = location.state?.interviewId;
  const title = location.state?.title;
  const company = location.state?.company;

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
  const [selectedLanguage, setSelectedLanguage] = useState("javascript");

  // Proctoring states
  const [proctorStatus, setProctorStatus] = useState("Detecting...");
  const [peopleCount, setPeopleCount] = useState(0);
  const [phoneWarning, setPhoneWarning] = useState(false);
  const [cheatingDetected, setCheatingDetected] = useState(false);
  const [proctorLog, setProctorLog] = useState("Please come into the frame");
  const [cameraError, setCameraError] = useState("");
  const [warningCount, setWarningCount] = useState(0);
  const [warningMessage, setWarningMessage] = useState("");
  const [error, setError] = useState(null);

  const MAX_WARNINGS = 3;

  // Validate questions array
  useEffect(() => {
    if (!questions || questions.length === 0) {
      setError("No questions provided for the interview");
      setIsTimerRunning(false);
      navigate(`/admin/interview/results/${interviewId}`, {
        state: {
          questions: [],
          answers: [],
          title,
          company,
          cheatingDetected: false,
          cheatingReason: "No questions provided",
        },
      });
    }
  }, [questions, navigate, interviewId, title, company]);

  const currentQuestion = questions[currentQuestionIndex] || null;

  // Fullscreen handlers
  const enterFullScreen = () => {
    const doc = document.documentElement;
    if (doc.requestFullscreen) doc.requestFullscreen();
    else if (doc.mozRequestFullScreen) doc.mozRequestFullScreen();
    else if (doc.webkitRequestFullscreen) doc.webkitRequestFullscreen();
    else if (doc.msRequestFullscreen) doc.msRequestFullscreen();
    document.body.style.overflow = "hidden";
  };

  const exitFullScreen = () => {
    if (document.exitFullscreen) document.exitFullscreen();
    else if (document.mozCancelFullScreen) document.mozCancelFullScreen();
    else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
    else if (document.msExitFullscreen) document.msExitFullscreen();
    document.body.style.overflow = "auto";
  };

  // Initialize webcam
  const initializeWebcam = async (retries = 3, delay = 1000) => {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        console.log(
          `${getTimestamp()} - Attempting to access webcam (Attempt ${attempt}/${retries})`
        );
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 640, height: 480 },
          audio: true,
        });
        console.log(`${getTimestamp()} - Webcam stream acquired`);
        setMediaStream(stream);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
          console.log(`${getTimestamp()} - Video playback started`);
          setCameraError("");
        }
        return stream;
      } catch (error) {
        console.error(
          `${getTimestamp()} - Webcam access failed (Attempt ${attempt}):`,
          error
        );
        if (attempt === retries) {
          let errorMessage = "Error: Cannot access webcam";
          if (error.name === "NotAllowedError") {
            errorMessage = "Please grant permission to access the webcam";
          } else if (error.name === "NotFoundError") {
            errorMessage = "No webcam found. Please connect a camera";
          } else if (error.name === "NotReadableError") {
            errorMessage = "Webcam is in use by another application";
          } else {
            errorMessage = `Webcam error: ${error.message}`;
          }
          setCameraError(errorMessage);
          setProctorStatus("Error: Webcam access failed");
          setProctorLog(errorMessage);
          return null;
        }
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  };

  // Initialize proctoring
  useEffect(() => {
    const initializeProctoring = async () => {
      if (!isSecureContext()) {
        console.error(
          `${getTimestamp()} - Secure context required for webcam access`
        );
        setProctorStatus("Error: Secure context required");
        setProctorLog("Please use HTTPS or localhost");
        setCameraError("Please access this page via HTTPS or localhost");
        return;
      }

      // Load TensorFlow.js and COCO-SSD
      try {
        await loadScript(
          "https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@3.21.0/dist/tf.min.js"
        );
        await loadScript(
          "https://cdn.jsdelivr.net/npm/@tensorflow-models/coco-ssd@2.2.2/dist/coco-ssd.min.js"
        );
        console.log(`${getTimestamp()} - Proctoring scripts loaded`);
      } catch (error) {
        console.error(
          `${getTimestamp()} - Failed to load proctoring scripts:`,
          error
        );
        setProctorStatus("Error: Proctoring setup failed");
        setProctorLog("Proctoring disabled due to script loading failure");
        return;
      }

      // Initialize webcam
      const stream = await initializeWebcam();
      if (!stream) return;

      // Set up canvas
      if (canvasRef.current) {
        canvasRef.current.width = 640;
        canvasRef.current.height = 480;
      }

      // Initialize COCO-SSD
      try {
        cocoSsdModelRef.current = await window.cocoSsd.load();
        console.log(`${getTimestamp()} - COCO-SSD model loaded`);
        setProctorStatus("Proctoring active");
      } catch (error) {
        console.error(`${getTimestamp()} - Error loading COCO-SSD:`, error);
        setProctorStatus("Error: Proctoring setup failed");
        setProctorLog("Proctoring disabled due to model loading failure");
        return;
      }

      // Start frame processing
      processFrame();
    };

    const processFrame = async () => {
      if (
        cocoSsdModelRef.current &&
        videoRef.current?.srcObject &&
        !videoRef.current.paused &&
        !cheatingDetected
      ) {
        try {
          const predictions = await cocoSsdModelRef.current.detect(
            videoRef.current
          );
          const ctx = canvasRef.current.getContext("2d");
          ctx.clearRect(
            0,
            0,
            canvasRef.current.width,
            canvasRef.current.height
          );

          let peopleCountLocal = 0;
          let phoneDetectedLocal = false;

          for (const prediction of predictions) {
            if (prediction.class === "person" && prediction.score > 0.5) {
              peopleCountLocal++;
              const [x, y, width, height] = prediction.bbox;
              ctx.strokeStyle = "blue";
              ctx.lineWidth = 2;
              ctx.strokeRect(x, y, width, height);
              ctx.fillStyle = "blue";
              ctx.font = "12px Arial";
              ctx.fillText(
                `Person (${(prediction.score * 100).toFixed(1)}%)`,
                x,
                y > 10 ? y - 5 : y + 15
              );
            } else if (
              prediction.class === "cell phone" &&
              prediction.score > 0.5
            ) {
              phoneDetectedLocal = true;
              const [x, y, width, height] = prediction.bbox;
              ctx.strokeStyle = "red";
              ctx.lineWidth = 2;
              ctx.strokeRect(x, y, width, height);
              ctx.fillStyle = "red";
              ctx.font = "12px Arial";
              ctx.fillText(
                `Phone (${(prediction.score * 100).toFixed(1)}%)`,
                x,
                y > 10 ? y - 5 : y + 15
              );
            }
          }

          setPeopleCount(peopleCountLocal);
          setPhoneWarning(phoneDetectedLocal);

          // Prioritize phone detection over multiple people
          if (peopleCountLocal === 0) {
            setProctorStatus("No person detected");
            setProctorLog("Please come into the frame");
          } else if (phoneDetectedLocal) {
            setProctorStatus("Warning: Mobile phone detected");
            setProctorLog("Warning: Mobile phone detected");
            setWarningMessage("Mobile phone detected in the frame!");
            setWarningCount((prev) => {
              const newCount = prev + 1;
              if (newCount <= MAX_WARNINGS) {
                if (
                  warningMessage !== lastWarningMessageRef.current ||
                  newCount > lastWarningCountRef.current
                ) {
                  toast.warning(
                    `Proctoring Warning: Mobile phone detected in the frame! `,
                    {
                      action: {
                        label: "Dismiss",
                        onClick: () => {},
                      },
                      duration: 5000,
                    }
                  );
                  lastWarningMessageRef.current = warningMessage;
                  lastWarningCountRef.current = newCount;
                }
              }
              if (newCount >= MAX_WARNINGS) {
                setCheatingDetected(true);
                handleCheating("Mobile phone detected");
              }
              return newCount;
            });
          } else if (peopleCountLocal > 1) {
            setProctorStatus("Warning: Multiple people detected");
            setProctorLog("Warning: Multiple people detected");
            setWarningMessage("Multiple people detected in the frame!");
            setWarningCount((prev) => {
              const newCount = prev + 1;
              if (newCount <= MAX_WARNINGS) {
                if (
                  warningMessage !== lastWarningMessageRef.current ||
                  newCount > lastWarningCountRef.current
                ) {
                  toast.warning(
                    `Proctoring Warning: Multiple people detected in the frame!`,
                    {
                      action: {
                        label: "Dismiss",
                        onClick: () => {},
                      },
                      duration: 5000,
                    }
                  );
                  lastWarningMessageRef.current = warningMessage;
                  lastWarningCountRef.current = newCount;
                }
              }
              if (newCount >= MAX_WARNINGS) {
                setCheatingDetected(true);
                handleCheating("Multiple people detected");
              }
              return newCount;
            });
          } else {
            setProctorStatus("Proctoring active");
            setProctorLog("Monitoring in progress");
          }
        } catch (error) {
          console.error(`${getTimestamp()} - Detection error:`, error);
          setProctorLog("Error during detection");
        }
        setTimeout(processFrame, 1000); // Run every second
      }
    };

    // Tamper-proofing
    const setupTamperProofing = () => {
      const handleContextMenu = (e) => e.preventDefault();
      const handleKeydown = (e) => {
        if (e.ctrlKey && (e.key === "u" || e.key === "s" || e.key === "i")) {
          e.preventDefault();
        }
      };
      document.addEventListener("contextmenu", handleContextMenu);
      document.addEventListener("keydown", handleKeydown);
      return () => {
        document.removeEventListener("contextmenu", handleContextMenu);
        document.removeEventListener("keydown", handleKeydown);
      };
    };

    enterFullScreen();
    initializeProctoring();
    const cleanupTamperProofing = setupTamperProofing();

    return () => {
      exitFullScreen();
      stopMediaStream();
      cleanupTamperProofing();
    };
  }, [warningMessage]);

  const handleCheating = (reason) => {
    setCheatingDetected(true);
    stopMediaStream();
    setIsTimerRunning(false);
    SpeechRecognition.stopListening();
    stopSpeech();
    exitFullScreen();
    navigate(`/admin/interview/results/${interviewId}`, {
      state: {
        questions,
        answers,
        title,
        company,
        cheatingDetected: true,
        cheatingReason: reason,
      },
    });
  };

  const stopMediaStream = () => {
    if (mediaStream) {
      mediaStream.getTracks().forEach((track) => track.stop());
      if (videoRef.current) videoRef.current.srcObject = null;
    }
    setMediaStream(null);
  };

  const stopSpeech = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
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
    if (questions.length > 0 && currentQuestion) {
      speakQuestion(currentQuestion);
      SpeechRecognition.startListening({ continuous: true, language: "en-US" });
    } else {
      SpeechRecognition.stopListening();
    }
  }, [currentQuestion, questions.length]);

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

  const resetTimer = () => {
    const newTimeLeft =
      currentQuestionIndex >= questions.length - 2 ? 600 : 120;
    setTimeLeft(newTimeLeft);
    setIsTimerRunning(true);
  };

  const speakQuestion = (text) => {
    if (window.speechSynthesis) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "en-GB";
      utterance.rate = 1;
      utterance.pitch = 1;
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utterance);
    }
  };

  const JUDGE0_API_URL = "https://judge0-ce.p.rapidapi.com";
  const JUDGE0_HEADERS = {
    "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com",
    "X-RapidAPI-Key": "3d37918c6bmsh0cbc35934ed5233p1aeea3jsnaea159f596a2",
    "Content-Type": "application/json",
  };

  const LANGUAGE_IDS = {
    javascript: 63,
    python: 71,
    cpp: 54,
    java: 62,
  };

  const submitCode = async (code, languageId) => {
    const submission = {
      source_code: code,
      language_id: languageId,
      stdin: "",
    };

    try {
      const submitResponse = await fetch(`${JUDGE0_API_URL}/submissions`, {
        method: "POST",
        headers: JUDGE0_HEADERS,
        body: JSON.stringify(submission),
      });
      const submitData = await submitResponse.json();
      const token = submitData.token;

      let result;
      let attempts = 0;
      const maxAttempts = 10;

      while (attempts < maxAttempts) {
        const checkResponse = await fetch(
          `${JUDGE0_API_URL}/submissions/${token}`,
          {
            method: "GET",
            headers: JUDGE0_HEADERS,
          }
        );
        result = await checkResponse.json();
        if (result.status.id > 2) break;
        await new Promise((resolve) => setTimeout(resolve, 1000));
        attempts++;
      }

      return formatJudge0Result(result);
    } catch (error) {
      return {
        success: false,
        error: "Execution service error: " + error.message,
        logs: [],
      };
    }
  };

  const formatJudge0Result = (result) => {
    const logs = [];
    if (result.compile_output) logs.push(["error", result.compile_output]);
    if (result.stdout) logs.push(["log", result.stdout]);
    if (result.stderr) logs.push(["error", result.stderr]);
    return {
      success: result.status.id === 3,
      result: result.stdout,
      error: result.status.description,
      logs: logs,
    };
  };

  const runCode = async (code, selectedLanguage) => {
    const languageId = LANGUAGE_IDS[selectedLanguage];
    if (!languageId) {
      return {
        success: false,
        error: "Unsupported language",
        logs: [],
      };
    }
    return await submitCode(code, languageId);
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const languageExtensions = {
    javascript: [javascript()],
    python: [python()],
    cpp: [cpp()],
    java: [java()],
  };

  const getLanguageExtension = () => {
    return (
      languageExtensions[selectedLanguage] || languageExtensions.javascript
    );
  };

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
      answers[currentQuestionIndex] = codeSolutions[currentQuestionIndex];
      stopMediaStream();
      exitFullScreen();
      navigate(`/admin/interview/results/${interviewId}`, {
        state: {
          questions,
          answers,
          title,
          company,
          cheatingDetected,
          cheatingReason: "Completed",
        },
      });
    }
  };

  // Render error state if present
  if (error) {
    return (
      <div className="flex flex-col h-screen bg-[#121212] text-[#E0E0E0] items-center justify-center">
        <div className="px-8 py-4">
          <div className="bg-red-900 text-red-100 p-4 rounded-lg flex items-center">
            <AlertCircle className="h-4 w-4 mr-2" />
            <div>
              <h3 className="font-semibold">Error</h3>
              <p>{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-[#121212] text-[#E0E0E0]">
      <div className="flex items-center justify-between px-8 py-6 bg-[#1E1E1E] border-b border-[#2C2C2C]">
        <div className="w-56 h-32 overflow-hidden shadow-xl rounded-md relative">
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            className="w-56 h-32 object-cover border-slate-200 border-2"
          />
          <canvas
            ref={canvasRef}
            className="absolute top-0 left-0 w-56 h-32 pointer-events-none"
          />
          {cameraError && (
            <div className="absolute top-0 left-0 w-56 h-32 flex items-center justify-center bg-black bg-opacity-75 text-red-400 text-sm text-center p-2">
              {cameraError}
            </div>
          )}
        </div>
        <div className="ml-6 text-center">
          <h2 className="text-2xl font-semibold text-[#FFFFFF] mb-2">
            {company ? `${company} Interview` : "Interview"}
          </h2>
          <p className="text-lg text-[#B0B0B0]">{title || "Untitled"}</p>
          <div className="text-lg text-[#B0B0B0] mt-2">
            <div>Proctoring Status: {proctorStatus}</div>
            <div>
              Warnings: {warningCount}/{MAX_WARNINGS}
            </div>
          </div>
        </div>
        <div className="text-2xl font-semibold">
          Time Left:{" "}
          <span className="text-[#00B4D8]">{formatTime(timeLeft)}</span>
        </div>
      </div>

      <div className="flex flex-1 h-[calc(100vh-180px)] font-mainFont">
        <div className="flex flex-col w-1/2 bg-[#121212] border-r border-[#2C2C2C]">
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
          <div className="flex-1 overflow-y-auto p-8">
            {activeTab === "question" ? (
              <div className="flex flex-col h-full">
                <p className="text-2xl font-bold text-center text-[#00B4D8] mb-4">
                  Question {currentQuestionIndex + 1}
                </p>
                <div className="text-xl text-slate-200 bg-[#1E1E1E] p-10 rounded-xl shadow-2xl flex-1">
                  {currentQuestion || "No question available"}
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

        <div className="w-1/2 bg-[#121212] p-2 flex flex-col h-full">
          {currentQuestionIndex >= questions.length - 2 ? (
            <div className="flex flex-col h-full">
              <div className="mb-2">
                <Select
                  value={selectedLanguage}
                  onValueChange={(value) => setSelectedLanguage(value)}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="javascript">JavaScript</SelectItem>
                    <SelectItem value="python">Python</SelectItem>
                    <SelectItem value="java">Java</SelectItem>
                    <SelectItem value="cpp">C++</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1">
                <CodeMirror
                  value={codeSolutions[currentQuestionIndex]}
                  height="calc(100vh - 320px)"
                  extensions={getLanguageExtension()}
                  theme={oneDark}
                  onChange={(value) => saveCodeSolution(value)}
                  className="rounded-lg border border-[#2C2C2C]"
                />
              </div>
              <button
                onClick={async () => {
                  setIsExecuting(true);
                  const code = codeSolutions[currentQuestionIndex];
                  try {
                    const result = await runCode(code, selectedLanguage);
                    setOutput(
                      result.logs
                        .map(
                          ([type, message]) =>
                            `${type === "error" ? "❌" : "✅"} ${message}`
                        )
                        .join("\n")
                    );
                    setActiveTab("output");
                  } catch (error) {
                    setOutput(`❌ Error: ${error.message}`);
                  } finally {
                    setIsExecuting(false);
                  }
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

// Error Boundary Component
class InterviewErrorBoundary extends React.Component {
  state = { hasError: false, errorMessage: "" };

  static getDerivedStateFromError(error) {
    return { hasError: true, errorMessage: error.message };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Error caught in InterviewErrorBoundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col h-screen bg-[#121212] text-[#E0E0E0] items-center justify-center">
          <div className="px-8 py-4">
            <div className="bg-red-900 text-red-100 p-4 rounded-lg flex items-center">
              <AlertCircle className="h-4 w-4 mr-2" />
              <div>
                <h3 className="font-semibold">Error</h3>
                <p>
                  An error occurred: {this.state.errorMessage}. Please try again
                  or contact support.
                </p>
              </div>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function InterviewPageWrapper() {
  return (
    <InterviewErrorBoundary>
      <MyInterviewPage />
    </InterviewErrorBoundary>
  );
}
