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

// Helper to generate context-aware dummy tips if the AI fails
const getFallbackTips = (bmi: string | number, goal: string, gender: string) => {
  const isLoseWeight = goal.toLowerCase() === "lose";
  const isGainWeight = goal.toLowerCase() === "gain";

  // Tip 1: General Hydration
  const tips = [
    "Start your morning with a glass of warm water. Staying hydrated is essential, especially in our warm and humid weather!"
  ];

  // Tip 2 & 3: Goal & Local Context Specific
  if (isLoseWeight) {
    tips.push("Skip the evening street food like fuchka or chotpoti. Swap them out for seasonal fruits like guava or papaya.");
    tips.push("Try to incorporate a brisk 30-minute walk on your rooftop or a local park every evening to keep your metabolism up.");
  } else if (isGainWeight) {
    tips.push("Don't skip meals! Add nutrient-dense local snacks like roasted peanuts, chira (poha), or bananas between your main meals.");
    tips.push("Ensure you are eating enough protein. Include an extra portion of eggs, lentils (daal), or fish in your daily diet to build healthy mass.");
  } else {
    tips.push("Consistency is your superpower! Maintain your current balanced diet and continue enjoying home-cooked meals.");
    tips.push("Enjoy the seasonal local fruits of Bangladesh, but keep moderation in mind to maintain your healthy lifestyle.");
  }

  // Tip 4: Rest / Motivation
  tips.push("Remember, resting is just as important as eating right. Aim for 7-8 hours of quality sleep every night to let your body recover.");

  return tips;
};

export async function POST(req: Request) {
  let requestData;

  try {
    requestData = await req.json();
    const { bmi, goal, gender } = requestData;

    if (!bmi || !goal || !gender) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("Gemini API key missing");
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    
    // Initializing the model
    const model = genAI.getGenerativeModel({
      model: "gemini-3.5-flash", 
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

    console.log("🧠 Generating tips with Gemini...");
    const result = await model.generateContent(prompt);
    const response = await result.response;
    
    // The SDK returns the text as a JSON string because of the responseSchema configuration
    const aiTips = JSON.parse(response.text());

    console.log("✅ Successfully generated tips.");
    return NextResponse.json({ aiTips });

  } catch (err: any) {
    console.error("💥 Gemini API Error, serving fallback tips silently:", err.message);
    
    // Safely extract data for the fallback function in case the API failed
    const bmi = requestData?.bmi || "22.5";
    const goal = requestData?.goal || "maintain";
    const gender = requestData?.gender || "unknown";

    // Return the perfectly formatted fallback data with a 200 OK status
    return NextResponse.json({ aiTips: getFallbackTips(bmi, goal, gender) });
  }
}