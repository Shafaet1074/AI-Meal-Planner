export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import dayjs from "dayjs";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

function extractCaloriesFromRow(row: any): number {
  const candidates = ["calories", "approx_calories", "estimated_calories", "kcal"];
  for (const key of candidates) {
    if (row[key] != null) {
      const n = Number(row[key]);
      if (!Number.isNaN(n)) return n;
    }
  }
  return 0;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const user_id = searchParams.get("user_id");
  const startParam = searchParams.get("start");
  const endParam = searchParams.get("end");

  if (!user_id) return NextResponse.json({ error: "Missing user_id" }, { status: 400 });

  try {
    // 1. Normalize Date Range
    const startDate = startParam ? dayjs(startParam).startOf("day") : dayjs().subtract(6, "day").startOf("day");
    const endDate = endParam ? dayjs(endParam).endOf("day") : dayjs().endOf("day");

    // 2. Fetch Logs (Querying against log_date primarily, created_at as fallback)
    const { data: foodLogs, error: foodError } = await supabase
      .from("food_logs")
      .select("*")
      .eq("user_id", user_id)
      .gte("log_date", startDate.format("YYYY-MM-DD"))
      .lte("log_date", endDate.format("YYYY-MM-DD"));

    if (foodError) throw foodError;

    // 3. Fetch User Strategy
    const { data: progress } = await supabase
      .from("user_progress")
      .select("*")
      .eq("user_id", user_id)
      .maybeSingle();

    // 4. Map existing data
    const dailyMap: Record<string, number> = {};
    let totalConsumed = 0;

    foodLogs?.forEach((row) => {
      const cals = extractCaloriesFromRow(row);
      totalConsumed += cals;
      const dateKey = row.log_date || dayjs(row.created_at).format("YYYY-MM-DD");
      dailyMap[dateKey] = (dailyMap[dateKey] || 0) + cals;
    });

    // 5. Build Continuous Timeline (Prevents "Unknown" or Gaps)
    const daysDiff = endDate.diff(startDate, "day") + 1;
    const weeklyData = Array.from({ length: daysDiff }).map((_, i) => {
      const currentDay = startDate.add(i, "day");
      const dateKey = currentDay.format("YYYY-MM-DD");
      
      const freq = progress?.workout_frequency || "never";
      const perWorkout = Number(progress?.calories_per_workout || 0);
      
      let burned = 0;
      if (freq === "daily") burned = perWorkout;
      else if (freq === "3_per_week" && [1, 3, 5].includes(currentDay.day())) burned = perWorkout;

      return {
        date: dateKey, // Send ISO string to frontend
        consumed: dailyMap[dateKey] || 0,
        burned: burned,
      };
    });

    // 6. Calculate Goal Progress Logic
    const goal = progress?.goal || "maintain";
    const totalBurned = weeklyData.reduce((acc, curr) => acc + curr.burned, 0);
    const net = totalConsumed - totalBurned;
    
    let goalProgress = 50;
    if (goal === "lose") goalProgress = Math.max(0, Math.min(100, 100 - (net / 3500) * 100));
    else if (goal === "gain") goalProgress = Math.max(0, Math.min(100, (net / 3500) * 100));

    return NextResponse.json({
      totalConsumed,
      totalBurned,
      bmi: progress?.bmi || 0,
      goalProgress,
      weeklyData,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}