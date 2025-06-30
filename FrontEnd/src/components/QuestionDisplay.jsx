import React from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const QuestionDisplay = ({
  currentQuestion,
  currentQuestionIndex,
  questionsLength,
  activeTab,
  setActiveTab,
  output,
  moveToNextQuestion,
}) => {
  return (
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
        {currentQuestionIndex >= questionsLength - 2 && (
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
              {currentQuestion}
            </div>
            <div className="mt-4 text-center">
              {currentQuestionIndex !== questionsLength - 1 ? (
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
  );
};

export default QuestionDisplay;
