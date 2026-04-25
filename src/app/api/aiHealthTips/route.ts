export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { GoogleGenerativeAI, SchemaType, Schema } from "@google/generative-ai";

// Define the schema with 'as const' to satisfy TypeScript's strict type checking
const schema: Schema = {
  description: "A list of 4 motivational health tips",
  type: SchemaType.ARRAY,
  items: {
    type: SchemaType.STRING,
  },
} as const;

export async function POST(req: Request) {
  try {
    const { bmi, goal, gender } = await req.json();

    if (!bmi || !goal || !gender) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "Gemini API key missing" }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    
    // Initializing the model
    const model = genAI.getGenerativeModel({
      model: "gemini-3-flash", 
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: schema,
      },
    });

    const prompt = `
      You are a professional nutritionist. Generate 4 short, motivational AI health tips 
      specifically for someone with:
      - BMI: ${bmi}
      - Goal: ${goal}
      - Gender: ${gender}

      Keep tips simple, positive, and human-like. 
      Use local Bangladeshi context where relevant (e.g., seasonal fruits like mango/jackfruit, 
      or habits like walking in the local park or rooftop).
    `;

    console.log("🧠 Generating tips with Gemini 3...");
    const result = await model.generateContent(prompt);
    const response = await result.response;
    
    // The SDK returns the text as a JSON string because of the responseSchema configuration
    const aiTips = JSON.parse(response.text());

    console.log("✅ Successfully generated tips.");
    return NextResponse.json({ aiTips });

  } catch (err: any) {
    console.error("💥 Gemini API Error:", err.message);
    return NextResponse.json(
      { error: "Failed to generate AI health tips", details: err.message },
      { status: 500 }
    );
  }
}