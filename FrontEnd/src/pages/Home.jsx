import React, { memo } from "react";
import { motion, useReducedMotion } from "framer-motion";
import Roadmap from "../components/RoadMap";
import ResumeImage from "../assets/Resume.png";
import FeedbackImage from "../assets/Feedback.png";
import MockInterviewImage from "../assets/MockInterview.png";
import Header from "../components/Header";
import { useNavigate } from "react-router-dom";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../components/ui/accordion";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowRight } from "lucide-react";
export default function Home() {
  const navigate = useNavigate();
  const shouldReduceMotion = useReducedMotion();
  const links = [
    { label: "Home", href: "/" },
    { label: "Features", href: "/features" },
    {
      label: "Services",
    },
    { label: "Contact", href: "/contact" },
  ];

  return (
    <div className=" text-gray-800 font-mainFont">
      <div className="relative z-50">
        <Header links={links} logo="MockAI" className="sticky top-0" />
      </div>
      {/* Hero Section */}
      <section className="relative text-white h-screen flex items-center justify-center ">
        <motion.div
          className="text-center will-change-transform"
          initial={{
            opacity: shouldReduceMotion ? 1 : 0,
            scale: shouldReduceMotion ? 1 : 0.8,
          }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1 }}
        >
          <h1 className="text-5xl lg:text-7xl font-bold mb-6 text-blue-600">
            Welcome to MockAI
          </h1>
          <p className="text-lg lg:text-2xl mb-6">
            Master your interviews with AI-powered tools and insights.
          </p>
          <button
            className="bg-black shadow-lg shadow-blue-900 text-blue-300 font-bold py-3 px-6 rounded-full  hover:shadow-blue-950 transition-all "
            onClick={() => navigate("/signingsignup")}
          >
            <div className="flex items-center justify-center position-relative">
              Get Started <ArrowRight size={24} className="ml-2" />
            </div>
          </button>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="py-16 text-white my-10">
        <div className="text-center mb-24">
          <h2 className="text-3xl lg:text-5xl font-bold text-blue-600">
            Our Features
          </h2>
          <p className="text-lg lg:text-xl text-gray-300 mt-8">
            Everything you need to ace your next interview.
          </p>
        </div>
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 px-6">
          {[
            {
              imgSrc: ResumeImage,
              title: "Upload Your Resume",
              description:
                "Get AI-driven analysis of your resume to ensure it stands out.",
            },
            {
              imgSrc: MockInterviewImage,
              title: "Mock Interviews",
              description:
                "Simulate real interviews with our AI to improve your performance.",
            },
            {
              imgSrc: FeedbackImage,
              title: "Get Feedback",
              description:
                "Receive actionable feedback to refine your interview skills.",
            },
          ].map((feature, index) => (
            <Card
              key={index}
              className="hover:shadow-lg hover:scale-105 transition-transform duration-900 ease-out bg-black bg-opacity-50 shadow-blue-500 shadow-md sha"
            >
              <CardHeader className="text-center">
                <img
                  src={feature.imgSrc}
                  alt={feature.title}
                  className="w-full h-40 object-cover rounded-md mb-4"
                />
                <CardTitle className="text-xl font-semibold font-mainFont text-blue-300">
                  {feature.title}
                </CardTitle>
                <CardDescription className="text-base text-gray-300">
                  {feature.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center text-gray-700 text-sm">
                {/* Add additional content if necessary */}
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* AI Assistance Section */}
      <section className="py-16 my-32">
        <div className="text-center mb-32">
          <h2 className="text-3xl lg:text-5xl font-bold text-blue-600">
            Personalized AI Assistance
          </h2>
          <p className="text-lg lg:text-xl text-gray-300 mt-4">
            Leverage cutting-edge AI to analyze and improve your performance.
          </p>
        </div>
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-wrap lg:flex-nowrap lg:overflow-x-auto lg:space-x-12">
            {[
              {
                title: "Resume based Interview",
                img: "https://img.freepik.com/free-photo/resumes-desk_144627-43372.jpg?t=st=1737475333~exp=1737478933~hmac=eca09a50e37253eae724204308e8ff3ba22f9fdc1aa6f1178a2930773593f478&w=360",
              },
              {
                title: "Domain-Specific Questions",
                img: "https://img.freepik.com/free-vector/ai-technology-microchip-background-vector-digital-transformation-concept_53876-112222.jpg?t=st=1737474757~exp=1737478357~hmac=f52ba31fe3f409114df12838db983327c08c71681847712dedcac289a962bbd9&w=740",
              },
              {
                title: "Real-Time Feedback",
                img: "https://img.freepik.com/free-vector/organic-flat-feedback-concept_23-2148959061.jpg?t=st=1737474801~exp=1737478401~hmac=42917fb136d79fc9382d7105512919e1343bae63487173818559f737226b64a1&w=740",
              },
              {
                title: "AI based Scoring ",
                img: "https://img.freepik.com/free-vector/business-mission-concept-illustration_114360-7295.jpg?t=st=1737474777~exp=1737478377~hmac=3d372f36fc0941bfffaf9785cf025d5cb5937381fb4fd052d4835d8bafc9d602&w=996",
              },
              {
                title: "Confidence Building",
                img: "https://img.freepik.com/premium-vector/business-power-concept-strong-businessman-inner-strength_8140-424.jpg?w=740",
              },
            ].map((item, index) => (
              <div
                key={index}
                className="flex flex-col items-center mb-8 lg:mb-0"
                initial={{
                  opacity: shouldReduceMotion ? 1 : 0,
                  y: shouldReduceMotion ? 0 : 50,
                }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 * index }}
              >
                <div className="w-48 h-48 rounded-full mb-12 transition-transform duration-300 ease-out overflow-hidden shadow-lg shadow-blue-500 hover:shadow-lg ">
                  <img
                    src={item.img}
                    alt={item.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
                <h3 className="text-lg font-semibold text-center mb-2 text-gray-300">
                  {item.title}
                </h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16">
        <Roadmap />
      </section>

      <section className="py-16 flex justify-center items-center">
        <div className="py-16 w-[90%] max-w-4xl">
          <h2 className="text-3xl lg:text-5xl font-bold text-blue-600 mb-12 text-center">
            FYQS
          </h2>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger className="text-gray-200">
                Is it accessible?
              </AccordionTrigger>
              <AccordionContent className="text-gray-300">
                Yes. It adheres to the WAI-ARIA design pattern.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger className="text-gray-200">
                Is it styled?
              </AccordionTrigger>
              <AccordionContent className="text-gray-200">
                Yes. It comes with default styles that matches the other
                components&apos; aesthetic.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
              <AccordionTrigger className="text-gray-200">
                Is it animated?
              </AccordionTrigger>
              <AccordionContent className="text-gray-200">
                Yes. It's animated by default, but you can disable it if you
                prefer.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>

      {/* Footer */}
      <footer
        className=" text-white py-6 z-50"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(106, 17, 203, 0.8), rgba(37, 117, 252, 0.9))",
        }}
      >
        <div className="text-center">
          <p>© 2024 MockAI - All Rights Reserved</p>
        </div>
      </footer>
    </div>
  );
}
