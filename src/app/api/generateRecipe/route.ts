export const dynamic = "force-dynamic"; 
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { ingredients, dietaryPreferences } = await req.json();

    if (!ingredients || ingredients.length === 0) {
      return NextResponse.json(
        { error: "No ingredients provided" },
        { status: 400 }
      );
    }

    const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
    if (!OPENROUTER_API_KEY) {
      return NextResponse.json(
        { error: "OpenRouter API key not configured" },
        { status: 500 }
      );
    }

    const prompt = `Create a detailed recipe using these ingredients: ${ingredients.join(
      ", "
    )}.
${dietaryPreferences ? `Dietary preferences: ${dietaryPreferences}.` : ""}

Return ONLY valid JSON in this exact format:
{
  "title": "Creative recipe name",
  "ingredients": [
    "ingredient with precise quantity and preparation notes"
  ],
  "instructions": [
    "Clear step-by-step instruction"
  ],
  "prep_time": "X minutes",
  "cook_time": "X minutes",
  "servings": "X people",
  "difficulty": "Easy/Medium/Hard"
}

Important: Return ONLY the JSON object, no additional text, no code blocks, no explanations.`;

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "meta-llama/llama-3.3-8b-instruct:free",
        messages: [
          {
            role: "system",
            content:
              "You are a professional chef. Always respond with ONLY valid JSON. No markdown, no code blocks, no extra text."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 1500,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("OpenRouter API error:", errorData);
      return NextResponse.json(
        { error: "Recipe generation service is currently unavailable" },
        { status: 502 }
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      console.error("No content in response:", data);
      return NextResponse.json(
        { error: "No recipe generated - please try again" },
        { status: 500 }
      );
    }

    // Safely extract JSON from response
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/); // extract the first JSON block
      if (!jsonMatch) {
        console.error("No JSON found in AI response:", content);
        return NextResponse.json(
          { error: "Failed to parse recipe response" },
          { status: 500 }
        );
      }

      const recipeJSON = JSON.parse(jsonMatch[0]);
      return NextResponse.json({ recipe: recipeJSON });
    } catch (parseError) {
      console.error("JSON parsing error:", parseError);
      console.error("Raw content:", content);
      return NextResponse.json(
        { error: "Failed to parse recipe response" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error generating recipe:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
