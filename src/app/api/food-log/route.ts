export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { GoogleGenerativeAI, SchemaType, Schema } from "@google/generative-ai";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// 🧠 Define Gemini output schema to guarantee clean JSON
const schema: Schema = {
  type: SchemaType.OBJECT,
  properties: {
    approx_calories: { type: SchemaType.NUMBER },
    advice: { type: SchemaType.STRING },
  },
  required: ["approx_calories", "advice"],
};

export async function POST(req: Request) {
  try {
    const { user_id, meal_type, food_items, mood } = await req.json();

    if (!user_id || !food_items) {
      return NextResponse.json(
        { error: "Missing required fields: user_id and food_items." },
        { status: 400 }
      );
    }

    const foodText = Array.isArray(food_items)
      ? food_items.join(", ")
      : String(food_items);

    let aiOutput = { approx_calories: 0, advice: "Unable to analyze meal accurately." };

    // 🚀 Call Gemini
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) throw new Error("GEMINI_API_KEY is not configured.");

      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({
        model: "gemini-3.5-flash",
        systemInstruction: "You are an expert dietitian. Respond ONLY with valid JSON — no extra text, markdown, or symbols.",
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: schema,
          temperature: 0.3,
        },
      });

      const prompt = `Estimate the approximate total calories of the following meal and give ONE short nutrition tip.
        Meal type: ${meal_type}
        Foods: ${foodText}
        Mood: ${mood || "N/A"}`;

      const result = await model.generateContent(prompt);
      const responseText = result.response.text();
      
      if (responseText) {
        aiOutput = JSON.parse(responseText);
      }
    } catch (aiError: any) {
      console.error("⚠️ Gemini API Error:", aiError.message);
      // We don't throw here so the meal still saves even if AI fails
    }

    if (!aiOutput.approx_calories || isNaN(aiOutput.approx_calories)) {
      aiOutput.approx_calories = 0; // Fallback to 0 if parsing completely fails
    }

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
    ]);

    if (error) throw error;

    return NextResponse.json({
      success: true,
      message: "Meal saved with AI-estimated calories and advice.",
      data,
    });
  } catch (err: any) {
    console.error("❌ Error saving meal:", err.message);
    return NextResponse.json({ error: "Failed to log meal." }, { status: 500 });
  }
}

// 🧩 GET logs
export async function GET() {
  try {
    const { data, error } = await supabase
      .from("food_logs")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return NextResponse.json({ data });
  } catch (err: any) {
    console.error("❌ Fetch error:", err.message);
    return NextResponse.json(
      { error: "Failed to fetch food logs." },
      { status: 500 }
    );
  }
}

// 💧 PATCH: Update water intake
export async function PATCH(req: Request) {
  try {
    const { user_id, glasses } = await req.json();

    if (!user_id || typeof glasses !== "number") {
      return NextResponse.json(
        { error: "Missing or invalid parameters." },
        { status: 400 }
      );
    }

    // Find today's log or create if not exists
    const today = new Date().toISOString().slice(0, 10);

    const { data: existingLogs, error: fetchError } = await supabase
      .from("food_logs")
      .select("*")
      .eq("user_id", user_id)
      .eq("log_date", today)
      .limit(1);

    if (fetchError) throw fetchError;

    if (existingLogs && existingLogs.length > 0) {
      // Update existing record
      const log = existingLogs[0];
      const newWater = (log.water_intake || 0) + glasses;

      const { error: updateError } = await supabase
        .from("food_logs")
        .update({ water_intake: newWater })
        .eq("id", log.id);

      if (updateError) throw updateError;
    } else {
      // Create new record for today
      const { error: insertError } = await supabase.from("food_logs").insert([
        {
          user_id,
          meal_type: "Water",
          food_items: ["Water"],
          calories: 0,
          mood: null,
          ai_advice: "Stay hydrated 💧",
          water_intake: glasses,
          log_date: today,
        },
      ]);

      if (insertError) throw insertError;
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("❌ Water intake update error:", err.message);
    return NextResponse.json(
      { error: "Failed to update water intake." },
      { status: 500 }
    );
  }
}