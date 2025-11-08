import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import dayjs from "dayjs";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

/* ---------- Helper: Extract numeric calories ---------- */
function extractCaloriesFromRow(row: any): number {
  const candidates = [
    "approx_calories",
    "calories",
    "estimated_calories",
    "est_calories",
    "ai_estimated_calories",
    "ai_calories",
    "calorie_estimate",
    "calories_estimate",
    "kcal",
  ];

  for (const key of candidates) {
    if (row[key] != null && row[key] !== "") {
      const n = Number(row[key]);
      if (!Number.isNaN(n)) return n;
    }
  }
  return 0;
}

/* ---------- API Handler ---------- */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const user_id = searchParams.get("user_id");
  const startParam = searchParams.get("start");
  const endParam = searchParams.get("end");

  if (!user_id) {
    return NextResponse.json({ error: "Missing user_id" }, { status: 400 });
  }

  try {
    /* ---------- 1. Determine date range ---------- */
    const startDate = startParam
      ? dayjs(startParam).startOf("day").toISOString()
      : dayjs().subtract(6, "day").startOf("day").toISOString();
    const endDate = endParam
      ? dayjs(endParam).endOf("day").toISOString()
      : dayjs().endOf("day").toISOString();

    /* ---------- 2. Fetch food logs ---------- */
    const { data: foodLogs, error: foodError } = await supabase
      .from("food_logs")
      .select("*")
      .eq("user_id", user_id)
      .gte("created_at", startDate)
      .lte("created_at", endDate)
      .order("created_at", { ascending: true });

    if (foodError) throw foodError;

    /* ---------- 3. Fetch user progress/profile ---------- */
    let progress: any = null;

    // First try user_progress
    const { data: p1, error: p1err } = await supabase
      .from("user_progress")
      .select("*")
      .eq("user_id", user_id)
      .maybeSingle();
    if (!p1err && p1) progress = p1;

    // Fallback to profiles
    const { data: p2, error: p2err } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", user_id)
      .maybeSingle();
    if (!p2err && p2) {
      progress = { ...progress, ...p2 };
    }

    /* ---------- 4. Aggregate daily consumed calories ---------- */
    const dailyMap: Record<string, number> = {};
    let totalConsumed = 0;

    (foodLogs || []).forEach((row) => {
      const cals = extractCaloriesFromRow(row);
      totalConsumed += cals;

      const date = dayjs(row.created_at).format("YYYY-MM-DD");
      dailyMap[date] = (dailyMap[date] || 0) + cals;
    });

    /* ---------- 5. Compute burned calories ---------- */
    let totalBurned = 0;
    let burnedPerWorkout = 0;
    const freq = progress?.workout_frequency || progress?.frequency || "never";
    const perWorkout = Number(progress?.calories_per_workout ?? progress?.calories_per_session ?? 0);

    if (freq === "daily" || freq === "everyday") {
      burnedPerWorkout = perWorkout;
      totalBurned = perWorkout * 7;
    } else if (freq === "3_per_week" || freq === "3x") {
      burnedPerWorkout = perWorkout;
      totalBurned = perWorkout * 3;
    }

    /* ---------- 6. Construct dataset per day ---------- */
    const startDay = dayjs(startDate);
    const endDay = dayjs(endDate);
    const daysDiff = endDay.diff(startDay, "day") + 1;

    const weeklyData = Array.from({ length: daysDiff }).map((_, i) => {
      const dateObj = startDay.add(i, "day");
      const dateKey = dateObj.format("YYYY-MM-DD");
      const consumed = dailyMap[dateKey] || 0;

      let burned = 0;
      if (freq === "daily" || freq === "everyday") burned = burnedPerWorkout;
      else if (freq === "3_per_week" || freq === "3x") {
        burned = [1, 3, 5].includes(dateObj.day()) ? burnedPerWorkout : 0;
      }

      return {
        date: dateObj.format("MMM D"),
        consumed,
        burned,
      };
    });

    /* ---------- 7. Use BMI from profile if exists ---------- */
    const bmi = progress?.bmi ? Number(progress.bmi) : null;

    const goal = progress?.goal || "maintain";
    const netCalories = totalConsumed - totalBurned;
    let goalProgress = 50;

    if (goal === "lose") {
      goalProgress = Math.max(0, Math.min(100, Math.round(100 - (netCalories / 3500) * 100)));
    } else if (goal === "gain") {
      goalProgress = Math.max(0, Math.min(100, Math.round((netCalories / 3500) * 100)));
    } else {
      goalProgress = Math.max(0, Math.min(100, 50 - Math.round((netCalories / 3500) * 10)));
    }

    return NextResponse.json({
      totalConsumed,
      totalBurned,
      bmi,
      goalProgress,
      weeklyData,
    });
  } catch (err: any) {
    console.error("Dashboard fetch error:", err.message || err);
    return NextResponse.json({ error: "Failed to fetch dashboard" }, { status: 500 });
  }
}
