import {
  VerticalTimeline,
  VerticalTimelineElement,
} from "react-vertical-timeline-component";
import "react-vertical-timeline-component/style.min.css";
import {
  FaUserPlus,
  FaClipboardList,
  FaVideo,
  FaChartLine,
  FaComments,
} from "react-icons/fa";
import React from "react";

export default function Roadmap() {
  return (
    <section className="py-16 ">
      <div className="text-center mb-12">
        <h2 className="text-3xl lg:text-5xl font-bold text-blue-600">
          How It Works
        </h2>
        <p className="text-lg lg:text-xl text-gray-300 mt-4">
          Your guide to navigating the interview process effortlessly!
        </p>
      </div>
      <div className="max-w-7xl mx-auto px-6">
        <VerticalTimeline lineColor="hsl(var(--border))">
          {/* Step 1 */}
          <VerticalTimelineElement
            className="vertical-timeline-element--work "
            contentStyle={{
              background: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              boxShadow:
                "0 4px 15px -1px rgba(29, 78, 246, 0.6), 0 2px 8px -2px rgba(29, 78, 246, 0.6)",
              borderRadius: "var(--radius)",
              padding: "1.5rem",
            }}
            contentArrowStyle={{
              borderRight: "7px solid hsl(var(--border))",
            }}
            iconStyle={{ background: "#00bcd4", color: "#fff" }}
            icon={<FaUserPlus />}
          >
            <h3 className="vertical-timeline-element-title text-xl font-bold text-foreground">
              Step 1: Sign Up
            </h3>
            <p className="text-muted-foreground mt-2">
              Create your account to get started with the interview process.
            </p>
          </VerticalTimelineElement>

          {/* Step 2 */}
          <VerticalTimelineElement
            className="vertical-timeline-element--work"
            contentStyle={{
              background: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              boxShadow:
                "0 4px 15px -1px rgba(29, 78, 246, 0.6), 0 2px 8px -2px rgba(29, 78, 246, 0.6)",
              borderRadius: "var(--radius)",
              padding: "1.5rem",
            }}
            contentArrowStyle={{
              borderRight: "7px solid hsl(var(--border))",
            }}
            iconStyle={{ background: "#f7b52d", color: "#fff" }}
            icon={<FaClipboardList />}
          >
            <h3 className="vertical-timeline-element-title text-xl font-bold text-foreground">
              Step 2: Create Meeting
            </h3>
            <p className="text-muted-foreground mt-2">
              Schedule your interview session at a time that works best for you.
            </p>
          </VerticalTimelineElement>

          {/* Step 3 */}
          <VerticalTimelineElement
            className="vertical-timeline-element--work"
            contentStyle={{
              background: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              boxShadow:
                "0 4px 15px -1px rgba(29, 78, 246, 0.6), 0 2px 8px -2px rgba(29, 78, 246, 0.6)",
              borderRadius: "var(--radius)",
              padding: "1.5rem",
            }}
            contentArrowStyle={{
              borderRight: "7px solid hsl(var(--border))",
            }}
            iconStyle={{ background: "#ff6f6f", color: "#fff" }}
            icon={<FaVideo />}
          >
            <h3 className="vertical-timeline-element-title text-xl font-bold text-foreground">
              Step 3: Attend Interview
            </h3>
            <p className="text-muted-foreground mt-2">
              Join the virtual interview with your recruiter or panel members.
            </p>
          </VerticalTimelineElement>

          {/* Step 4 */}
          <VerticalTimelineElement
            className="vertical-timeline-element--work"
            contentStyle={{
              background: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              boxShadow:
                "0 4px 15px -1px rgba(29, 78, 246, 0.6), 0 2px 8px -2px rgba(29, 78, 246, 0.6)",
              padding: "1.5rem",
            }}
            contentArrowStyle={{
              borderRight: "7px solid hsl(var(--border))",
            }}
            iconStyle={{ background: "#4caf50", color: "#fff" }}
            icon={<FaChartLine />}
          >
            <h3 className="vertical-timeline-element-title text-xl font-bold text-foreground">
              Step 4: Review Results
            </h3>
            <p className="text-muted-foreground mt-2">
              Get insights into your interview performance and next steps.
            </p>
          </VerticalTimelineElement>

          {/* Step 5 */}
          <VerticalTimelineElement
            className="vertical-timeline-element--work"
            contentStyle={{
              background: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              boxShadow:
                "0 4px 15px -1px rgba(29, 78, 246, 0.6), 0 2px 8px -2px rgba(29, 78, 246, 0.6)",
              borderRadius: "var(--radius)",
              padding: "1.5rem",
            }}
            contentArrowStyle={{
              borderRight: "7px solid hsl(var(--border))",
            }}
            iconStyle={{ background: "#7952b3", color: "#fff" }}
            icon={<FaComments />}
          >
            <h3 className="vertical-timeline-element-title text-xl font-bold text-foreground">
              Step 5: Receive Feedback
            </h3>
            <p className="text-muted-foreground mt-2">
              Access detailed feedback to improve for future opportunities.
            </p>
          </VerticalTimelineElement>
        </VerticalTimeline>
      </div>
    </section>
  );
}
