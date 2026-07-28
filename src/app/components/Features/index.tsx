"use client";
import React from "react";
import { Utensils, Flame, Zap } from "lucide-react";

export default function Features() {
  const features = [
    {
      icon: <Utensils className="h-6 w-6 text-emerald-600 dark:text-emerald-400 transition-colors" />,
      title: "Goal-Driven Meal AI",
      description:
        "Whether you're cutting body fat or lean bulking, our AI generates hyper-personalized meal plans that perfectly hit your exact macro and daily calorie targets.",
    },
    {
      icon: <Flame className="h-6 w-6 text-emerald-600 dark:text-emerald-400 transition-colors" />,
      title: "Dynamic Calorie Sync",
      description:
        "Log your food intake and sync your heavy lifting sessions. Watch your daily calorie allowance adjust in real-time based on exactly how much energy you've burned today.",
    },
    {
      icon: <Zap className="h-6 w-6 text-emerald-600 dark:text-emerald-400 transition-colors" />,
      title: "3 Free Uses Every Day",
      description:
        "Your gym provides you with 3 free AI meal generations every single day. Love the results? Upgrade your account anytime for unlimited, infinite recipe variations.",
    }
  ];

  return (
    <section id="features" className="py-24 sm:py-32 bg-white dark:bg-slate-950 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 sm:mb-20">
          <h2 className="text-sm font-bold tracking-wide text-emerald-600 dark:text-emerald-400 uppercase mb-3 transition-colors">
            Member Benefits
          </h2>
          <p className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white mb-5 tracking-tight transition-colors">
            Everything you need to hit your macro goals.
          </p>
          <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-400 leading-relaxed font-light transition-colors">
            Track your workouts, log your meals, and let our AI handle the math so you can focus entirely on the heavy lifting.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="group relative bg-slate-50 dark:bg-slate-900/50 rounded-2xl p-8 border border-slate-100 dark:border-slate-800 hover:bg-white dark:hover:bg-slate-900 hover:border-emerald-500/30 dark:hover:border-emerald-500/30 hover:shadow-xl hover:shadow-emerald-900/5 dark:hover:shadow-emerald-900/20 transition-all duration-300"
            >
              {/* Icon Container */}
              <div className="mb-6 inline-flex items-center justify-center p-3 bg-white dark:bg-slate-950 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 group-hover:border-emerald-500/50 dark:group-hover:border-emerald-500/50 group-hover:bg-emerald-50 dark:group-hover:bg-emerald-950/30 transition-colors duration-300">
                {feature.icon}
              </div>
              
              {/* Content */}
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3 transition-colors">
                {feature.title}
              </h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed transition-colors font-light">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}