import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { idea } = await req.json();

    if (!idea) {
      return NextResponse.json({ error: "Startup idea is required" }, { status: 400 });
    }

    // Fetch a random tech/startup-related meme since the OpenAI API key lacks DALL-E access
    const res = await fetch("https://meme-api.com/gimme/ProgrammerHumor");
    
    if (!res.ok) {
      throw new Error(`Meme API responded with status ${res.status}`);
    }

    const data = await res.json();
    
    return NextResponse.json({ url: data.url });
  } catch (error) {
    console.error("Meme generation error:", error);
    return NextResponse.json(
      { error: "Internal server error fetching meme" },
      { status: 500 }
    );
  }
}
