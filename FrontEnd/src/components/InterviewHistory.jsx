import React from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";

function InterviewHistory() {
  const Interviews = [
    {
      title: "Frontend Developer",
      date: "2022-01-01",
      company: "Google Inc",
      interviewId: "rstp456d",
    },
    {
      title: "Frontend Developer",
      date: "2022-01-02",
      company: "Meta",
      interviewId: "rstp446d",
    },
    {
      title: "Backend Developer",
      date: "2022-02-03",
      company: "Infosys ",
      interviewId: "vd4iji53",
    },
    {
      title: "Software Developer",
      date: "2022-01-05",
      company: "Google Inc",
      interviewId: "knodsh67",
    },
    {
      title: "Frontend Developer",
      date: "2022-01-9",
      company: "TCS",
      interviewId: "upi6784d",
    },
  ];

  return (
    <Card className="w-full h-full mx-auto bg-black font-mainFont p-6 text-white">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">
          Previous Interviews
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Interviews.map((interview) => (
            <Card
              key={interview.interviewId}
              className="w-full bg-black border-white"
            >
              <CardHeader>
                <CardTitle className="text-lg font-semibold">
                  {interview.title}
                </CardTitle>
                <p className="text-sm text-gray-400">{interview.company}</p>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-300">Date: {interview.date}</p>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button size="sm">View Results</Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default InterviewHistory;
