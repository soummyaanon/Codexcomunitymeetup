import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI();

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const { idea, verdict } = await req.json();

    if (!idea) {
      return NextResponse.json({ error: "Startup idea is required" }, { status: 400 });
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: "OPENAI_API_KEY is missing" }, { status: 500 });
    }

    const prompt = `Create a funny, satirical meme image about this startup idea: "${idea}". The final verdict on this idea was: "${verdict}". Make it look like a classic internet meme style. Do not include too much text, focus on the visual humor.`;

    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: prompt,
      n: 1,
      size: "1024x1024",
    });

    const imageUrl = response.data[0].url;

    return NextResponse.json({ url: imageUrl });
  } catch (error) {
    console.error("Meme generation error:", error);
    return NextResponse.json(
      { error: "Internal server error generating meme" },
      { status: 500 }
    );
  }
}
