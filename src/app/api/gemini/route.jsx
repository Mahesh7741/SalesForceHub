import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const ai = new GoogleGenerativeAI(GEMINI_API_KEY);

export async function POST(request) {
  try {
    const { prompt } = await request.json();
    if (!prompt) {
      return NextResponse.json({ error: "Missing prompt" }, { status: 400 });
    }

    const model = ai.getGenerativeModel({ model: "gemini-2.0-flash" });

    const result = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [
            {
              text: "You are a Salesforce expert. Convert the following natural language request into a valid SOQL query. Respond ONLY with the SOQL query. No explanation, no markdown, no formatting.",
            },
            {
              text: prompt,
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.2,
        maxOutputTokens: 1024,
      },
    });

    const generatedText = result.response.text().trim();

    const cleaned = generatedText.replace(/soql|/gi, "").trim();

    if (!cleaned.toUpperCase().startsWith("SELECT")) {
      return NextResponse.json({ error: "Invalid SOQL generated" }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      query: cleaned,
      provider: "gemini-2.0-flash",
    });
  } catch (err) {
    console.error("Gemini error:", err);
    return NextResponse.json(
      { error: err?.message || "Something went wrong" },
      { status: 500 }
);
}
}
