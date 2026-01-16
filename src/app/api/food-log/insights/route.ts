import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!,
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(req: Request) {
  try {
    const { user_id, meal_type, food_items, mood, date } = await req.json();

    if (!food_items) {
      return NextResponse.json({ error: "No food items provided" }, { status: 400 });
    }

    const foodText = Array.isArray(food_items) ? food_items.join(", ") : String(food_items);

    // Default fallback in case AI fails
    let aiResult = { calories: 0, advice: "Log saved. AI analysis pending." };

    try {
      // Use Gemini 2.5 Flash for speed and reliability
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [{ role: "user", parts: [{ text: `Estimate calories for: ${foodText}` }] }],
        config: {
          systemInstruction: "You are a professional dietitian. Respond ONLY with a JSON object containing 'calories' (number) and 'advice' (string).",
          responseMimeType: "application/json",
          responseSchema: {
            type: "object",
            properties: {
              calories: { type: "number" },
              advice: { type: "string" }
            },
            required: ["calories", "advice"]
          }
        }
      });

      // ✅ FIX: In the new SDK, response text is accessed like this:
      const rawText = response.text; 
      if (rawText) {
        aiResult = JSON.parse(rawText);
      }
    } catch (aiErr: any) {
      console.error("🤖 AI Analysis failed:", aiErr.message);
      // We proceed with fallback to ensure the user's log is NOT lost
    }

    // 2️⃣ Save to Supabase (Ensure your table has these columns)
    const { data, error } = await supabase.from("food_logs").insert([
      {
        user_id,
        meal_type,
        food_items,
        calories: aiResult.calories,
        mood,
        ai_advice: aiResult.advice,
        date: date || new Date().toISOString().split('T')[0]
      },
    ]).select();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      data,
      aiResult,
    });
  } catch (err: any) {
    console.error("💥 Critical error:", err.message);
    return NextResponse.json(
      { error: "Internal server error", details: err.message },
      { status: 500 }
    );
  }
}