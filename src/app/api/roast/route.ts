import { runStartupRoast } from "@/lib/workflow";
import type { RoastEvent } from "@/types/report";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
// Triage + parallel panel + judge needs headroom when deployed on Vercel.
export const maxDuration = 60;

const encoder = new TextEncoder();

function encodeEvent(event: RoastEvent) {
  return encoder.encode(`data: ${JSON.stringify(event)}\n\n`);
}

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }

  const idea = typeof body === "object" && body !== null && "idea" in body
    ? String(body.idea).trim()
    : "";

  if (!idea) {
    return Response.json({ error: "A startup idea is required." }, { status: 400 });
  }

  if (!process.env.OPENAI_API_KEY) {
    return Response.json(
      { error: "OPENAI_API_KEY is not configured on the server." },
      { status: 500 },
    );
  }

  const stream = new ReadableStream({
    async start(controller) {
      const emit = (event: RoastEvent) => {
        try {
          controller.enqueue(encodeEvent(event));
        } catch {
          // Client disconnected mid-stream; nothing left to write to.
        }
      };

      try {
        await runStartupRoast(idea, emit);
      } catch (error) {
        emit({
          type: "error",
          message: error instanceof Error ? error.message : "The roast workflow failed.",
        });
      } finally {
        try {
          controller.close();
        } catch {
          // Stream already closed.
        }
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "Content-Type": "text/event-stream; charset=utf-8",
      "X-Accel-Buffering": "no",
    },
  });
}
