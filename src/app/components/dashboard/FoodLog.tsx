"use client";

import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { message } from "antd"; // Kept solely for toast notifications
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import {
  Utensils,
  Flame,
  Calendar,
  Coffee,
  Trophy,
  Plus,
  Loader2,
  Sparkles,
  Droplet,
  ArrowRight,
  Shield,
  HelpCircle,
} from "lucide-react";

dayjs.extend(isBetween);

export default function FoodLog() {
  const user = useSelector((state: any) => state.user);
  
  const [mealType, setMealType] = useState<string>("Breakfast");
  const [foodItems, setFoodItems] = useState<string>("");
  const [mood, setMood] = useState<string>("");
  const [date, setDate] = useState<string>(dayjs().format("YYYY-MM-DD"));
  
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingLogs, setLoadingLogs] = useState(true);
  const [latestAI, setLatestAI] = useState<{ calories?: number; advice?: string } | null>(null);

  // Water Intake State
  const [waterIntake, setWaterIntake] = useState<number>(0);
  const waterGoal = 8; // glasses per day

  async function fetchLogs() {
    if (!user?.uid) return;
    try {
      setLoadingLogs(true);
      const res = await fetch("/api/food-log");
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Failed to fetch logs");

      const userLogs = (data.data || []).filter((log: any) => log.user_id === user.uid);
      setLogs(userLogs);
    } catch (err) {
      message.error("Failed to fetch logs");
    } finally {
      setLoadingLogs(false);
    }
  }

  async function addLog() {
    if (!user?.uid) {
      message.warning("Please log in to save your meal data.");
      return;
    }
    if (!mealType || !foodItems) {
      message.error("Please enter meal details");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        user_id: user.uid,
        meal_type: mealType,
        food_items: foodItems
          .split(",")
          .map((f) => f.trim())
          .filter(Boolean),
        mood,
        date: date ? dayjs(date).format("YYYY-MM-DD") : null,
      };

      const res = await fetch("/api/food-log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");

      setMealType("Breakfast");
      setFoodItems("");
      setMood("");

      setLatestAI({
        calories: data.data?.[0]?.calories,
        advice: data.data?.[0]?.ai_advice,
      });

      await fetchLogs();
      message.success("Meal logged and analyzed by AI ✅");
    } catch (err) {
      console.error(err);
      message.error("Failed to add meal");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (user?.uid) fetchLogs();
  }, [user]);

  useEffect(() => {
    if (logs.length > 0) {
      const today = dayjs().format("YYYY-MM-DD");
      const todayLog = logs.find((l) => dayjs(l.date).format("YYYY-MM-DD") === today);
      if (todayLog?.water_intake) {
        setWaterIntake(todayLog.water_intake);
      }
    }
  }, [logs]);

  const totalCalories = logs.reduce((sum, l) => sum + (l.calories || 0), 0);

  // 🧮 Daily macros
  const macroSummary = {
    protein: Math.round((totalCalories * 0.25) / 4),
    carbs: Math.round((totalCalories * 0.5) / 4),
    fat: Math.round((totalCalories * 0.25) / 9),
  };

  // 🗓️ Weekly Summary
  const startOfWeek = dayjs().startOf("week");
  const endOfWeek = dayjs().endOf("week");
  const weeklyCalories = logs
    .filter((log) => dayjs(log.date).isBetween(startOfWeek, endOfWeek, null, "[]"))
    .reduce((sum, l) => sum + (l.calories || 0), 0);

  // Water Progress Calculation
  const waterProgress = Math.min(100, (waterIntake / waterGoal) * 100);

  return (
    <div className=" mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      
      <div className="text-center sm:text-left space-y-2 mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Food & Hydration Log
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-lg">
          Track what you eat and let our AI calculate your macros instantly.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
        
        {/* LEFT SIDE: Log & AI (Spans 2 columns on large screens) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Utensils className="h-5 w-5 text-emerald-500" />
                Add New Meal
              </h2>
              {user?.uid && (
                <div className="px-3 py-1.5 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-bold rounded-lg text-sm border border-emerald-100 dark:border-emerald-500/20">
                  Total Today: {totalCalories} kcal
                </div>
              )}
            </div>

            {/* Input Form */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
              <div className="sm:col-span-3">
                <select
                  value={mealType}
                  onChange={(e) => setMealType(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-medium appearance-none"
                >
                  <option value="Breakfast">Breakfast</option>
                  <option value="Lunch">Lunch</option>
                  <option value="Dinner">Dinner</option>
                  <option value="Snack">Snack</option>
                </select>
              </div>

              <div className="sm:col-span-5">
                <input
                  type="text"
                  placeholder="e.g. 2 eggs, 1 slice toast"
                  value={foodItems}
                  onChange={(e) => setFoodItems(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                />
              </div>

              <div className="sm:col-span-4 relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-medium cursor-pointer"
                />
              </div>

              <div className="sm:col-span-12 flex justify-end mt-2">
                <button
                  onClick={addLog}
                  disabled={loading}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-500 transition-colors shadow-md shadow-emerald-600/20 disabled:opacity-70"
                >
                  {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Sparkles className="h-5 w-5" />}
                  {loading ? "Analyzing..." : "Analyze & Log Meal"}
                </button>
              </div>
            </div>
          </div>

          {/* Log History */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 sm:p-8">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Recent Logs</h3>
            
            {!user?.uid ? (
              <div className="text-center py-10 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                <p className="text-slate-500 dark:text-slate-400 font-medium">Please log in to view your food logs.</p>
              </div>
            ) : loadingLogs ? (
              <div className="flex justify-center py-10">
                <Loader2 className="h-8 w-8 text-emerald-500 animate-spin" />
              </div>
            ) : logs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800 text-center px-4">
                <Utensils className="h-10 w-10 text-slate-300 dark:text-slate-600 mb-3" />
                <p className="text-slate-500 dark:text-slate-400 font-medium">No meals logged yet. Add your first meal above!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {logs.map((log) => (
                  <div key={log.id} className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-slate-900 dark:text-white">{log.meal_type}</span>
                        <span className="text-slate-300 dark:text-slate-600">—</span>
                        <span className="text-slate-700 dark:text-slate-300 font-medium">
                          {Array.isArray(log.food_items) ? log.food_items.join(", ") : log.food_items}
                        </span>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-400 text-xs font-bold">
                          <Flame className="w-3 h-3" />
                          {log.calories ?? "?"} kcal
                        </span>
                      </div>
                      <span className="text-xs font-medium text-slate-400 dark:text-slate-500 whitespace-nowrap">
                        {log.date ? dayjs(log.date).format("MMM D, YYYY") : ""}
                      </span>
                    </div>
                    {log.ai_advice && (
                      <div className="mt-3 p-3 rounded-lg bg-emerald-50/50 dark:bg-emerald-500/5 border border-emerald-100 dark:border-emerald-500/10 text-sm text-emerald-800 dark:text-emerald-300 font-medium">
                        <span className="mr-1">💡</span> {log.ai_advice}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT SIDE: Insights */}
        <div className="space-y-6">
          
          {/* Nutrition Summary */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Daily Nutrition</h3>
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-orange-100 dark:bg-orange-500/20 p-3 rounded-xl">
                <Flame className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">Total Calories</p>
                <p className="text-2xl font-black text-slate-900 dark:text-white leading-none mt-1">{totalCalories} <span className="text-sm font-medium text-slate-500">kcal</span></p>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800 text-center">
                <p className="text-xs text-slate-500 font-medium mb-1">Protein</p>
                <p className="font-bold text-slate-900 dark:text-white">{macroSummary.protein}g</p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800 text-center">
                <p className="text-xs text-slate-500 font-medium mb-1">Carbs</p>
                <p className="font-bold text-slate-900 dark:text-white">{macroSummary.carbs}g</p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800 text-center">
                <p className="text-xs text-slate-500 font-medium mb-1">Fat</p>
                <p className="font-bold text-slate-900 dark:text-white">{macroSummary.fat}g</p>
              </div>
            </div>
          </div>

          {/* Water Intake */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Droplet className="h-5 w-5 text-blue-500" />
                Hydration
              </h3>
              <span className="font-bold text-slate-900 dark:text-white">{waterIntake} <span className="text-slate-400 font-medium text-sm">/ {waterGoal} gl</span></span>
            </div>
            
            <div className="bg-slate-100 dark:bg-slate-800 rounded-full h-3 overflow-hidden mb-6">
              <div 
                className="h-full bg-blue-500 rounded-full transition-all duration-500 ease-out" 
                style={{ width: `${waterProgress}%` }}
              ></div>
            </div>

            <button
              onClick={async () => {
                if (!user?.uid) return message.warning("Please log in first.");
                try {
                  const res = await fetch("/api/food-log", {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ user_id: user.uid, glasses: 1 }),
                  });
                  if (!res.ok) throw new Error("Update failed");
                  setWaterIntake((w) => w + 1);
                  message.success("💧 Water logged!");
                } catch (err) {
                  message.error("Failed to update water intake");
                }
              }}
              className="w-full flex items-center justify-center gap-2 py-3 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-xl font-bold hover:bg-blue-100 dark:hover:bg-blue-500/20 transition-colors border border-blue-100 dark:border-blue-500/20"
            >
              <Plus className="h-4 w-4" /> Add Glass
            </button>
          </div>

          {/* Weekly Summary */}
          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-500/10 dark:to-purple-500/10 rounded-2xl border border-indigo-100 dark:border-indigo-500/20 shadow-sm p-6 text-center">
            <Trophy className="h-8 w-8 text-indigo-500 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-indigo-800 dark:text-indigo-400 uppercase tracking-wider mb-1">Weekly Summary</h3>
            <p className="text-3xl font-black text-indigo-900 dark:text-indigo-300 tracking-tight">
              {weeklyCalories} <span className="text-base font-medium text-indigo-700/60 dark:text-indigo-400/60">kcal</span>
            </p>
          </div>

        </div>
      </div>

      {/* ---------------- DASHBOARD FOOTER ---------------- */}
      <footer className="mt-12 bg-slate-900 dark:bg-slate-950 rounded-3xl overflow-hidden shadow-xl border border-slate-800">
        <div className="grid grid-cols-1 lg:grid-cols-2">
          {/* CTA Section */}
          <div className="p-8 sm:p-10 flex flex-col justify-center bg-gradient-to-br from-slate-900 to-slate-800">
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
                  <li><a href="#" className="text-slate-400 hover:text-emerald-400 transition-colors text-sm flex items-center gap-2"><Coffee className="w-4 h-4" /> Nutrition Guide</a></li>
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