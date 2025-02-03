import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Quote } from "lucide-react";

const testimonials = [
  {
    name: "Vipul Khandelwal",
    role: "Software Engineer at Google",
    content:
      "MetaHire's AI mock interviews helped me prepare for tough technical questions. The personalized feedback was invaluable in landing my dream job.",
    avatar:
      "https://media.licdn.com/dms/image/v2/D5603AQG05GoiixW1HQ/profile-displayphoto-shrink_400_400/profile-displayphoto-shrink_400_400/0/1729890286248?e=1744243200&v=beta&t=sFaX2LtiIGpFYRpXLGs06hjRO-2U4gTXsYSqFuOtDxA",
  },
  {
    name: "Pratyush Ojha",
    role: "Machine Learning Engineer at Adiyog Tech pvt.ltd",
    content:
      "The resume analysis feature gave me insights I never would have considered. It completely transformed my approach to interviews.",
    avatar:
      "https://media.licdn.com/dms/image/v2/D5603AQG-6dyFmwLoXg/profile-displayphoto-shrink_400_400/profile-displayphoto-shrink_400_400/0/1726308272507?e=1744243200&v=beta&t=GuijiAnSsraWCRqirj6XkWM0Z1lnaUjVBjTyN2kTL_U",
  },
  {
    name: "Dev Goyal",
    role: "Brand ambassador at SwapSo",
    content:
      "The domain-specific questions were spot-on. MetaHire helped me gain confidence and improve my technical communication skills.",
    avatar:
      "https://media.licdn.com/dms/image/v2/D4D03AQH7ez59ovGX7w/profile-displayphoto-shrink_100_100/profile-displayphoto-shrink_100_100/0/1694972916773?e=1744243200&v=beta&t=iek16m7-q2D5dr2zTOyqL-fnuDfrNOzFLO8QxXj6j4w",
  },
];

const TestimonialSection = () => {
  return (
    <section className="py-16   my-20 font-mainFont">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-5xl font-bold text-blue-600">
            Success Stories
          </h2>
          <p className="text-lg lg:text-xl text-gray-300 mt-4">
            Hear from professionals who transformed their interview experience
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
            >
              <Card className="bg-black bg-opacity-50 border-none shadow-lg shadow-blue-700 h-full">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <img
                      src={testimonial.avatar}
                      alt={testimonial.name}
                      className="w-12 h-12 rounded-full mr-4"
                    />
                    <div>
                      <h3 className="text-blue-300 font-semibold">
                        {testimonial.name}
                      </h3>
                      <p className="text-gray-400 text-sm">
                        {testimonial.role}
                      </p>
                    </div>
                  </div>
                  <div className="relative">
                    {/* <Quote className="absolute -top-2 -left-2 w-8 h-8 text-blue-600/20" /> */}
                    <p className="text-gray-300 relative z-10 pl-6">
                      "{testimonial.content}"
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialSection;
