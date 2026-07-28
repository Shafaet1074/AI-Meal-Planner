"use client";
import React from "react";
import { motion } from "framer-motion";
import { Target, Dumbbell, Wand2, Utensils } from "lucide-react";

export default function HowItWorks() {
  const steps = [
    {
      icon: <Target className="text-emerald-600 dark:text-emerald-400 h-6 w-6" />,
      title: "Set Your Target",
      description:
        "Input your current weight, activity level, and primary goal—whether you want to cut body fat, maintain, or lean bulk. We'll calculate your exact daily calorie and macro targets.",
    },
    {
      icon: <Dumbbell className="text-emerald-600 dark:text-emerald-400 h-6 w-6" />,
      title: "Log Your Gym Session",
      description:
        "Put in the work on the gym floor and log your active calories burned. Your daily nutrition allowance will automatically increase to reflect your energy expenditure.",
    },
    {
      icon: <Wand2 className="text-emerald-600 dark:text-emerald-400 h-6 w-6" />,
      title: "Generate Your Meal",
      description:
        "Use one of your 3 free daily AI generations. Tell the AI what you're craving or what ingredients you have, and it will instantly craft a recipe that perfectly fills your remaining macros.",
    },
    {
      icon: <Utensils className="text-emerald-600 dark:text-emerald-400 h-6 w-6" />,
      title: "Cook, Eat & Track",
      description:
        "Follow the simple, step-by-step recipe instructions. Once you're done eating, hit 'Log Meal' to automatically track your calories and watch your progress compound.",
    },
  ];

  return (
    <section id="how-it-works" className="py-24 sm:py-32 bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 sm:mb-24">
          <h2 className="text-sm font-bold tracking-wide text-emerald-600 dark:text-emerald-400 uppercase mb-3 transition-colors">
            How It Works
          </h2>
          <p className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white mb-5 tracking-tight transition-colors">
            From the gym floor to your kitchen.
          </p>
          <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-400 leading-relaxed font-light transition-colors">
            No more guessing what to eat after a hard workout. Here is how you use the app to guarantee you hit your goals every single day.
          </p>
        </div>

        {/* Timeline Layout */}
        <div className="max-w-4xl mx-auto relative">
          
          {/* Vertical Connecting Line */}
          <div className="absolute left-[39px] sm:left-[47px] top-6 bottom-6 w-0.5 bg-slate-200 dark:bg-slate-800 transition-colors duration-300"></div>

          <div className="space-y-12 sm:space-y-16">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.15 }}
                viewport={{ once: true, margin: "-100px" }}
                className="relative flex items-start gap-6 sm:gap-10 group"
              >
                {/* Icon Node */}
                <div className="relative z-10 flex-shrink-0 flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
                  <div className="flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 shadow-sm group-hover:border-emerald-500/50 dark:group-hover:border-emerald-500/50 group-hover:shadow-emerald-500/20 transition-all duration-300">
                    {step.icon}
                  </div>
                </div>

                {/* Content Card */}
                <div className="flex-1 pt-3 sm:pt-5">
                  <div className="bg-white dark:bg-slate-900/50 rounded-2xl p-6 sm:p-8 border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-emerald-500/30 dark:hover:border-emerald-500/30 dark:hover:bg-slate-900 transition-all duration-300">
                    <div className="flex items-center gap-4 mb-3">
                      <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 font-bold text-sm transition-colors">
                        {index + 1}
                      </span>
                      <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white transition-colors">
                        {step.title}
                      </h3>
                    </div>
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed font-light transition-colors">
                      {step.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}