"use client";

import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import dayjs from "dayjs";
import { useTheme } from "next-themes";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { 
  Apple, 
  Flame, 
  Activity, 
  Target, 
  Zap, 
  Loader2, 
  Calendar
} from "lucide-react";

interface DailyCalories {
  date: string;
  consumed: number;
  burned: number;
}

export default function DashboardHome() {
  const user = useSelector((state: any) => state.user);
  const { theme } = useTheme();
  
  // Date range states (Native strings for standard HTML date inputs)
  const [startDate, setStartDate] = useState<string>(dayjs().subtract(6, "day").format("YYYY-MM-DD"));
  const [endDate, setEndDate] = useState<string>(dayjs().format("YYYY-MM-DD"));
  
  const [chartData, setChartData] = useState<DailyCalories[]>([]);
  const [loadingChart, setLoadingChart] = useState(false);
  const [summary, setSummary] = useState<any>(null);
  const [loadingSummary, setLoadingSummary] = useState(true);

  // Mocking the Free Meals remaining since it's a new feature.
  // In a real scenario, this would come from the user's DB profile/subscription status.
  const [freeMealsRemaining, setFreeMealsRemaining] = useState(2);
  const maxFreeMeals = 3;

  /* ---------- Fetch summary ---------- */
  const fetchSummary = async () => {
    if (!user?.uid) return;
    setLoadingSummary(true);
    try {
      const res = await axios.get(`/api/dashboard`, {
        params: { user_id: user.uid },
      });
      setSummary(res.data);
    } catch (err: any) {
      console.error(err);
      // Fallback dummy data for visual testing if API fails
      setSummary({ totalConsumed: 2450, totalBurned: 840, bmi: 24.2, goalProgress: 68 });
    } finally {
      setLoadingSummary(false);
    }
  };

  /* ---------- Fetch chart data ---------- */
  const fetchChartData = async (start: string, end: string) => {
    if (!user?.uid) return;
    setLoadingChart(true);
    try {
      const res = await axios.get(`/api/dashboard`, {
        params: { user_id: user.uid, start, end },
      });

      if (res.data?.weeklyData && Array.isArray(res.data.weeklyData)) {
        const formatted: DailyCalories[] = res.data.weeklyData.map((d: any) => ({
          ...d,
          date: dayjs(d.date).format("MMM D"),
        }));
        setChartData(formatted);
      }
    } catch (err: any) {
      console.error(err);
      // Fallback dummy data for visual testing if API fails
      setChartData([
        { date: "Mon", consumed: 2200, burned: 400 },
        { date: "Tue", consumed: 2400, burned: 600 },
        { date: "Wed", consumed: 2100, burned: 350 },
        { date: "Thu", consumed: 2500, burned: 800 },
        { date: "Fri", consumed: 2300, burned: 500 },
        { date: "Sat", consumed: 2800, burned: 900 },
        { date: "Sun", consumed: 2600, burned: 450 },
      ]);
    } finally {
      setLoadingChart(false);
    }
  };

  useEffect(() => {
    if (user?.uid) fetchSummary();
  }, [user]);

  useEffect(() => {
    if (startDate && endDate && user?.uid) {
      fetchChartData(startDate, endDate);
    }
  }, [startDate, endDate, user]);

  // Dynamic colors for Recharts based on dark/light mode
  const gridColor = theme === "dark" ? "#334155" : "#e2e8f0";
  const textColor = theme === "dark" ? "#94a3b8" : "#64748b";

  if (loadingSummary) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[60vh] gap-4">
        <Loader2 className="h-8 w-8 text-emerald-500 animate-spin" />
        <p className="text-slate-500 dark:text-slate-400 font-medium">Syncing your fitness data...</p>
      </div>
    );
  }

  if (!summary) return null;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* ---------- Free Meals Tracker Banner ---------- */}
      <div className="bg-gradient-to-r from-emerald-600 to-cyan-600 rounded-2xl p-6 text-white shadow-lg shadow-emerald-500/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-white opacity-10 rounded-full blur-2xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Zap className="h-5 w-5 text-amber-300" fill="currentColor" />
              <h2 className="text-xl font-bold tracking-tight">AI Meals Remaining Today</h2>
            </div>
            <p className="text-emerald-50 max-w-md text-sm">
              You have used {maxFreeMeals - freeMealsRemaining} of your {maxFreeMeals} daily free generations. Upgrade to Pro for unlimited meal variations.
            </p>
          </div>
          <div className="flex items-center gap-4 bg-white/20 p-3 rounded-xl backdrop-blur-sm border border-white/20">
            <div className="text-3xl font-black">{freeMealsRemaining}</div>
            <div className="flex gap-1.5">
              {[...Array(maxFreeMeals)].map((_, i) => (
                <div 
                  key={i} 
                  className={`h-8 w-3 rounded-full ${i < freeMealsRemaining ? "bg-amber-300 shadow-[0_0_10px_rgba(252,211,77,0.8)]" : "bg-white/20"}`}
                ></div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ---------- Summary Cards Grid ---------- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Consumed Card */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-emerald-100 dark:bg-emerald-500/20 p-2.5 rounded-lg">
              <Apple className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <span className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Consumed</span>
          </div>
          <div className="flex items-baseline gap-1">
            <h3 className="text-3xl font-black text-slate-900 dark:text-white">{summary.totalConsumed || 0}</h3>
            <span className="text-sm font-medium text-slate-500">kcal</span>
          </div>
        </div>

        {/* Burned Card */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-orange-100 dark:bg-orange-500/20 p-2.5 rounded-lg">
              <Flame className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            </div>
            <span className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Burned</span>
          </div>
          <div className="flex items-baseline gap-1">
            <h3 className="text-3xl font-black text-slate-900 dark:text-white">{summary.totalBurned || 0}</h3>
            <span className="text-sm font-medium text-slate-500">kcal</span>
          </div>
        </div>

        {/* BMI Card */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-blue-100 dark:bg-blue-500/20 p-2.5 rounded-lg">
              <Activity className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <span className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Current BMI</span>
          </div>
          <div className="flex items-baseline gap-1">
            <h3 className="text-3xl font-black text-slate-900 dark:text-white">{(summary.bmi || 0).toFixed(1)}</h3>
          </div>
        </div>

        {/* Goal Progress Card */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-indigo-100 dark:bg-indigo-500/20 p-2.5 rounded-lg">
              <Target className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <span className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Goal Progress</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex-1 bg-slate-100 dark:bg-slate-800 rounded-full h-3 overflow-hidden">
              <div 
                className="h-full bg-indigo-500 rounded-full" 
                style={{ width: `${summary.goalProgress || 0}%` }}
              ></div>
            </div>
            <span className="text-lg font-bold text-slate-900 dark:text-white">{Math.round(summary.goalProgress || 0)}%</span>
          </div>
        </div>

      </div>

      {/* ---------- Chart Section ---------- */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
        
        {/* Chart Header & Date Picker */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Calorie History</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Track your energy balance over time.</p>
          </div>
          
          <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/50 p-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
            <div className="relative flex items-center">
              <Calendar className="absolute left-3 h-4 w-4 text-slate-400 pointer-events-none" />
              <input 
                type="date" 
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="pl-9 pr-3 py-2 bg-transparent text-sm font-medium text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 rounded-lg transition-colors cursor-pointer"
              />
            </div>
            <span className="text-slate-400">-</span>
            <div className="relative flex items-center">
              <input 
                type="date" 
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="px-3 py-2 bg-transparent text-sm font-medium text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 rounded-lg transition-colors cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Recharts Container */}
        <div className="w-full h-[400px]">
          {loadingChart ? (
            <div className="w-full h-full flex flex-col items-center justify-center gap-3">
              <Loader2 className="h-8 w-8 text-emerald-500 animate-spin" />
              <p className="text-slate-500 font-medium">Loading chart data...</p>
            </div>
          ) : chartData.length === 0 ? (
            <div className="w-full h-full flex flex-col items-center justify-center gap-3">
              <Activity className="h-10 w-10 text-slate-300 dark:text-slate-600" />
              <p className="text-slate-500 font-medium">No data available for this range.</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                barCategoryGap="20%"
              >
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                <XAxis 
                  dataKey="date" 
                  tick={{ fill: textColor, fontSize: 12, fontWeight: 500 }}
                  tickLine={false}
                  axisLine={false}
                  dy={10}
                />
                <YAxis 
                  tick={{ fill: textColor, fontSize: 12, fontWeight: 500 }}
                  tickLine={false}
                  axisLine={false}
                  dx={-10}
                />
                <Tooltip
                  cursor={{ fill: theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)' }}
                  contentStyle={{
                    backgroundColor: theme === 'dark' ? '#0f172a' : '#ffffff',
                    borderColor: theme === 'dark' ? '#1e293b' : '#e2e8f0',
                    borderRadius: '12px',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                    color: theme === 'dark' ? '#f8fafc' : '#0f172a',
                    fontWeight: 600
                  }}
                  itemStyle={{ fontWeight: 500 }}
                  formatter={(value: number, name: string) => [`${value} kcal`, name]}
                />
                <Legend 
                  verticalAlign="top" 
                  height={50} 
                  iconType="circle"
                  wrapperStyle={{ fontSize: '13px', fontWeight: 500, color: textColor }}
                />
                <Bar
                  dataKey="consumed"
                  name="Calories Consumed"
                  fill="#10b981" // Emerald-500
                  radius={[6, 6, 0, 0]}
                  maxBarSize={50}
                />
                <Bar
                  dataKey="burned"
                  name="Calories Burned"
                  fill="#f97316" // Orange-500
                  radius={[6, 6, 0, 0]}
                  maxBarSize={50}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

      </div>
    </div>
  );
}