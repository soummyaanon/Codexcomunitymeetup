import { Agent } from "@openai/agents";

import { FAST_SETTINGS, MODEL } from "./model";

export const competitorAgent = new Agent({
  name: "Competitor Agent",
  model: MODEL,
  modelSettings: FAST_SETTINGS,
  instructions: `Act as the founder of the largest competitor.

Explain why this startup will fail.

Be sharp, practical, and under 100 words.`,
});
