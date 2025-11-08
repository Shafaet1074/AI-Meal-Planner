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

    // 🧠 AI Prompt
    const aiPrompt = `
You are a certified nutritionist.
Estimate the approximate total calories of the following meal and give ONE short nutrition tip.
Return ONLY valid JSON in this exact format:
{
  "approx_calories": number,
  "advice": "string"
}
Meal type: ${meal_type}
Foods: ${Array.isArray(food_items) ? food_items.join(", ") : food_items}
Mood: ${mood || "N/A"}
`;

    // 🚀 AI Request
    const aiRes = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "deepseek/deepseek-chat-v3.1:free",
        messages: [
          {
            role: "system",
            content:
              "You are an expert dietitian. Respond ONLY with valid JSON — no extra text, markdown, or symbols.",
          },
          { role: "user", content: aiPrompt },
        ],
        temperature: 0.3,
      }),
    });

    const aiData = await aiRes.json();
    let rawContent = aiData?.choices?.[0]?.message?.content || "";

    // Clean JSON
    const firstBrace = rawContent.indexOf("{");
    const lastBrace = rawContent.lastIndexOf("}");
    const cleaned =
      firstBrace !== -1 && lastBrace !== -1
        ? rawContent.slice(firstBrace, lastBrace + 1)
        : rawContent;

    let aiOutput: { approx_calories?: number; advice?: string } = {};
    try {
      aiOutput = JSON.parse(cleaned);
    } catch (err) {
      console.error("⚠️ AI response parse error. Raw:", rawContent);
      return NextResponse.json(
        { error: "AI returned invalid JSON format." },
        { status: 500 }
      );
    }

    const { approx_calories, advice } = aiOutput;
    if (!approx_calories || isNaN(approx_calories)) {
      return NextResponse.json(
        { error: "AI failed to estimate calories accurately." },
        { status: 500 }
      );
    }

    // 💾 Save to Supabase
    const { data, error } = await supabase.from("food_logs").insert([
      {
        user_id,
        meal_type,
        food_items,
        calories: approx_calories,
        mood,
        ai_advice: advice,
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
