import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(req: Request) {
  try {
    const { user_id, meal_type, food_items, mood } = await req.json();
    const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

    // 1️⃣ Ask AI to estimate calories and brief insight
    const foodText = Array.isArray(food_items)
      ? food_items.join(", ")
      : String(food_items);

    const caloriePrompt = `
    You are a certified nutritionist. Estimate the approximate calorie count
    for the following meal: "${foodText}".
    Also give one short, realistic health suggestion related to this meal.
    Respond ONLY in JSON like:
    {
      "calories": 450,
      "advice": "Try adding more protein for better satiety."
    }.
    `;

    const aiResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "deepseek/deepseek-chat-v3.1:free",
        messages: [{ role: "user", content: caloriePrompt }],
      }),
    });

    const aiData = await aiResponse.json();
    let aiResult;
    try {
      aiResult = JSON.parse(aiData?.choices?.[0]?.message?.content || "{}");
    } catch {
      aiResult = { calories: null, advice: "Unable to analyze meal accurately." };
    }

    // 2️⃣ Save to Supabase
    const { data, error } = await supabase.from("food_logs").insert([
      {
        user_id,
        meal_type,
        food_items,
        calories: aiResult.calories,
        mood,
        ai_advice: aiResult.advice,
      },
    ]);

    if (error) throw error;

    // 3️⃣ Return both meal + AI result
    return NextResponse.json({
      success: true,
      data,
      aiResult,
    });
  } catch (err: any) {
    console.error("Error saving meal:", err.message);
    return NextResponse.json(
      { error: "Failed to log meal with AI" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("food_logs")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    return NextResponse.json({ data });
  } catch (err: any) {
    console.error("Fetch error:", err.message);
    return NextResponse.json(
      { error: "Failed to fetch food logs" },
      { status: 500 }
    );
  }
}
