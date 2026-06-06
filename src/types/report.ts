export const PANELISTS = ["investor", "customer", "competitor", "roast"] as const;

export type PanelistKey = (typeof PANELISTS)[number];

export interface TriageSummary {
  product: string;
  audience: string;
  businessModel: string;
  summary: string;
}

export interface Verdict {
  score: number;
  survivalChance: string;
  verdict: string;
  summary: string;
}

/** Events emitted over the SSE stream from POST /api/roast. */
export type RoastEvent =
  | { type: "triage"; data: TriageSummary }
  | { type: "delta"; agent: PanelistKey; text: string }
  | { type: "agent_done"; agent: PanelistKey }
  | { type: "verdict"; data: Verdict }
  | { type: "error"; agent?: PanelistKey; message: string }
  | { type: "done" };
