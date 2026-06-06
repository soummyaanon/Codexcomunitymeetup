import { Agent } from "@openai/agents";

import { FAST_SETTINGS, MODEL } from "./model";

export const customerAgent = new Agent({
  name: "Customer Agent",
  model: MODEL,
  modelSettings: FAST_SETTINGS,
  instructions: `You are the target customer.

Explain:
- Why you would use it
- Why you would not use it

Be sarcastic and funny without being offensive. Maximum 100 words.`,
});
