import React, { memo, useEffect } from "react";
import { motion, useReducedMotion } from "framer-motion";
import Roadmap from "../components/Roadmap";
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
import TestimonialSection from "../components/TestimonialSection";

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

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      navigate("/admin");
    }
  }, [navigate]);

  return (
    <div className="text-gray-800 font-mainFont">
      {/* Header - Already responsive from previous implementation */}
      <div className="relative z-50">
        <Header links={links} logo="MetaHire" className="sticky top-0" />
      </div>

      {/* Hero Section - Mobile Optimization */}
      <section className="relative text-white h-screen flex items-center justify-center px-4">
        <motion.div
          className="text-center will-change-transform"
          initial={{
            opacity: shouldReduceMotion ? 1 : 0,
            scale: shouldReduceMotion ? 1 : 0.8,
          }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1 }}
        >
          <h1 className="text-3xl sm:text-5xl lg:text-7xl font-bold mb-4 text-blue-600">
            Welcome to MetaHire
          </h1>
          <p className="text-base sm:text-lg lg:text-2xl mb-6 px-2">
            Master your interviews with AI-powered tools and insights.
          </p>
          <button
            className="bg-black shadow-lg shadow-blue-900 text-blue-300 font-bold py-2 px-4 sm:py-3 sm:px-6 rounded-full hover:shadow-blue-950 transition-all bg-opacity-60"
            onClick={() => navigate("/signingsignup")}
          >
            <div className="flex items-center justify-center">
              Get Started <ArrowRight size={20} className="ml-2" />
            </div>
          </button>
        </motion.div>
      </section>

      {/* Features Section - Mobile Grid */}
      <section className="py-16 text-white my-10">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl lg:text-5xl font-bold text-blue-600">
            Our Features
          </h2>
          <p className="text-sm sm:text-lg lg:text-xl text-gray-300 mt-4 px-4">
            Everything you need to ace your next interview.
          </p>
        </div>
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 px-4">
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
              className="hover:shadow-lg hover:scale-105 transition-transform duration-900 ease-out bg-black bg-opacity-50 shadow-blue-500 shadow-md"
            >
              <CardHeader className="text-center">
                <img
                  src={feature.imgSrc}
                  alt={feature.title}
                  className="w-full h-40 object-cover rounded-md mb-4"
                />
                <CardTitle className="text-lg sm:text-xl font-semibold font-mainFont text-blue-300">
                  {feature.title}
                </CardTitle>
                <CardDescription className="text-xs sm:text-base text-gray-300">
                  {feature.description}
                </CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>

      {/* AI Assistance Section - Mobile Flex */}
      <section className="py-16 my-16">
        <div className="text-center mb-16">
          <h2 className="text-2xl sm:text-3xl lg:text-5xl font-bold text-blue-600">
            Personalized AI Assistance
          </h2>
          <p className="text-sm sm:text-lg lg:text-xl text-gray-300 mt-4 px-4">
            Leverage cutting-edge AI to analyze and improve your performance.
          </p>
        </div>
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
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
                title: "AI based Scoring",
                img: "https://img.freepik.com/free-vector/business-mission-concept-illustration_114360-7295.jpg?t=st=1737474777~exp=1737478377~hmac=3d372f36fc0941bfffaf9785cf025d5cb5937381fb4fd052d4835d8bafc9d602&w=996",
              },
              {
                title: "Confidence Building",
                img: "https://img.freepik.com/premium-vector/business-power-concept-strong-businessman-inner-strength_8140-424.jpg?w=740",
              },
            ].map((item, index) => (
              <div key={index} className="flex flex-col items-center mb-4">
                <div className="w-24 h-24 sm:w-36 sm:h-36 lg:w-48 lg:h-48 rounded-full mb-4 transition-transform duration-300 ease-out overflow-hidden shadow-lg shadow-blue-500 hover:shadow-lg">
                  <img
                    src={item.img}
                    alt={item.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
                <h3 className="text-xs sm:text-sm lg:text-lg font-semibold text-center text-gray-300">
                  {item.title}
                </h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Roadmap Section */}
      <section className="py-16">
        <Roadmap />
      </section>

      <TestimonialSection />

      {/* FAQ Section - Mobile Optimization */}
      <section className="py-16 flex justify-center items-center px-4">
        <div className="py-16 w-full max-w-4xl">
          <h2 className="text-2xl sm:text-3xl lg:text-5xl font-bold text-blue-600 mb-8 text-center">
            FYQS
          </h2>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger className="text-gray-200 text-sm sm:text-base">
                What is MetaHire?
              </AccordionTrigger>
              <AccordionContent className="text-xs sm:text-sm text-gray-300">
                MetaHire is an AI-powered interview platform where users can log
                in, upload their resumes, and take AI-generated mock interviews.
                The AI evaluates the responses and provides detailed feedback to
                help improve your performance.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger className="text-gray-200 text-sm sm:text-base">
                Will my resume be stored securely?
              </AccordionTrigger>
              <AccordionContent className="text-xs sm:text-sm text-gray-200">
                Yes, we prioritize data privacy and security. Your resume is
                stored securely and is only used to personalize your interview
                experience.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
              <AccordionTrigger className="text-gray-200 text-sm sm:text-base">
                Can I customize my interview experience?
              </AccordionTrigger>
              <AccordionContent className="text-xs sm:text-sm text-gray-200">
                Yes! You can customize your interview type, difficulty level,
                and preferred question topics based on your career goals.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>

      {/* Footer - Mobile Optimization */}
      <footer
        className="text-white py-4 z-50"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(106, 17, 203, 0.8), rgba(37, 117, 252, 0.9))",
        }}
      >
        <div className="text-center text-xs sm:text-sm">
          <p>© 2025 MetaHire - All Rights Reserved</p>
        </div>
      </footer>
    </div>
  );
}
