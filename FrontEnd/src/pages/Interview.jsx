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
import { AlertCircle, Volume2, Mic, Play, ChevronRight, CheckCircle } from "lucide-react";

// ─── Utilities ────────────────────────────────────────────────────────────────

const loadScript = (src, retries = 5, delay = 1500) => {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${src}"]`);
    if (existing) {
      if (existing.dataset.loaded === "1") { resolve(); }
      else {
        existing.addEventListener("load", () => resolve(), { once: true });
        existing.addEventListener("error", () => reject(new Error(`Script failed: ${src}`)), { once: true });
      }
      return;
    }
    const attemptLoad = (attempt) => {
      const script = document.createElement("script");
      script.src = src;
      script.async = true;
      script.onload = () => { script.dataset.loaded = "1"; resolve(); };
      script.onerror = () => {
        if (attempt < retries) setTimeout(() => attemptLoad(attempt + 1), delay);
        else reject(new Error(`Failed to load script: ${src}`));
      };
      document.head.appendChild(script);
    };
    attemptLoad(1);
  });
};

const isSecureContext = () =>
  window.isSecureContext || window.location.hostname === "localhost";

// Parses AI-generated coding questions into labeled sections so they can be
// rendered LeetCode-style instead of as a raw text blob
const parseCodingQuestion = (text) => {
  const sectionRegex = /(Problem\s*[Dd]escription|Input|Output|Example[s]?|Constraints?|Note)\s*:/g;
  const matches = [...text.matchAll(sectionRegex)];
  if (matches.length === 0) return [{ label: "Problem", content: text.trim() }];
  return matches.map((match, i) => {
    const start = match.index + match[0].length;
    const end = i + 1 < matches.length ? matches[i + 1].index : text.length;
    return { label: match[1].replace(/\s+/g, " ").trim(), content: text.slice(start, end).trim() };
  });
};

// ─── Sub-components ───────────────────────────────────────────────────────────

const MicVisualizer = ({ listening, isSpeaking }) => (
  <div className="flex flex-col items-center justify-center h-full gap-5">
    <div className="relative flex items-center justify-center">
      {listening && !isSpeaking && (
        <>
          <span className="absolute w-20 h-20 rounded-full bg-[#00B4D8] opacity-20 animate-ping" />
          <span
            className="absolute w-28 h-28 rounded-full bg-[#00B4D8] opacity-10 animate-ping"
            style={{ animationDelay: "0.4s" }}
          />
        </>
      )}
      <div
        className={`relative z-10 w-16 h-16 rounded-full flex items-center justify-center transition-colors duration-300 ${
          isSpeaking
            ? "bg-[#00B4D8]"
            : listening
            ? "bg-[#0f3340]"
            : "bg-[#2C2C2C]"
        }`}
      >
        <Mic
          className={`w-7 h-7 transition-colors duration-300 ${
            isSpeaking ? "text-black" : listening ? "text-[#00B4D8]" : "text-[#555]"
          }`}
        />
      </div>
    </div>
    <p
      className={`text-sm font-medium tracking-wide transition-colors duration-300 ${
        isSpeaking ? "text-[#00B4D8]" : listening ? "text-[#00B4D8]" : "text-[#444]"
      }`}
    >
      {isSpeaking ? "Reading question aloud…" : listening ? "Listening…" : "Mic inactive"}
    </p>
  </div>
);

const CodingQuestionView = ({ text }) => {
  const sections = parseCodingQuestion(text);
  const sectionStyle = {
    "Problem description": { label: "text-[#00B4D8]", bg: "" },
    "Input":              { label: "text-blue-400",   bg: "bg-[#1a2433]" },
    "Output":             { label: "text-green-400",  bg: "bg-[#1a2b1a]" },
    "Example":            { label: "text-yellow-400", bg: "bg-[#2a2310]" },
    "Examples":           { label: "text-yellow-400", bg: "bg-[#2a2310]" },
    "Constraints":        { label: "text-orange-400", bg: "bg-[#2a1e10]" },
    "Note":               { label: "text-purple-400", bg: "" },
  };

  return (
    <div className="space-y-5">
      {sections.map(({ label, content }, i) => {
        const style = sectionStyle[label] || { label: "text-[#00B4D8]", bg: "" };
        const isCode = ["Input", "Output", "Example", "Examples", "Constraints"].includes(label);
        return (
          <div key={i}>
            <span className={`text-xs font-bold uppercase tracking-widest ${style.label}`}>
              {label}
            </span>
            <div
              className={`mt-2 text-sm leading-relaxed whitespace-pre-wrap rounded-lg ${
                isCode
                  ? `font-mono p-3 border border-[#3C3C3C] ${style.bg || "bg-[#1E1E1E]"} text-slate-300`
                  : "text-slate-200"
              }`}
            >
              {content}
            </div>
          </div>
        );
      })}
    </div>
  );
};

// ─── Main component ───────────────────────────────────────────────────────────

const MyInterviewPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const cocoSsdModelRef = useRef(null);
  const lastWarningCountRef = useRef(0);
  const isCancelledRef = useRef(false);
  // Updated synchronously in handleDictate so re-renders triggered by setIsSpeaking
  // see the correct value before the STT effect's 150ms timer fires
  const isSpeakingRef = useRef(false);

  // Captured once on mount so questions always has the same array reference.
  // Without this, location.state?.questions returns a new array on every render
  // triggered by react-speech-recognition, causing the STT effect to re-fire.
  const initialStateRef = useRef(null);
  if (initialStateRef.current === null) {
    initialStateRef.current = {
      questions: location.state?.questions || [],
      interviewId: location.state?.interviewId,
      title: location.state?.title,
      company: location.state?.company,
    };
  }
  const { questions, interviewId, title, company } = initialStateRef.current;

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(120);
  const [isTimerRunning, setIsTimerRunning] = useState(true);
  const [answers, setAnswers] = useState(Array(questions.length).fill(""));
  const [codeSolutions, setCodeSolutions] = useState(Array(questions.length).fill(""));
  const [mediaStream, setMediaStream] = useState(null);
  const [output, setOutput] = useState("");
  const [isExecuting, setIsExecuting] = useState(false);
  const [activeTab, setActiveTab] = useState("question");
  const { transcript, listening, resetTranscript, browserSupportsSpeechRecognition } =
    useSpeechRecognition();
  const [selectedLanguage, setSelectedLanguage] = useState("javascript");
  const [proctorStatus, setProctorStatus] = useState("Detecting...");
  const [peopleCount, setPeopleCount] = useState(0);
  const [phoneWarning, setPhoneWarning] = useState(false);
  const [cheatingDetected, setCheatingDetected] = useState(false);
  const [proctorLog, setProctorLog] = useState("Please come into the frame");
  const [cameraError, setCameraError] = useState("");
  const [warningCount, setWarningCount] = useState(0);
  const [error, setError] = useState(null);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const MAX_WARNINGS = 3;
  const isCodingQuestion = currentQuestionIndex >= questions.length - 2;

  // ── Derived UI values ──────────────────────────────────────────────────────

  const timerColor =
    timeLeft <= 15 ? "text-red-400" : timeLeft <= 30 ? "text-yellow-400" : "text-[#00B4D8]";

  const proctorDot =
    proctorStatus.startsWith("Error") ? "bg-red-500" :
    proctorStatus.startsWith("Warning") ? "bg-yellow-400" :
    proctorStatus === "Proctoring active" ? "bg-green-500" : "bg-gray-500";

  // ── Lifecycle ──────────────────────────────────────────────────────────────

  useEffect(() => {
    if (!questions || questions.length === 0) {
      setError("No questions provided for the interview");
      setIsTimerRunning(false);
      navigate(`/admin/interview/results/${interviewId}`, {
        state: { questions: [], answers: [], title, company, cheatingDetected: false, cheatingReason: "No questions provided" },
      });
    }
  }, [questions, navigate, interviewId, title, company]);

  const currentQuestion = questions[currentQuestionIndex] || null;

  // requestFullscreen requires a user gesture; exitFullscreen can throw if the
  // document isn't the active fullscreen element — both wrapped in try/catch
  const enterFullScreen = () => {
    try {
      const doc = document.documentElement;
      if (doc.requestFullscreen) doc.requestFullscreen().catch(() => {});
      else if (doc.mozRequestFullScreen) doc.mozRequestFullScreen();
      else if (doc.webkitRequestFullscreen) doc.webkitRequestFullscreen();
      else if (doc.msRequestFullscreen) doc.msRequestFullscreen();
    } catch (e) {}
    document.body.style.overflow = "hidden";
  };

  const exitFullScreen = () => {
    try {
      if (document.fullscreenElement) {
        if (document.exitFullscreen) document.exitFullscreen().catch(() => {});
        else if (document.mozCancelFullScreen) document.mozCancelFullScreen();
        else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
        else if (document.msExitFullscreen) document.msExitFullscreen();
      }
    } catch (e) {}
    document.body.style.overflow = "auto";
  };

  const initializeWebcam = async (retries = 3, delay = 1000) => {
    if (videoRef.current?.srcObject) return videoRef.current.srcObject;
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 640, height: 480 },
          // no audio — claiming the mic blocks Web Speech API
        });
        setMediaStream(stream);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
          setCameraError("");
        }
        return stream;
      } catch (err) {
        if (attempt === retries) {
          let msg = "Error: Cannot access webcam";
          if (err.name === "NotAllowedError") msg = "Please grant permission to access the webcam";
          else if (err.name === "NotFoundError") msg = "No webcam found. Please connect a camera";
          else if (err.name === "NotReadableError") msg = "Webcam is in use by another application";
          else msg = `Webcam error: ${err.message}`;
          setCameraError(msg);
          setProctorStatus("Error: Webcam access failed");
          setProctorLog(msg);
          return null;
        }
        await new Promise((r) => setTimeout(r, delay));
      }
    }
  };

  // Guarded with isCancelledRef so React StrictMode's double-invocation
  // cleans up the first run before the second one acquires the webcam
  useEffect(() => {
    isCancelledRef.current = false;

    const initializeProctoring = async () => {
      if (!isSecureContext()) {
        setProctorStatus("Error: Secure context required");
        setProctorLog("Please use HTTPS or localhost");
        setCameraError("Please access this page via HTTPS or localhost");
        return;
      }
      try {
        if (!window.tf) await loadScript("https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@3.21.0/dist/tf.min.js");
        if (isCancelledRef.current) return;
        if (!window.cocoSsd) await loadScript("https://cdn.jsdelivr.net/npm/@tensorflow-models/coco-ssd@2.2.2/dist/coco-ssd.min.js");
        if (isCancelledRef.current) return;
      } catch {
        setProctorStatus("Error: Proctoring setup failed");
        setProctorLog("Proctoring disabled due to script loading failure");
        return;
      }

      const stream = await initializeWebcam();
      if (isCancelledRef.current) { stream?.getTracks().forEach((t) => t.stop()); return; }
      if (!stream) return;

      if (canvasRef.current) { canvasRef.current.width = 640; canvasRef.current.height = 480; }

      try {
        if (!cocoSsdModelRef.current) cocoSsdModelRef.current = await window.cocoSsd.load();
        if (isCancelledRef.current) return;
        setProctorStatus("Proctoring active");
      } catch {
        setProctorStatus("Error: Proctoring setup failed");
        setProctorLog("Proctoring disabled due to model loading failure");
        return;
      }
      processFrame();
    };

    const processFrame = async () => {
      if (isCancelledRef.current) return;
      if (cocoSsdModelRef.current && videoRef.current?.srcObject && !videoRef.current.paused && !cheatingDetected) {
        try {
          const predictions = await cocoSsdModelRef.current.detect(videoRef.current);
          if (isCancelledRef.current) return;
          const ctx = canvasRef.current.getContext("2d");
          ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

          let peopleCountLocal = 0;
          let phoneDetectedLocal = false;

          for (const p of predictions) {
            if (p.class === "person" && p.score > 0.5) {
              peopleCountLocal++;
              const [x, y, w, h] = p.bbox;
              ctx.strokeStyle = "blue"; ctx.lineWidth = 2;
              ctx.strokeRect(x, y, w, h);
              ctx.fillStyle = "blue"; ctx.font = "12px Arial";
              ctx.fillText(`Person (${(p.score * 100).toFixed(1)}%)`, x, y > 10 ? y - 5 : y + 15);
            } else if (p.class === "cell phone" && p.score > 0.5) {
              phoneDetectedLocal = true;
              const [x, y, w, h] = p.bbox;
              ctx.strokeStyle = "red"; ctx.lineWidth = 2;
              ctx.strokeRect(x, y, w, h);
              ctx.fillStyle = "red"; ctx.font = "12px Arial";
              ctx.fillText(`Phone (${(p.score * 100).toFixed(1)}%)`, x, y > 10 ? y - 5 : y + 15);
            }
          }

          setPeopleCount(peopleCountLocal);
          setPhoneWarning(phoneDetectedLocal);

          if (peopleCountLocal === 0) {
            setProctorStatus("No person detected");
            setProctorLog("Please come into the frame");
          } else if (phoneDetectedLocal) {
            setProctorStatus("Warning: Mobile phone detected");
            setProctorLog("Warning: Mobile phone detected");
            setWarningCount((prev) => {
              const n = prev + 1;
              if (n <= MAX_WARNINGS && n > lastWarningCountRef.current) {
                toast.warning("Proctoring Warning: Mobile phone detected!", { action: { label: "Dismiss", onClick: () => {} }, duration: 5000 });
                lastWarningCountRef.current = n;
              }
              if (n >= MAX_WARNINGS) { setCheatingDetected(true); handleCheating("Mobile phone detected"); }
              return n;
            });
          } else if (peopleCountLocal > 1) {
            setProctorStatus("Warning: Multiple people detected");
            setProctorLog("Warning: Multiple people detected");
            setWarningCount((prev) => {
              const n = prev + 1;
              if (n <= MAX_WARNINGS && n > lastWarningCountRef.current) {
                toast.warning("Proctoring Warning: Multiple people detected!", { action: { label: "Dismiss", onClick: () => {} }, duration: 5000 });
                lastWarningCountRef.current = n;
              }
              if (n >= MAX_WARNINGS) { setCheatingDetected(true); handleCheating("Multiple people detected"); }
              return n;
            });
          } else {
            setProctorStatus("Proctoring active");
            setProctorLog("Monitoring in progress");
          }
        } catch { setProctorLog("Error during detection"); }
        if (!isCancelledRef.current) setTimeout(processFrame, 1000);
      }
    };

    const setupTamperProofing = () => {
      const onContextMenu = (e) => e.preventDefault();
      const onKeydown = (e) => { if (e.ctrlKey && ["u", "s", "i"].includes(e.key)) e.preventDefault(); };
      document.addEventListener("contextmenu", onContextMenu);
      document.addEventListener("keydown", onKeydown);
      return () => { document.removeEventListener("contextmenu", onContextMenu); document.removeEventListener("keydown", onKeydown); };
    };

    enterFullScreen();
    initializeProctoring();
    const cleanupTamper = setupTamperProofing();

    return () => { isCancelledRef.current = true; exitFullScreen(); stopMediaStream(); cleanupTamper(); };
  }, []);

  useEffect(() => {
    if (isTimerRunning && timeLeft > 0) {
      const t = setInterval(() => setTimeLeft((p) => p - 1), 1000);
      return () => clearInterval(t);
    } else if (timeLeft === 0) {
      moveToNextQuestion();
    }
  }, [isTimerRunning, timeLeft]);

  useEffect(() => {
    if (questions.length > 0 && currentQuestion) {
      const t = setTimeout(() => {
        if (!isSpeakingRef.current) SpeechRecognition.startListening({ continuous: true, language: "en-US" });
      }, 150);
      return () => clearTimeout(t);
    } else {
      SpeechRecognition.stopListening();
    }
  }, [currentQuestion, questions.length]);

  // ── Handlers ───────────────────────────────────────────────────────────────

  const handleCheating = (reason) => {
    setCheatingDetected(true); stopMediaStream(); setIsTimerRunning(false);
    SpeechRecognition.stopListening(); stopSpeech(); exitFullScreen();
    navigate(`/admin/interview/results/${interviewId}`, {
      state: { questions, answers, title, company, cheatingDetected: true, cheatingReason: reason },
    });
  };

  const stopMediaStream = () => {
    if (mediaStream) { mediaStream.getTracks().forEach((t) => t.stop()); if (videoRef.current) videoRef.current.srcObject = null; }
    setMediaStream(null);
  };

  const stopSpeech = () => { if (window.speechSynthesis) window.speechSynthesis.cancel(); };

  const saveCurrentAnswer = () => {
    setAnswers((prev) => {
      const updated = [...prev];
      updated[currentQuestionIndex] = isCodingQuestion ? codeSolutions[currentQuestionIndex] : transcript.trim();
      return updated;
    });
    resetTranscript();
  };

  const saveCodeSolution = (code) => {
    setCodeSolutions((prev) => { const u = [...prev]; u[currentQuestionIndex] = code; return u; });
  };

  const resetTimer = () => {
    setTimeLeft(isCodingQuestion ? 600 : 120);
    setIsTimerRunning(true);
  };

  const speakQuestion = (text) => {
    return new Promise((resolve) => {
      if (!window.speechSynthesis) { resolve(); return; }
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1; utterance.pitch = 1;
      utterance.onend = () => resolve();
      utterance.onerror = () => resolve();

      const doSpeak = () => {
        const voices = window.speechSynthesis.getVoices();
        // Prefer Samantha (reliable classic macOS local voice); fall back to any local English voice
        const voice =
          voices.find((v) => v.name === "Samantha") ||
          voices.find((v) => v.lang === "en-US" && v.localService) ||
          voices.find((v) => v.lang.startsWith("en") && v.localService) ||
          voices[0] || null;
        if (voice) utterance.voice = voice;
        if (window.speechSynthesis.paused) window.speechSynthesis.resume();
        window.speechSynthesis.speak(utterance);
        // Chrome TTS bug: speak() sets speaking=true but onstart never fires and no
        // audio plays. pause()+resume() 100ms later kicks it out of the stuck state.
        setTimeout(() => {
          if (window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
            window.speechSynthesis.pause();
            window.speechSynthesis.resume();
          }
        }, 100);
      };

      const voices = window.speechSynthesis.getVoices();
      if (voices.length === 0) {
        let done = false;
        const fallback = setTimeout(() => { if (!done) { done = true; window.speechSynthesis.onvoiceschanged = null; doSpeak(); } }, 1000);
        window.speechSynthesis.onvoiceschanged = () => {
          if (!done) { done = true; clearTimeout(fallback); window.speechSynthesis.onvoiceschanged = null; doSpeak(); }
        };
      } else { doSpeak(); }
    });
  };

  // async so we can await abortListening() — Chrome's audio session is only truly
  // free after recognition.onend fires; calling speak() before that causes an
  // immediate "canceled" error as Chrome reclaims the audio pipeline for STT cleanup
  const handleDictate = async () => {
    if (isSpeakingRef.current) {
      isSpeakingRef.current = false;
      window.speechSynthesis?.cancel();
      setIsSpeaking(false);
      SpeechRecognition.startListening({ continuous: true, language: "en-US" });
    } else if (currentQuestion) {
      isSpeakingRef.current = true;
      setIsSpeaking(true);
      await Promise.race([SpeechRecognition.abortListening(), new Promise((r) => setTimeout(r, 1500))]);
      speakQuestion(currentQuestion).then(() => {
        isSpeakingRef.current = false;
        setIsSpeaking(false);
        SpeechRecognition.startListening({ continuous: true, language: "en-US" });
      });
    }
  };

  const moveToNextQuestion = () => {
    saveCurrentAnswer();
    SpeechRecognition.stopListening();
    stopSpeech();
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((p) => p + 1);
      resetTranscript();
      setTimeLeft(currentQuestionIndex + 1 >= questions.length - 2 ? 600 : 120);
      setIsTimerRunning(true);
    } else {
      setIsTimerRunning(false);
      answers[currentQuestionIndex] = codeSolutions[currentQuestionIndex];
      stopMediaStream(); exitFullScreen();
      navigate(`/admin/interview/results/${interviewId}`, {
        state: { questions, answers, title, company, cheatingDetected, cheatingReason: "Completed" },
      });
    }
  };

  // ── Code execution ─────────────────────────────────────────────────────────

  const JUDGE0_API_URL = "https://judge0-ce.p.rapidapi.com";
  const JUDGE0_HEADERS = {
    "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com",
    "X-RapidAPI-Key": "3d37918c6bmsh0cbc35934ed5233p1aeea3jsnaea159f596a2",
    "Content-Type": "application/json",
  };
  const LANGUAGE_IDS = { javascript: 63, python: 71, cpp: 54, java: 62 };

  const submitCode = async (code, languageId) => {
    try {
      const res = await fetch(`${JUDGE0_API_URL}/submissions`, {
        method: "POST", headers: JUDGE0_HEADERS,
        body: JSON.stringify({ source_code: code, language_id: languageId, stdin: "" }),
      });
      const { token } = await res.json();
      let result;
      for (let i = 0; i < 10; i++) {
        const check = await fetch(`${JUDGE0_API_URL}/submissions/${token}`, { method: "GET", headers: JUDGE0_HEADERS });
        result = await check.json();
        if (result.status.id > 2) break;
        await new Promise((r) => setTimeout(r, 1000));
      }
      const logs = [];
      if (result.compile_output) logs.push(["error", result.compile_output]);
      if (result.stdout) logs.push(["log", result.stdout]);
      if (result.stderr) logs.push(["error", result.stderr]);
      return { success: result.status.id === 3, error: result.status.description, logs };
    } catch (err) {
      return { success: false, error: "Execution service error: " + err.message, logs: [] };
    }
  };

  const runCode = async () => {
    const languageId = LANGUAGE_IDS[selectedLanguage];
    if (!languageId) return { success: false, error: "Unsupported language", logs: [] };
    return await submitCode(codeSolutions[currentQuestionIndex], languageId);
  };

  const formatTime = (s) =>
    `${Math.floor(s / 60).toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;

  const languageExtensions = { javascript: [javascript()], python: [python()], cpp: [cpp()], java: [java()] };

  // ── Render ─────────────────────────────────────────────────────────────────

  if (error) {
    return (
      <div className="flex flex-col h-screen bg-[#121212] text-[#E0E0E0] items-center justify-center">
        <div className="bg-red-900 text-red-100 p-4 rounded-lg flex items-center gap-3">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <div><h3 className="font-semibold">Error</h3><p>{error}</p></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-[#0D0D0D] text-[#E0E0E0]">

      {/* ── Header ── */}
      <div className="flex items-center justify-between px-6 py-3 bg-[#161616] border-b border-[#2C2C2C] gap-4">

        {/* Camera feed */}
        <div className="w-44 h-24 overflow-hidden rounded-md relative shrink-0">
          <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
          <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />
          {cameraError && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/80 text-red-400 text-xs text-center p-2">
              {cameraError}
            </div>
          )}
          {/* Proctoring dot overlay */}
          <div className="absolute top-1.5 right-1.5 flex items-center gap-1">
            <span className={`w-2 h-2 rounded-full ${proctorDot}`} title={proctorStatus} />
          </div>
        </div>

        {/* Centre — title + progress */}
        <div className="flex flex-col items-center gap-2 flex-1 min-w-0">
          <div className="flex items-center gap-3">
            <h2 className="text-base font-semibold text-white truncate">
              {company ? `${company} Interview` : "Interview"}
            </h2>
            {title && <span className="text-xs text-[#666] truncate hidden sm:block">· {title}</span>}
          </div>

          {/* Progress dots */}
          <div className="flex items-center gap-1.5">
            {questions.map((_, i) => (
              <div
                key={i}
                className={`rounded-full transition-all duration-300 ${
                  i < currentQuestionIndex
                    ? "w-2 h-2 bg-[#00B4D8]"
                    : i === currentQuestionIndex
                    ? "w-2.5 h-2.5 bg-[#00B4D8] ring-2 ring-[#00B4D8]/40"
                    : "w-2 h-2 bg-[#3C3C3C]"
                }`}
              />
            ))}
            <span className="ml-2 text-xs text-[#555] tabular-nums">
              {currentQuestionIndex + 1} / {questions.length}
            </span>
          </div>

          {/* Proctoring warning text — only shown when non-OK */}
          {warningCount > 0 && (
            <span className="text-xs text-yellow-400">
              Warnings: {warningCount}/{MAX_WARNINGS}
            </span>
          )}
        </div>

        {/* Timer */}
        <div className="flex flex-col items-end shrink-0">
          <span className="text-xs text-[#555] uppercase tracking-widest mb-0.5">Time Left</span>
          <span className={`text-3xl font-bold tabular-nums tracking-tight ${timerColor}`}>
            {formatTime(timeLeft)}
          </span>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="flex flex-1 overflow-hidden">

        {/* Left panel — question */}
        <div className="flex flex-col w-1/2 border-r border-[#2C2C2C]">

          {/* Tab bar */}
          <div className="flex border-b border-[#2C2C2C] bg-[#161616] shrink-0">
            <button
              onClick={() => setActiveTab("question")}
              className={`px-5 py-2.5 text-sm font-medium transition-colors border-b-2 ${
                activeTab === "question"
                  ? "text-[#00B4D8] border-[#00B4D8]"
                  : "text-[#666] border-transparent hover:text-[#B0B0B0]"
              }`}
            >
              {isCodingQuestion ? "Problem" : "Question"}
            </button>
            {isCodingQuestion && (
              <button
                onClick={() => setActiveTab("output")}
                className={`px-5 py-2.5 text-sm font-medium transition-colors border-b-2 ${
                  activeTab === "output"
                    ? "text-[#00B4D8] border-[#00B4D8]"
                    : "text-[#666] border-transparent hover:text-[#B0B0B0]"
                }`}
              >
                Output
              </button>
            )}

            {/* Dictate button in tab bar for behavioural questions */}
            {!isCodingQuestion && (
              <button
                onClick={handleDictate}
                className={`ml-auto mr-3 my-1.5 flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                  isSpeaking
                    ? "bg-[#00B4D8] text-black"
                    : "bg-[#2C2C2C] text-[#888] hover:text-white hover:bg-[#3C3C3C]"
                }`}
              >
                <Volume2 className="w-3.5 h-3.5" />
                {isSpeaking ? "Speaking…" : "Read aloud"}
              </button>
            )}
          </div>

          {/* Question body */}
          <div className="flex-1 overflow-y-auto p-6">
            {activeTab === "question" ? (
              <>
                {/* Question heading */}
                <div className="flex items-center gap-3 mb-5">
                  <span className="text-xs font-bold uppercase tracking-widest text-[#555]">
                    Q{currentQuestionIndex + 1}
                  </span>
                  {isCodingQuestion && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 font-medium">
                      Coding Challenge
                    </span>
                  )}
                  {isCodingQuestion && (
                    <button
                      onClick={handleDictate}
                      className={`ml-auto flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                        isSpeaking
                          ? "bg-[#00B4D8] text-black"
                          : "bg-[#2C2C2C] text-[#888] hover:text-white"
                      }`}
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                      {isSpeaking ? "Speaking…" : "Read aloud"}
                    </button>
                  )}
                </div>

                {/* Question content */}
                {isCodingQuestion ? (
                  <CodingQuestionView text={currentQuestion || ""} />
                ) : (
                  <div className="text-base text-slate-200 leading-relaxed">
                    {currentQuestion || "No question available"}
                  </div>
                )}
              </>
            ) : (
              /* Output tab */
              <div className="h-full bg-[#161616] rounded-lg border border-[#2C2C2C] p-4 font-mono text-sm overflow-y-auto">
                {output ? (
                  output.split("\n").map((line, i) => (
                    <div key={i} className={`py-0.5 ${
                      line.startsWith("❌") ? "text-red-400"
                      : line.startsWith("✅") ? "text-green-400"
                      : "text-slate-300"
                    }`}>{line}</div>
                  ))
                ) : (
                  <p className="text-[#555] text-center mt-6">Run your code to see output here</p>
                )}
              </div>
            )}
          </div>

          {/* Sticky footer — navigation button */}
          <div className="shrink-0 px-6 py-4 border-t border-[#2C2C2C] bg-[#161616]">
            {currentQuestionIndex !== questions.length - 1 ? (
              <button
                onClick={moveToNextQuestion}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#00B4D8] hover:bg-[#009bb8] text-black font-semibold rounded-lg transition duration-200 text-sm"
              >
                Next Question <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <Dialog>
                <DialogTrigger asChild>
                  <button className="w-full flex items-center justify-center gap-2 py-2.5 bg-green-500 hover:bg-green-600 text-black font-semibold rounded-lg transition duration-200 text-sm">
                    <CheckCircle className="w-4 h-4" /> Finish Interview
                  </button>
                </DialogTrigger>
                <DialogContent className="bg-[#1E1E1E] border-[#3C3C3C] text-white">
                  <DialogHeader>
                    <DialogTitle className="text-white">Finish interview?</DialogTitle>
                    <DialogDescription className="text-[#888]">
                      This action cannot be undone. Your answers will be submitted for evaluation.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="flex gap-3 mt-2">
                    <Button onClick={moveToNextQuestion} className="flex-1 bg-green-500 hover:bg-green-600 text-black font-semibold">
                      Submit
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>

        {/* Right panel — answer / editor */}
        <div className="w-1/2 flex flex-col bg-[#0D0D0D]">
          {isCodingQuestion ? (
            <>
              {/* Editor toolbar */}
              <div className="flex items-center justify-between px-3 py-2 bg-[#161616] border-b border-[#2C2C2C] shrink-0">
                <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                  <SelectTrigger className="w-36 h-8 text-xs bg-[#2C2C2C] border-[#3C3C3C] text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#2C2C2C] border-[#3C3C3C] text-white">
                    <SelectItem value="javascript">JavaScript</SelectItem>
                    <SelectItem value="python">Python</SelectItem>
                    <SelectItem value="java">Java</SelectItem>
                    <SelectItem value="cpp">C++</SelectItem>
                  </SelectContent>
                </Select>

                <button
                  onClick={async () => {
                    setIsExecuting(true);
                    try {
                      const result = await runCode();
                      setOutput(result.logs.map(([t, m]) => `${t === "error" ? "❌" : "✅"} ${m}`).join("\n"));
                      setActiveTab("output");
                    } catch (err) {
                      setOutput(`❌ Error: ${err.message}`);
                    } finally {
                      setIsExecuting(false);
                    }
                  }}
                  disabled={isExecuting}
                  className={`flex items-center gap-1.5 px-4 py-1.5 rounded-md text-xs font-semibold transition duration-200 ${
                    isExecuting
                      ? "bg-[#2C2C2C] text-[#555] cursor-not-allowed"
                      : "bg-[#27BA41] hover:bg-[#22a037] text-white"
                  }`}
                >
                  <Play className="w-3 h-3" />
                  {isExecuting ? "Running…" : "Run Code"}
                </button>
              </div>

              {/* Editor */}
              <div className="flex-1 overflow-hidden">
                <CodeMirror
                  value={codeSolutions[currentQuestionIndex]}
                  height="100%"
                  extensions={languageExtensions[selectedLanguage] || languageExtensions.javascript}
                  theme={oneDark}
                  onChange={saveCodeSolution}
                  style={{ height: "100%" }}
                />
              </div>
            </>
          ) : (
            /* Mic visualizer panel */
            <>
              <div className="px-5 py-3 bg-[#161616] border-b border-[#2C2C2C] shrink-0">
                <p className="text-xs font-semibold uppercase tracking-widest text-[#555]">Your Answer</p>
              </div>
              <div className="flex-1">
                <MicVisualizer listening={listening} isSpeaking={isSpeaking} />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Error boundary ───────────────────────────────────────────────────────────

class InterviewErrorBoundary extends React.Component {
  state = { hasError: false, errorMessage: "" };
  static getDerivedStateFromError(error) { return { hasError: true, errorMessage: error.message }; }
  componentDidCatch(error, info) { console.error("Interview error:", error, info); }
  render() {
    if (this.state.hasError) {
      return (
        <div className="flex h-screen bg-[#121212] text-[#E0E0E0] items-center justify-center">
          <div className="bg-red-900 text-red-100 p-5 rounded-xl flex items-start gap-3 max-w-md">
            <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold mb-1">Something went wrong</h3>
              <p className="text-sm opacity-80">{this.state.errorMessage}</p>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function InterviewPageWrapper() {
  return <InterviewErrorBoundary><MyInterviewPage /></InterviewErrorBoundary>;
}
