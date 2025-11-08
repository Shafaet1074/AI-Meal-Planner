export const dynamic = "force-dynamic"; 
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { bmi, goal, gender } = await req.json();

    if (!bmi || !goal || !gender) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
    if (!OPENROUTER_API_KEY) {
      return NextResponse.json({ error: "API key missing" }, { status: 500 });
    }

    const prompt = `
    You are a professional nutritionist. Based on the following profile:
    - BMI: ${bmi}
    - Goal: ${goal}
    - Gender: ${gender}

    Generate 4 short, motivational AI health tips.
    Keep them simple, positive, and human-like.
    Example: "💧 Drink at least 2.5L of water daily — hydration boosts metabolism."
    Return only a valid JSON array of strings, nothing else.
    `;

    console.log("🧠 Sending request to OpenRouter...");
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "deepseek/deepseek-chat-v3.1:free",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.6,
        max_tokens: 300,
      }),
    });

    console.log("🌐 API status:", response.status);

    const data = await response.json();
    const raw = data?.choices?.[0]?.message?.content || "";

    const match = raw.match(/\[[\s\S]*\]/);
    if (!match) {
      console.error("⚠️ No valid JSON array found:", raw);
      return NextResponse.json({ aiTips: [] });
    }

    let aiTips = [];
    try {
      aiTips = JSON.parse(match[0]);
    } catch (e) {
      console.error("💥 JSON parse error:", e, "Raw content:", raw);
    }

    console.log("✅ Parsed AI Tips:", aiTips);
    return NextResponse.json({ aiTips });
  } catch (err) {
    console.error("💥 AI Tips Error:", err);
    return NextResponse.json(
      { error: "Failed to generate AI health tips" },
      { status: 500 }
    );
  }
}
