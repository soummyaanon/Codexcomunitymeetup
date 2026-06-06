# AI Startup Roast 🔥

A fun multi-agent application built with the OpenAI Agents SDK and Next.js.

The user pitches a startup idea and multiple AI agents analyze, criticize, and roast it from different perspectives before producing a final verdict.

---

# Goal

Build an entertaining demo that showcases:

* OpenAI Agents SDK
* Agent orchestration
* Parallel execution
* Handoffs
* Structured outputs
* Streaming UI
* Multi-agent collaboration

Perfect for community meetups and live demos.

---

# User Journey

1. User enters startup idea
2. Triage Agent analyzes the idea
3. Multiple specialist agents run in parallel
4. Results stream to the UI
5. Judge Agent generates final verdict
6. User receives a roast report

Example:

> "Uber for Dog Walkers"

Output:

* Investor says it's not venture-scale
* Customer says they wouldn't pay
* Competitor says they already exist
* Roast Agent destroys the idea
* Judge gives survival probability

---

# System Architecture

```text
                    User
                      |
                      v
              Startup Form
                      |
                      v
              Triage Agent
                      |
      --------------------------------
      |              |              |
      v              v              v
 Investor Agent  Customer Agent  Competitor Agent
      |
      |
      v
  Roast Agent
      |
      v
   Judge Agent
      |
      v
 Final Startup Report
```

---

# Agent Definitions

## Triage Agent

Purpose:

Understand the startup idea and create a structured summary.

Responsibilities:

* Identify product
* Identify audience
* Identify business model
* Extract core value proposition

Example Output:

```json
{
  "product": "Dog walking marketplace",
  "audience": "Pet owners",
  "businessModel": "Commission"
}
```

Prompt:

```txt
You are a startup analyst.

Analyze the startup idea and return:

- Product
- Target audience
- Business model
- One sentence summary

Keep the response concise.
```

---

## Investor Agent

Purpose:

Evaluate investment potential.

Prompt:

```txt
You are a ruthless venture capitalist.

Evaluate:

- Market size
- Revenue potential
- Defensibility
- Scalability

Be brutally honest.

Maximum 100 words.
```

Output Example:

```txt
This feels more like a local service business than a venture-scale startup.

Market opportunity is limited.
```

---

## Customer Agent

Purpose:

Represent real users.

Prompt:

```txt
You are the target customer.

Explain:

- Why you would use it
- Why you would not use it

Be sarcastic and funny.

Maximum 100 words.
```

Output Example:

```txt
I love my dog.

I do not love paying monthly
for someone else to walk him.
```

---

## Competitor Agent

Purpose:

Attack the idea.

Prompt:

```txt
Act as the founder of the largest competitor.

Explain why this startup will fail.

Maximum 100 words.
```

Output Example:

```txt
We already have millions of users.

You are competing with years of distribution.
```

---

## Roast Agent

Purpose:

Generate the funniest response.

Prompt:

```txt
You are a stand-up comedian who specializes in startups.

Create a hilarious roast.

Rules:

- Funny
- Brutal
- Not offensive
- Maximum 150 words
```

Output Example:

```txt
This startup has the same energy as
building a dating app for left-handed dentists.

Technically possible.

Financially confusing.
```

---

## Judge Agent

Purpose:

Generate final verdict.

Input:

* Investor analysis
* Customer analysis
* Competitor analysis
* Roast

Output Schema:

```json
{
  "score": 4,
  "survivalChance": "18%",
  "verdict": "Probably Dead",
  "summary": "Final recommendation"
}
```

Prompt:

```txt
You are a startup judge.

Review all agent outputs.

Generate:

- Score from 1-10
- Survival percentage
- Verdict
- Summary

Be concise.
```

---

# Tech Stack

Frontend:

* Next.js 15
* React
* Tailwind CSS
* shadcn/ui

Backend:

* Next.js Route Handlers
* OpenAI Agents SDK

Deployment:

* Vercel

---

# Folder Structure

```text
src/

app/
├── page.tsx
├── api/
│   └── roast/
│       └── route.ts

components/
├── startup-form.tsx
├── agent-card.tsx
├── roast-report.tsx

lib/
├── openai.ts
├── workflow.ts

agents/
├── triage.ts
├── investor.ts
├── customer.ts
├── competitor.ts
├── roast.ts
├── judge.ts

types/
└── report.ts
```

---

# Workflow

```ts
const triageResult = await run(
  triageAgent,
  startupIdea
);

const [
  investor,
  customer,
  competitor,
  roast
] = await Promise.all([
  run(investorAgent, triageResult),
  run(customerAgent, triageResult),
  run(competitorAgent, triageResult),
  run(roastAgent, triageResult)
]);

const verdict = await run(
  judgeAgent,
  {
    investor,
    customer,
    competitor,
    roast
  }
);
```

---

# API Contract

POST /api/roast

Request:

```json
{
  "idea": "Uber for Dog Walkers"
}
```

Response:

```json
{
  "investor": "...",
  "customer": "...",
  "competitor": "...",
  "roast": "...",
  "verdict": {
    "score": 4,
    "survivalChance": "18%",
    "verdict": "Probably Dead"
  }
}
```

---

# UI Layout

```text
---------------------------------
      AI STARTUP ROAST
---------------------------------

[ Startup Idea Input ]

[ Roast My Startup ]

---------------------------------

Investor Agent
----------------
Analysis...

Customer Agent
----------------
Analysis...

Competitor Agent
----------------
Analysis...

Roast Agent
----------------
🔥 Funny roast

---------------------------------

FINAL VERDICT

Score: 4/10

Survival Chance: 18%

Probably Dead
```

---

# Streaming Experience

As agents complete:

```text
Investor Agent is thinking...

Customer Agent is thinking...

Competitor Agent is thinking...

Roast Agent is cooking...
```

Responses appear one by one.

This creates suspense during live demos.

---

# Future Enhancements

## YC Mode

Additional agents:

* Sam Altman
* Paul Graham
* Shark Tank Investor
* Angry Reddit User

---

## Voice Pitch Mode

User speaks instead of typing.

Speech → Transcript → Agents

---

## Audience Voting

People at the meetup vote:

* Fund It
* Kill It

Compare human decision versus AI decision.

---

# Success Criteria

The demo should:

* Accept startup ideas
* Run multiple agents in parallel
* Stream results
* Generate funny roasts
* Produce final verdict
* Complete in under 10 seconds

If attendees laugh and immediately understand why multiple agents are useful, the project has succeeded.
