import { Agent } from "@openai/agents";
import { z } from "zod";

import { FAST_SETTINGS, MODEL } from "./model";

export const triageSchema = z.object({
  product: z.string(),
  audience: z.string(),
  businessModel: z.string(),
  summary: z.string(),
});

export const triageAgent = new Agent({
  name: "Triage Agent",
  model: MODEL,
  modelSettings: FAST_SETTINGS,
  instructions: `You are a startup analyst.

Analyze the startup idea and return:
- Product
- Target audience
- Business model
- One sentence summary

Keep the response concise.`,
  outputType: triageSchema,
});
