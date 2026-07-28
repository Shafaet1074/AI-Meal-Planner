"use client";

import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { message } from "antd"; // Kept solely for toast notifications
import {
  Dumbbell,
  Target,
  Flame,
  Activity,
  TrendingUp,
  Save,
  Loader2,
  Info,
  ArrowRight,
  Shield,
  HelpCircle,
  Zap,
  Utensils
} from "lucide-react";

export default function ProgressTracker() {
  const user = useSelector((state: any) => state.user);
  
  const [workoutFrequency, setWorkoutFrequency] = useState("never");
  const [caloriesPerWorkout, setCaloriesPerWorkout] = useState<number>(200);
  const [goal, setGoal] = useState("maintain");
  
  const [progressData, setProgressData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  async function saveProgress() {
    if (!user?.uid) return message.warning("Please log in first");

    try {
      setLoading(true);
      const res = await fetch("/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: user.uid,
          workout_frequency: workoutFrequency,
          calories_per_workout: caloriesPerWorkout,
          goal,
        }),
      });

      if (!res.ok) throw new Error("Failed to save");
      message.success("Progress settings saved ✅");
      await fetchProgress();
    } catch (err) {
      message.error("Failed to save progress");
    } finally {
      setLoading(false);
    }
  }

  async function fetchProgress() {
    if (!user?.uid) return;
    try {
      const res = await fetch(`/api/progress?user_id=${user.uid}`);
      const data = await res.json();
      if (res.ok) setProgressData(data.data);
    } catch {
      message.error("Failed to load progress data");
    }
  }

  useEffect(() => {
    if (user?.uid) fetchProgress();
  }, [user]);

  // Calculate Progress Bar Width and Color based on Net Calories
  const getProgressStyles = () => {
    if (!progressData) return { width: "0%", color: "bg-blue-500", text: "text-blue-500" };
    
    const percent = Math.min(Math.floor(Math.abs(progressData.netCalories / 3500) * 100), 100);
    const net = progressData.netCalories;
    
    if (net < 0) return { width: `${percent}%`, color: "bg-emerald-500", text: "text-emerald-600 dark:text-emerald-400" };
    if (net > 0) return { width: `${percent}%`, color: "bg-orange-500", text: "text-orange-600 dark:text-orange-400" };
    return { width: `${percent}%`, color: "bg-blue-500", text: "text-blue-600 dark:text-blue-400" };
  };

  const progressStyles = getProgressStyles();

  return (
    <div className=" mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      
      {/* Header */}
      <div className="text-center sm:text-left space-y-2 mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Progress & Goals
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-lg">
          Configure your baseline metrics to help the AI accurately measure your success.
        </p>
      </div>

      <div className="space-y-8">
        
        {/* Settings Card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-blue-100 dark:bg-blue-500/20 p-2.5 rounded-xl">
              <Target className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Fitness Parameters
            </h2>
          </div>
          <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-2xl">
            Set your workout habits and personal goals. The AI uses this data to calculate your daily energy expenditure.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Frequency */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <Activity className="w-4 h-4 text-slate-400" /> Workout Frequency
              </label>
              <select
                value={workoutFrequency}
                onChange={(e) => setWorkoutFrequency(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-medium appearance-none"
              >
                <option value="daily">Daily</option>
                <option value="3_per_week">3 Days / Week</option>
                <option value="never">Never</option>
              </select>
            </div>

            {/* Calories Burned */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <Flame className="w-4 h-4 text-orange-400" /> Calories Burned / Session
              </label>
              <input
                type="number"
                min={100}
                max={2000}
                value={caloriesPerWorkout}
                onChange={(e) => setCaloriesPerWorkout(Number(e.target.value) || 0)}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-medium"
              />
            </div>

            {/* Goal */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <Dumbbell className="w-4 h-4 text-slate-400" /> Primary Goal
              </label>
              <select
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-medium appearance-none"
              >
                <option value="lose">Lose Weight</option>
                <option value="gain">Gain Weight</option>
                <option value="maintain">Maintain</option>
              </select>
            </div>
          </div>

          <button
            onClick={saveProgress}
            disabled={loading}
            className="flex items-center justify-center gap-2 px-8 py-3.5 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-500 transition-all shadow-md shadow-emerald-600/20 disabled:opacity-70 w-full sm:w-auto"
          >
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
            {loading ? "Saving..." : "Save Progress Settings"}
          </button>
        </div>

        {/* Summary Card */}
        {progressData && (
          <div className="bg-gradient-to-b from-slate-50 to-white dark:from-slate-800/20 dark:to-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 sm:p-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-2">
                Weekly Summary
              </h2>
              <p className="text-slate-500 dark:text-slate-400">
                Here is your current calorie balance and how it aligns with your fitness goal.
              </p>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6 mb-10">
              
              <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-500/20 rounded-2xl p-6 text-center shadow-sm">
                <Utensils className="h-8 w-8 text-blue-500 mx-auto mb-3" />
                <h3 className="text-sm font-bold text-blue-800 dark:text-blue-400 uppercase tracking-wider mb-1">Consumed</h3>
                <p className="text-3xl font-black text-blue-950 dark:text-blue-200">
                  {progressData.totalConsumed} <span className="text-base font-medium text-blue-700/60 dark:text-blue-400/60">kcal</span>
                </p>
              </div>

              <div className="bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-500/20 rounded-2xl p-6 text-center shadow-sm">
                <Flame className="h-8 w-8 text-emerald-500 mx-auto mb-3" />
                <h3 className="text-sm font-bold text-emerald-800 dark:text-emerald-400 uppercase tracking-wider mb-1">Burned</h3>
                <p className="text-3xl font-black text-emerald-950 dark:text-emerald-200">
                  {progressData.totalBurned} <span className="text-base font-medium text-emerald-700/60 dark:text-emerald-400/60">kcal</span>
                </p>
              </div>

              <div className="bg-orange-50 dark:bg-orange-900/10 border border-orange-100 dark:border-orange-500/20 rounded-2xl p-6 text-center shadow-sm">
                <TrendingUp className="h-8 w-8 text-orange-500 mx-auto mb-3" />
                <h3 className="text-sm font-bold text-orange-800 dark:text-orange-400 uppercase tracking-wider mb-1">Net Balance</h3>
                <p className="text-3xl font-black text-orange-950 dark:text-orange-200">
                  {progressData.netCalories} <span className="text-base font-medium text-orange-700/60 dark:text-orange-400/60">kcal</span>
                </p>
              </div>

            </div>

            {/* Progress Indicator */}
            <div className="max-w-2xl mx-auto text-center">
              <div className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
                <span className="flex items-center gap-1.5"><Info className="h-4 w-4" /> Goal Progress</span>
                <span>{progressStyles.width}</span>
              </div>
              
              <div className="bg-slate-100 dark:bg-slate-800 rounded-full h-4 overflow-hidden mb-5">
                <div 
                  className={`h-full rounded-full transition-all duration-700 ease-out ${progressStyles.color}`} 
                  style={{ width: progressStyles.width }}
                ></div>
              </div>

              <h3 className={`text-xl font-extrabold mb-3 ${progressStyles.text}`}>
                {progressData.status}
              </h3>
              
              <div className="inline-flex items-start sm:items-center gap-2 text-left sm:text-center text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-950 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 font-medium text-sm">
                <span className="text-lg leading-none">💡</span>
                <span>{progressData.tip || "Stay consistent! Your progress compounds every week."}</span>
              </div>
            </div>

          </div>
        )}
      </div>

      {/* ---------------- DASHBOARD FOOTER ---------------- */}
      <footer className="mt-12 bg-slate-900 dark:bg-slate-950 rounded-3xl overflow-hidden shadow-xl border border-slate-800">
        <div className="grid grid-cols-1 lg:grid-cols-2">
          {/* CTA Section */}
          <div className="p-8 sm:p-10 flex flex-col justify-center bg-gradient-to-br from-slate-900 to-slate-800">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-wider w-max mb-4">
              <Zap className="h-3.5 w-3.5" fill="currentColor" />
              Pro Feature
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-3">
              Unlock Advanced Analytics
            </h2>
            <p className="text-slate-400 font-medium mb-8 max-w-md">
              Upgrade to Pro to unlock detailed micro-nutrient tracking, weekly trend analysis, and infinite AI meal generations.
            </p>
            <a
              href="/upgrade"
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-emerald-500 text-slate-950 font-bold rounded-xl shadow-lg shadow-emerald-500/20 hover:bg-emerald-400 transition-all duration-300 hover:-translate-y-0.5 w-max"
            >
              Upgrade to Pro
              <ArrowRight className="h-5 w-5" />
            </a>
          </div>

          {/* Links Section */}
          <div className="p-8 sm:p-10 border-t lg:border-t-0 lg:border-l border-slate-800 bg-slate-900/50 flex flex-col justify-between">
            <div className="grid grid-cols-2 gap-8 mb-8">
              <div>
                <h3 className="text-white font-bold mb-4">Support</h3>
                <ul className="space-y-3">
                  <li><a href="#" className="text-slate-400 hover:text-emerald-400 transition-colors text-sm flex items-center gap-2"><HelpCircle className="w-4 h-4" /> Help Center</a></li>
                  <li><a href="#" className="text-slate-400 hover:text-emerald-400 transition-colors text-sm flex items-center gap-2"><Utensils className="w-4 h-4" /> Nutrition Guide</a></li>
                </ul>
              </div>
              <div>
                <h3 className="text-white font-bold mb-4">Legal</h3>
                <ul className="space-y-3">
                  <li><a href="#" className="text-slate-400 hover:text-emerald-400 transition-colors text-sm flex items-center gap-2"><Shield className="w-4 h-4" /> Privacy Policy</a></li>
                  <li><a href="#" className="text-slate-400 hover:text-emerald-400 transition-colors text-sm flex items-center gap-2"><Shield className="w-4 h-4" /> Terms of Service</a></li>
                </ul>
              </div>
            </div>
            
            <p className="text-slate-500 text-xs font-medium border-t border-slate-800 pt-6 mt-auto">
              &copy; {new Date().getFullYear()} SmartMealAI. Empowering your fitness journey.
            </p>
          </div>
        </div>
      </footer>

    </div>
  );
}