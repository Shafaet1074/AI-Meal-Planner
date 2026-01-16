import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!,
});

export async function POST(req: Request) {
  try {
    const { bmi, goal, gender } = await req.json();

    if (!bmi || !goal || !gender) {
      return NextResponse.json({ error: "Missing info" }, { status: 400 });
    }

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ 
        role: "user", 
        parts: [{ text: `User: ${gender}, BMI: ${bmi}, Goal: ${goal}. Location: Bangladesh.` }] 
      }],
      config: {
        systemInstruction: `You are an elite clinical nutritionist specializing in Bangladeshi dietetics.
        Your task is to generate a comprehensive daily meal plan AND strategic health insights.

        REAL-LIFE PROBLEM SOLVING:
        1. Cultural Context: Focus on local ingredients (Shak, Mach, Daal, seasonal Vorta).
        2. Carb Control: Address the 'over-reliance on white rice' problem by suggesting specific portion controls or fiber-rich alternatives.
        3. Oil Mitigation: Provide hacks to reduce 'Tel' (oil) in traditional cooking without losing flavor.
        4. Actionable Insights: Tips must be specific to this user's BMI and Goal (e.g., 'To reduce your BMI of ${bmi}, try walking 10 mins after your heavy lunch').
        
        RESPOND ONLY IN VALID JSON.`,
        
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            breakfast: { 
                type: "object", 
                properties: { items: { type: "array", items: { type: "string" } }, calories: { type: "string" } },
                required: ["items", "calories"]
            },
            lunch: { 
                type: "object", 
                properties: { items: { type: "array", items: { type: "string" } }, calories: { type: "string" } },
                required: ["items", "calories"]
            },
            snacks: { 
                type: "object", 
                properties: { items: { type: "array", items: { type: "string" } }, calories: { type: "string" } },
                required: ["items", "calories"]
            },
            dinner: { 
                type: "object", 
                properties: { items: { type: "array", items: { type: "string" } }, calories: { type: "string" } },
                required: ["items", "calories"]
            },
            nutrition_summary: { type: "string" },
            // NEW: Integrated AI Tips
            aiTips: { 
                type: "array", 
                items: { type: "string" },
                description: "4 highly specific, culturally relevant health hacks for this specific user profile."
            }
          },
          required: ["breakfast", "lunch", "snacks", "dinner", "nutrition_summary", "aiTips"]
        },
      },
    });

    return NextResponse.json(JSON.parse(response.text));

  } catch (err: any) {
    console.error("Gemini Error:", err);
    return NextResponse.json({ error: "API Error", details: err.message }, { status: 500 });
  }
}