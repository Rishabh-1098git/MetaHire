import React, { useState, useEffect } from "react";
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

const CodeEditor = ({
  currentQuestionIndex,
  questionsLength,
  codeSolutions,
  saveCodeSolution,
  handleCodeExecution,
  isExecuting,
  transcript,
}) => {
  const [selectedLanguage, setSelectedLanguage] = useState("javascript");
  const {
    transcript: speechTranscript,
    resetTranscript,
    browserSupportsSpeechRecognition,
  } = useSpeechRecognition();

  const languageExtensions = {
    javascript: [javascript()],
    python: [python()],
    cpp: [cpp()],
    java: [java()],
  };

  const getLanguageExtension = () =>
    languageExtensions[selectedLanguage] || languageExtensions.javascript;

  useEffect(() => {
    if (
      currentQuestionIndex < questionsLength - 2 &&
      browserSupportsSpeechRecognition
    ) {
      SpeechRecognition.startListening({ continuous: true, language: "en-US" });
    } else {
      SpeechRecognition.stopListening();
    }
    return () => SpeechRecognition.stopListening();
  }, [currentQuestionIndex, questionsLength]);

  return (
    <div className="w-1/2 bg-[#121212] p-2 flex flex-col h-full">
      {currentQuestionIndex >= questionsLength - 2 ? (
        <div className="flex flex-col h-full">
          <div className="mb-2">
            <Select
              value={selectedLanguage}
              onValueChange={setSelectedLanguage}
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
              onChange={saveCodeSolution}
              className="rounded-lg border border-[#2C2C2C]"
            />
          </div>
          <button
            onClick={() =>
              handleCodeExecution(
                codeSolutions[currentQuestionIndex],
                selectedLanguage
              )
            }
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
            {speechTranscript || transcript || "Start speaking your answer..."}
          </div>
        </div>
      )}
    </div>
  );
};

export default CodeEditor;
