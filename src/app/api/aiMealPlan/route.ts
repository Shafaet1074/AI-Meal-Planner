export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { GoogleGenerativeAI, SchemaType, Schema } from "@google/generative-ai";

// Define the schema with 'as const' to ensure nested properties match SDK requirements
const schema: Schema = {
  description: "Daily food plan",
  type: SchemaType.OBJECT,
  properties: {
    breakfast: {
      type: SchemaType.OBJECT,
      properties: {
        items: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
        calories: { type: SchemaType.STRING },
      },
      required: ["items", "calories"],
    },
    lunch: {
      type: SchemaType.OBJECT,
      properties: {
        items: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
        calories: { type: SchemaType.STRING },
      },
      required: ["items", "calories"],
    },
    snacks: {
      type: SchemaType.OBJECT,
      properties: {
        items: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
        calories: { type: SchemaType.STRING },
      },
      required: ["items", "calories"],
    },
    dinner: {
      type: SchemaType.OBJECT,
      properties: {
        items: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
        calories: { type: SchemaType.STRING },
      },
      required: ["items", "calories"],
    },
    nutrition_summary: { type: SchemaType.STRING },
  },
  required: ["breakfast", "lunch", "snacks", "dinner", "nutrition_summary"],
} as const;

export async function POST(req: Request) {
  try {
    const { bmi, goal, gender } = await req.json();

    if (!bmi || !goal || !gender) {
      return NextResponse.json({ error: "Missing profile info" }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "Gemini API key not configured" }, { status: 500 });
    }

    // Initialize the SDK
    const genAI = new GoogleGenerativeAI(apiKey);
    
    // Using the stable Gemini 3 Flash model
    const model = genAI.getGenerativeModel({
      model: "gemini-3-flash",
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: schema,
      },
    });

    const prompt = `
      You are a certified nutritionist and chef specializing in Bangladeshi cuisine.
      Generate a healthy, culturally relevant daily food plan (using local ingredients like 
      Lal Shak, Rui fish, Daal, etc.) for a user with:
      - BMI: ${bmi}
      - Goal: ${goal}
      - Gender: ${gender}
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // With responseSchema, the output is guaranteed to follow your object structure
    const plan = JSON.parse(text);

    return NextResponse.json(plan);
    
  } catch (err) {
    console.error("💥 Gemini API error:", err);
    return NextResponse.json(
      { error: "Failed to generate plan", details: (err as any).message },
      { status: 500 }
    );
  }
}