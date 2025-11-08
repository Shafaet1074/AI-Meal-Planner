export const dynamic = "force-dynamic"; 
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { bmi, goal, gender } = await req.json();

    if (!bmi || !goal || !gender) {
      return NextResponse.json({ error: "Missing profile info" }, { status: 400 });
    }

    const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
    if (!OPENROUTER_API_KEY) {
      return NextResponse.json(
        { error: "OpenRouter API key not configured" },
        { status: 500 }
      );
    }

    const prompt = `
You are a certified nutritionist and chef specializing in Bangladeshi cuisine.
Generate a healthy, culturally relevant daily food plan based on:

- BMI: ${bmi}
- Goal: ${goal}
- Gender: ${gender}

Return ONLY valid JSON in this format:
{
  "breakfast": { "items": ["Item 1", "Item 2"], "calories": "XXX kcal" },
  "lunch": { "items": ["Item 1", "Item 2"], "calories": "XXX kcal" },
  "snacks": { "items": ["Item 1", "Item 2"], "calories": "XXX kcal" },
  "dinner": { "items": ["Item 1", "Item 2"], "calories": "XXX kcal" },
  "nutrition_summary": "Short daily nutrition summary"
}`;

    console.log("🤖 Sending prompt to OpenRouter...");

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
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
            content: "You are a professional dietitian. Respond ONLY with valid JSON.",
          },
          { role: "user", content: prompt },
        ],
        max_tokens: 1500,
        temperature: 0.6,
      }),
    });

    console.log("🌐 OpenRouter response status:", response.status);

    const data = await response.json();
    console.log("🧩 OpenRouter raw data:", data);

    const content = data?.choices?.[0]?.message?.content;

    if (!content) {
      console.error("⚠️ No message content from AI");
      return NextResponse.json({ error: "No response from AI" }, { status: 500 });
    }

    // 🧠 Try extracting JSON safely
    const match = content.match(/\{[\s\S]*\}/);
    if (!match) {
      console.error("⚠️ AI response missing JSON:", content);
      return NextResponse.json({ error: "Invalid AI JSON format" }, { status: 500 });
    }

    let plan;
    try {
      plan = JSON.parse(match[0]);
    } catch (parseErr) {
      console.error("💥 JSON Parse Error:", parseErr);
      return NextResponse.json({ error: "Failed to parse AI response" }, { status: 500 });
    }

    console.log("✅ Parsed AI Plan:", plan);
    return NextResponse.json(plan);
  } catch (err) {
    console.error("💥 AI meal plan error:", err);
    return NextResponse.json(
      { error: "Failed to generate plan", details: (err as Error).message },
      { status: 500 }
    );
  }
}
