import "server-only";

import { run } from "@openai/agents";

import { competitorAgent } from "@/agents/competitor";
import { customerAgent } from "@/agents/customer";
import { investorAgent } from "@/agents/investor";
import { judgeAgent } from "@/agents/judge";
import { roastAgent } from "@/agents/roast";
import { triageAgent } from "@/agents/triage";
import type { PanelistKey, RoastEvent } from "@/types/report";

type EmitEvent = (event: RoastEvent) => void;

const workflowOptions = {
  maxTurns: 3,
  tracingDisabled: false,
  workflowName: "AI Startup Roast",
} as const;

function agentInput(idea: string, triage: unknown) {
  return JSON.stringify(
    {
      startupIdea: idea,
      triage,
    },
    null,
    2,
  );
}

async function runPanelist(
  agent: typeof investorAgent,
  key: PanelistKey,
  input: string,
  emit: EmitEvent,
) {
  // Token-level streaming: forward each chunk as it arrives for the live-typing effect.
  const result = await run(agent, input, { ...workflowOptions, stream: true });

  let text = "";
  for await (const chunk of result.toTextStream()) {
    text += chunk;
    emit({ type: "delta", agent: key, text: chunk });
  }
  await result.completed;

  emit({ type: "agent_done", agent: key });

  return text;
}

export async function runStartupRoast(idea: string, emit: EmitEvent) {
  const triageResult = await run(triageAgent, idea, workflowOptions);
  const triage = triageResult.finalOutput;

  if (!triage) {
    throw new Error("Triage agent did not return a structured summary.");
  }

  emit({ type: "triage", data: triage });

  const input = agentInput(idea, triage);
  const panel: Array<{ key: PanelistKey; agent: typeof investorAgent }> = [
    { key: "investor", agent: investorAgent },
    { key: "customer", agent: customerAgent },
    { key: "competitor", agent: competitorAgent },
    { key: "roast", agent: roastAgent },
  ];

  // One panelist failing shouldn't end the show — the judge rules on whatever survives.
  const settled = await Promise.allSettled(
    panel.map(({ key, agent }) => runPanelist(agent, key, input, emit)),
  );

  const panelOutputs: Partial<Record<PanelistKey, string>> = {};
  settled.forEach((outcome, i) => {
    const key = panel[i].key;
    if (outcome.status === "fulfilled") {
      panelOutputs[key] = outcome.value;
    } else {
      emit({
        type: "error",
        agent: key,
        message:
          outcome.reason instanceof Error
            ? outcome.reason.message
            : String(outcome.reason),
      });
    }
  });

  if (Object.keys(panelOutputs).length === 0) {
    throw new Error("Every panelist failed — there is nothing to judge.");
  }

  const verdictResult = await run(
    judgeAgent,
    JSON.stringify(
      {
        idea,
        triage,
        ...panelOutputs,
      },
      null,
      2,
    ),
    workflowOptions,
  );

  const verdict = verdictResult.finalOutput;

  if (!verdict) {
    throw new Error("Judge agent did not return a verdict.");
  }

  emit({ type: "verdict", data: verdict });
  emit({ type: "done" });
}
