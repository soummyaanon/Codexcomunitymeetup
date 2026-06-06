# AI Startup Roast Agent Guide

This project is a Next.js demo for a multi-agent “AI Startup Roast” app built around the OpenAI Agents SDK. The app should let a user pitch a startup idea, run several specialized agents, and return a funny but non-offensive roast report.

## Project Intent

Build for a community meetup/live demo. The experience should make agent orchestration obvious:

- A user submits a startup idea.
- A triage agent extracts the structured business summary.
- Investor, customer, competitor, and roast agents run in parallel.
- Results stream into the UI as each agent finishes.
- A judge agent produces the final verdict.

The tone is entertaining, sharp, and demo-friendly. Keep roasts brutal but not hateful, discriminatory, sexual, or personally targeted.

## Stack

- Next.js App Router
- React
- TypeScript
- Tailwind CSS
- shadcn/ui components
- OpenAI Agents SDK: `@openai/agents`
- Zod for structured outputs

Before changing Next.js behavior, read the relevant local docs in `node_modules/next/dist/docs/` because this project uses a newer Next.js version than many model assumptions.

## Target File Structure

Prefer this structure when implementing the plan:

```text
src/
  app/
    page.tsx
    api/
      roast/
        route.ts
  agents/
    triage.ts
    investor.ts
    customer.ts
    competitor.ts
    roast.ts
    judge.ts
  components/
    startup-form.tsx
    agent-card.tsx
    roast-report.tsx
  lib/
    openai.ts
    workflow.ts
    utils.ts
  types/
    report.ts
```

## Agent Workflow

Use the OpenAI Agents SDK on the server only. Do not import SDK code into client components.

Expected orchestration:

```ts
const triageResult = await run(triageAgent, startupIdea);

const [investor, customer, competitor, roast] = await Promise.all([
  run(investorAgent, triageResult),
  run(customerAgent, triageResult),
  run(competitorAgent, triageResult),
  run(roastAgent, triageResult),
]);

const verdict = await run(judgeAgent, {
  investor,
  customer,
  competitor,
  roast,
});
```

Keep agent definitions small and explicit. Put each agent in its own file under `src/agents/`.

## Agents

### Triage Agent

Purpose: understand the startup idea and return structured business context.

Responsibilities:

- Identify product
- Identify audience
- Identify business model
- Produce a one-sentence summary

Use structured output with fields:

```ts
{
  product: string;
  audience: string;
  businessModel: string;
  summary: string;
}
```

Prompt:

```text
You are a startup analyst.

Analyze the startup idea and return:
- Product
- Target audience
- Business model
- One sentence summary

Keep the response concise.
```

### Investor Agent

Purpose: evaluate investment potential.

Prompt:

```text
You are a ruthless venture capitalist.

Evaluate:
- Market size
- Revenue potential
- Defensibility
- Scalability

Be brutally honest.
Maximum 100 words.
```

### Customer Agent

Purpose: represent real target users.

Prompt:

```text
You are the target customer.

Explain:
- Why you would use it
- Why you would not use it

Be sarcastic and funny.
Maximum 100 words.
```

### Competitor Agent

Purpose: attack the idea from the incumbent’s perspective.

Prompt:

```text
Act as the founder of the largest competitor.

Explain why this startup will fail.

Maximum 100 words.
```

### Roast Agent

Purpose: create the funniest response.

Prompt:

```text
You are a stand-up comedian who specializes in startups.

Create a hilarious roast.

Rules:
- Funny
- Brutal
- Not offensive
- Maximum 150 words
```

### Judge Agent

Purpose: combine all agent outputs into the final verdict.

Use structured output with fields:

```ts
{
  score: number;
  survivalChance: string;
  verdict: string;
  summary: string;
}
```

Prompt:

```text
You are a startup judge.

Review all agent outputs.

Generate:
- Score from 1-10
- Survival percentage
- Verdict
- Summary

Be concise.
```

## API Contract

Implement `POST /api/roast`.

Request:

```json
{
  "idea": "Uber for Dog Walkers"
}
```

Response should support streaming progress for the live demo. Existing types in `src/types/report.ts` define the intended event contract:

- `triage`
- `delta`
- `agent_done`
- `verdict`
- `error`
- `done`

If streaming is not implemented yet, keep the same response shape so the UI can migrate cleanly.

Final report shape:

```json
{
  "investor": "...",
  "customer": "...",
  "competitor": "...",
  "roast": "...",
  "verdict": {
    "score": 4,
    "survivalChance": "18%",
    "verdict": "Probably Dead",
    "summary": "Final recommendation"
  }
}
```

## UI Expectations

The first screen should be the actual usable demo, not a marketing landing page.

Required UI:

- Startup idea input
- “Roast My Startup” action
- Agent result areas for investor, customer, competitor, and roast
- Final verdict section with score, survival chance, verdict, and summary
- Loading/progress states as agents run
- Clear error state when the API key or workflow fails

The interface should feel like a live roast panel: sharp, fast, readable from a meetup room, and easy to understand without explanation.

## Implementation Rules

- Keep SDK usage server-side.
- Validate request bodies.
- Require `OPENAI_API_KEY` on the server.
- Use `Promise.all` for independent specialist agents.
- Keep outputs concise so the demo completes quickly.
- Prefer existing shadcn/ui primitives in `src/components/ui/`.
- Keep TypeScript types aligned with `src/types/report.ts`.
- Do not add unrelated auth, persistence, databases, or account systems.
- Avoid broad refactors unless they are necessary for the demo.

## Verification

Before handing off implementation work:

- Run `npm run lint`.
- Run `npm run build` when practical.
- Manually verify the form can submit an idea.
- Confirm failures are user-visible when `OPENAI_API_KEY` is missing.

