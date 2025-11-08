"use client";
import { motion } from "framer-motion";
import { FaUserPlus, FaRobot, FaUtensils, FaChartLine } from "react-icons/fa";

export default function HowItWorks() {
  const steps = [
    {
      icon: <FaUserPlus className="text-green-500 text-3xl" />,
      title: "Create Your Profile",
      description:
        "Sign up and set your personal health goals, preferences, and dietary restrictions to get started.",
    },
    {
      icon: <FaRobot className="text-green-500 text-3xl" />,
      title: "AI Meal Suggestions",
      description:
        "Our AI analyzes your data to generate personalized meal plans that align with your goals.",
    },
    {
      icon: <FaUtensils className="text-green-500 text-3xl" />,
      title: "Track Your Meals",
      description:
        "Easily log your meals daily to keep track of what you eat and maintain consistency.",
    },
    {
      icon: <FaChartLine className="text-green-500 text-3xl" />,
      title: "Analyze Your Progress",
      description:
        "Visualize your progress through insights and nutrition trends to improve your habits.",
    },
  ];

  return (
    <section id="how-it-works" className="py-24 bg-gradient-to-b from-white to-green-50">
      <div className="max-w-5xl mx-auto px-6">
        <h2 className="text-4xl font-bold text-center text-gray-800 mb-16">
          How It <span className="text-green-600">Works</span>
        </h2>

        <div className="relative border-l-2 border-green-200 pl-8 space-y-12">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.2 }}
              viewport={{ once: true }}
              className="relative"
            >
              {/* Icon Circle */}
            <div className="absolute left-[calc(53px*-1)] flex items-center justify-center w-10 h-10 bg-white border-2 border-green-400 rounded-full shadow-md">
              {step.icon}
            </div>


              {/* Content */}
              <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-all duration-300 mt-20">
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  {index + 1}. {step.title}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {step.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
