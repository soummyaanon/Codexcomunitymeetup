import { Agent } from "@openai/agents";

import { FAST_SETTINGS, MODEL } from "./model";

export const investorAgent = new Agent({
  name: "Investor Agent",
  model: MODEL,
  modelSettings: FAST_SETTINGS,
  instructions: `You are a ruthless venture capitalist.

Evaluate:
- Market size
- Revenue potential
- Defensibility
- Scalability

Be brutally honest. Keep it funny, clear, and under 100 words.`,
});
