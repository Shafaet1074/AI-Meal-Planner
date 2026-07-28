"use client";
import React, { useState } from "react";
// Removed Image since we are using pure UI components now
import { ArrowRight, Flame, Target, Zap, Bot, Activity } from "lucide-react";

export default function Hero() {
  const [email, setEmail] = useState("");

  const handleLeadCapture = (e) => {
    e.preventDefault();
    console.log("Member signed up with:", email);
  };

  return (
    <section className="relative min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center overflow-hidden pt-24 pb-12 transition-colors duration-300">
      
      {/* Ambient AI Background Effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[600px] opacity-10 dark:opacity-20 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-500 via-transparent to-transparent pointer-events-none"></div>
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] dark:opacity-5 mix-blend-overlay pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row items-center gap-16 relative z-10 w-full">
        
        {/* Left Content Section */}
        <div className="lg:w-[55%] space-y-8 text-center lg:text-left">
          
          {/* Consumer Hook Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-emerald-100 text-emerald-600 dark:bg-slate-900 dark:border-slate-800 dark:text-emerald-400 text-xs font-semibold uppercase tracking-wider shadow-sm dark:shadow-none transition-colors">
            <Flame className="h-3.5 w-3.5" fill="currentColor" />
            Provided by your local gym
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-[1.15] transition-colors">
            Your personal AI dietitian for <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-cyan-600 dark:from-emerald-400 dark:to-cyan-400">every calorie.</span>
          </h1>

          <p className="text-slate-600 dark:text-slate-400 text-lg sm:text-xl max-w-2xl mx-auto lg:mx-0 leading-relaxed font-light transition-colors">
            Whether you are bulking up or leaning out, get AI-powered meal suggestions instantly based on what you burn and consume. 
          </p>

          {/* Member Sign Up Form */}
          <form onSubmit={handleLeadCapture} className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto lg:mx-0 pt-2">
            {/* <input
              type="email"
              placeholder="Enter your email to start"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 px-5 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all shadow-sm dark:shadow-none"
            /> */}
            <button
              type="submit"
              style={{ color: "white" }}
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-emerald-600 text-white dark:bg-emerald-500 dark:text-slate-950 font-bold rounded-lg shadow-lg shadow-emerald-600/20 dark:shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:bg-emerald-500 dark:hover:bg-emerald-400 hover:shadow-emerald-500/30 dark:hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] transition-all duration-300 whitespace-nowrap"
            >
              Get Started Free
              <ArrowRight className="h-5 w-5" />
            </button>
          </form>

          {/* Freemium Trust Copy */}
          <div className="flex items-center justify-center lg:justify-start gap-4 text-sm text-slate-500 font-medium">
            <div className="flex items-center gap-1.5">
              <Zap className="h-4 w-4 text-amber-500" fill="currentColor" />
              3 Free AI suggestions daily
            </div>
            <div className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700 transition-colors"></div>
            <div>Upgrade anytime for unlimited</div>
          </div>
        </div>

        {/* Right Dashboard UI Mockup - Creative UI Collage */}
        <div className="lg:w-[45%] w-full relative max-w-2xl mx-auto lg:mx-0 mt-12 lg:mt-0 perspective-1000">
          
          {/* Intense Background Glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-emerald-400/30 dark:bg-emerald-500/20 blur-[80px] rounded-full -z-10 pointer-events-none transition-colors"></div>

          {/* Floating UI Container */}
          <div className="relative w-full aspect-square sm:aspect-[4/3] lg:aspect-square flex items-center justify-center">

            {/* Centerpiece: AI Meal Suggestion Card */}
            <div className="absolute z-20 w-[90%] sm:w-[75%] bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-[2rem] border border-white/60 dark:border-slate-700/50 shadow-2xl p-6 sm:p-8 transform transition-all duration-500 hover:scale-[1.02] hover:-translate-y-2">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 rounded-full text-xs font-bold uppercase tracking-wider">
                  <Bot className="h-4 w-4" /> AI Generated
                </div>
                <span className="text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">Post-Workout</span>
              </div>
              
              <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mb-2 leading-tight">Honey Glazed Salmon Bowl</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-8 font-light">Perfectly balanced to replenish glycogen and support your lean bulk goal.</p>
              
              {/* Macro breakdown */}
              <div className="flex gap-3">
                <div className="flex-1 bg-slate-50/80 dark:bg-slate-800/80 rounded-2xl p-3 sm:p-4 border border-slate-100 dark:border-slate-700 text-center shadow-sm">
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-1 font-medium">Protein</p>
                  <p className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">42g</p>
                </div>
                <div className="flex-1 bg-slate-50/80 dark:bg-slate-800/80 rounded-2xl p-3 sm:p-4 border border-slate-100 dark:border-slate-700 text-center shadow-sm">
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-1 font-medium">Carbs</p>
                  <p className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">55g</p>
                </div>
                <div className="flex-1 bg-slate-50/80 dark:bg-slate-800/80 rounded-2xl p-3 sm:p-4 border border-slate-100 dark:border-slate-700 text-center shadow-sm">
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-1 font-medium">Fat</p>
                  <p className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">18g</p>
                </div>
              </div>
            </div>

            {/* Floating Element 1: Daily Target (Top Left) */}
            <div className="absolute top-[0%] left-[0%] z-10 w-48 sm:w-56 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xl p-4 sm:p-5 transform -rotate-6 transition-all duration-500 hover:rotate-0 hover:scale-105 hover:z-30">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded-full bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center shrink-0">
                  <Target className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Daily Target</p>
                  <p className="text-base font-black text-slate-900 dark:text-white leading-none mt-1">2,400 kcal</p>
                </div>
              </div>
              <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                <div className="w-[65%] h-full bg-emerald-500 rounded-full relative">
                  <div className="absolute top-0 right-0 bottom-0 w-8 bg-gradient-to-r from-transparent to-white/30"></div>
                </div>
              </div>
              <p className="text-xs font-medium text-slate-500 mt-2 text-right">840 kcal remaining</p>
            </div>

            {/* Floating Element 2: Workout Sync (Bottom Right) */}
            <div className="absolute bottom-[0%] right-[0%] z-30 w-52 sm:w-60 bg-slate-900 dark:bg-white rounded-2xl border border-slate-800 dark:border-slate-200 shadow-2xl p-4 sm:p-5 transform rotate-3 transition-all duration-500 hover:rotate-0 hover:scale-105 hover:z-30">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Flame className="h-4 w-4 text-orange-500" />
                  <span className="text-xs font-bold text-white dark:text-slate-900 uppercase tracking-wider">Activity</span>
                </div>
                <Activity className="h-4 w-4 text-emerald-400 dark:text-emerald-600" />
              </div>
              <p className="text-sm font-medium text-slate-400 dark:text-slate-500">Heavy lifting burned</p>
              <p className="text-3xl font-black text-white dark:text-slate-900 mt-1 tracking-tight">
                +450 <span className="text-base font-medium text-slate-500 dark:text-slate-400">kcal</span>
              </p>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}