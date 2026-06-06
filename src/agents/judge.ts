import { Agent } from "@openai/agents";
import { z } from "zod";

import { FAST_SETTINGS, MODEL } from "./model";

export const verdictSchema = z.object({
  score: z.number().min(1).max(10),
  survivalChance: z.string(),
  verdict: z.string(),
  summary: z.string(),
});

export const judgeAgent = new Agent({
  name: "Judge Agent",
  model: MODEL,
  modelSettings: FAST_SETTINGS,
  instructions: `You are a startup judge.

Review all agent outputs.

Generate:
- Score from 1-10
- Survival percentage
- Verdict
- Summary

Be concise, decisive, and funny without being cruel.`,
  outputType: verdictSchema,
});
