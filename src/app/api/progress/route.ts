export const dynamic = "force-dynamic"; 
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import dayjs from "dayjs";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// 🧩 Save or Update User Progress
export async function POST(req: Request) {
  try {
    const { user_id, workout_frequency, calories_per_workout, goal } =
      await req.json();

    if (!user_id)
      return NextResponse.json({ error: "Missing user_id" }, { status: 400 });

    const { data: existing } = await supabase
      .from("user_progress")
      .select("*")
      .eq("user_id", user_id)
      .limit(1);

    if (existing && existing.length > 0) {
      const { error: updateError } = await supabase
        .from("user_progress")
        .update({
          workout_frequency,
          calories_per_workout,
          goal,
        })
        .eq("user_id", user_id);

      if (updateError) throw updateError;
    } else {
      const { error: insertError } = await supabase
        .from("user_progress")
        .insert([
          { user_id, workout_frequency, calories_per_workout, goal },
        ]);
      if (insertError) throw insertError;
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("❌ Progress save error:", err.message);
    return NextResponse.json(
      { error: "Failed to save progress." },
      { status: 500 }
    );
  }
}

// 🧮 GET: Calculate user’s progress
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const user_id = searchParams.get("user_id");

  if (!user_id)
    return NextResponse.json({ error: "Missing user_id" }, { status: 400 });

  try {
    // 🧾 1. Fetch total calories from food_logs (past 7 days)
    const { data: foodLogs, error: foodError } = await supabase
      .from("food_logs")
      .select("calories, log_date")
      .eq("user_id", user_id)
      .gte("log_date", dayjs().subtract(7, "day").format("YYYY-MM-DD"));

    if (foodError) throw foodError;

    const totalConsumed = foodLogs.reduce(
      (sum, l) => sum + (l.calories || 0),
      0
    );

    // 🏋️‍♂️ 2. Fetch user workout info
    const { data: progressData, error: progressError } = await supabase
      .from("user_progress")
      .select("*")
      .eq("user_id", user_id)
      .single();

    if (progressError) throw progressError;

    const { workout_frequency, calories_per_workout, goal } = progressData;

    // 🔥 3. Estimate total calories burned
    let workoutDays = 0;
    if (workout_frequency === "daily") workoutDays = 7;
    else if (workout_frequency === "3_per_week") workoutDays = 3;
    else workoutDays = 0;

    const totalBurned = workoutDays * calories_per_workout;

    // ⚖️ 4. Calculate net balance
    const netCalories = totalConsumed - totalBurned;
    const status =
      goal === "lose"
        ? netCalories < 0
          ? "On track 🔥"
          : "Surplus ⚠️"
        : goal === "gain"
        ? netCalories > 0
          ? "On track 💪"
          : "Deficit ⚠️"
        : "Maintaining ⚖️";

    return NextResponse.json({
      data: {
        totalConsumed,
        totalBurned,
        netCalories,
        goal,
        status,
      },
    });
  } catch (err: any) {
    console.error("❌ Fetch progress error:", err.message);
    return NextResponse.json(
      { error: "Failed to fetch progress data." },
      { status: 500 }
    );
  }
}
