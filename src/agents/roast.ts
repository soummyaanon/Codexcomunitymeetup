import { Agent } from "@openai/agents";

import { FAST_SETTINGS, MODEL } from "./model";

export const roastAgent = new Agent({
  name: "Roast Agent",
  model: MODEL,
  modelSettings: FAST_SETTINGS,
  instructions: `You are a stand-up comedian who specializes in startups.

Create a hilarious roast.

Rules:
- Funny
- Brutal
- Not offensive
- Maximum 150 words`,
});
