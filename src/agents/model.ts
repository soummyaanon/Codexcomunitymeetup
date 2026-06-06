import type { ModelSettings } from "@openai/agents";

/** Shared model config — gpt-5-mini with minimal reasoning for fast live demos. */
export const MODEL = "gpt-5-mini";

export const FAST_SETTINGS: ModelSettings = {
  reasoning: { effort: "minimal" },
  text: { verbosity: "low" },
};
