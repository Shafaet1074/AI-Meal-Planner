import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Initialize Gemini Client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!,
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(req: Request) {
  try {
    const { user_id, meal_type, food_items, mood } = await req.json();

    if (!user_id || !food_items) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const foodText = Array.isArray(food_items) ? food_items.join(", ") : food_items;

    // 🚀 Gemini Request with Schema (Native JSON Mode)
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash", 
      contents: [{ role: "user", parts: [{ text: `Analyze this meal: ${foodText}` }] }],
      config: {
        systemInstruction: "You are a professional nutritionist. Estimate calories and give one short tip. Respond ONLY in valid JSON.",
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            approx_calories: { type: "number" },
            advice: { type: "string" }
          },
          required: ["approx_calories", "advice"]
        }
      },
    });

    // The SDK automatically provides the parsed text string
    const aiOutput = JSON.parse(response.text);

    // 💾 Save to Supabase
    const { data, error } = await supabase.from("food_logs").insert([
      {
        user_id,
        meal_type,
        food_items,
        calories: aiOutput.approx_calories,
        mood,
        ai_advice: aiOutput.advice,
        log_date: new Date().toISOString().slice(0, 10),
      },
    ]).select();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      message: "Meal saved with AI-estimated calories and advice.",
      data: data[0],
    });

  } catch (err: any) {
    console.error("❌ Gemini/Supabase Error:", err.message);
    return NextResponse.json({ error: "Failed to log meal." }, { status: 500 });
  }
}

// GET and PATCH remain largely the same, but ensure you use error handling
export async function GET() {
  try {
    const { data, error } = await supabase
      .from("food_logs")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return NextResponse.json({ data });
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to fetch food logs." }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const { user_id, glasses } = await req.json();
    const today = new Date().toISOString().slice(0, 10);

    const { data: existingLogs, error: fetchError } = await supabase
      .from("food_logs")
      .select("*")
      .eq("user_id", user_id)
      .eq("log_date", today)
      .limit(1);

    if (fetchError) throw fetchError;

    if (existingLogs && existingLogs.length > 0) {
      const log = existingLogs[0];
      const { error } = await supabase
        .from("food_logs")
        .update({ water_intake: (log.water_intake || 0) + glasses })
        .eq("id", log.id);
      if (error) throw error;
    } else {
      const { error } = await supabase.from("food_logs").insert([{
          user_id,
          meal_type: "Water",
          food_items: ["Water"],
          calories: 0,
          ai_advice: "Stay hydrated 💧",
          water_intake: glasses,
          log_date: today,
      }]);
      if (error) throw error;
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to update water." }, { status: 500 });
  }
}