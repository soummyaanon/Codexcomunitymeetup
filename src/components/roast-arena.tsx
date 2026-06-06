"use client";

import { AgentCard, type AgentPersona } from "@/components/agent-card";
import { RoastReport } from "@/components/roast-report";
import { StartupForm } from "@/components/startup-form";
import { useRoast, type Phase } from "@/hooks/use-roast";
import type { PanelistKey } from "@/types/report";

const PERSONAS: Record<PanelistKey, AgentPersona> = {
  investor: {
    title: "The Investor",
    role: "Ruthless VC, allergic to small TAMs",
    emoji: "💰",
    accent: "oklch(0.78 0.13 85)",
    thinkingLine: "Counting your TAM on one hand",
  },
  customer: {
    title: "The Customer",
    role: "Allegedly your user",
    emoji: "🛒",
    accent: "oklch(0.72 0.15 25)",
    thinkingLine: "Checking their wallet",
  },
  competitor: {
    title: "The Competitor",
    role: "Already shipped your roadmap",
    emoji: "🦈",
    accent: "oklch(0.62 0.1 55)",
    thinkingLine: "Sharpening the knives",
  },
  roast: {
    title: "The Roast",
    role: "Tonight's headliner",
    emoji: "🔥",
    accent: "oklch(0.7 0.18 40)",
    thinkingLine: "Cooking",
  },
};

const OPENING_ACTS: PanelistKey[] = ["investor", "customer", "competitor"];

const NARRATION: Partial<Record<Phase, string>> = {
  triage: "The analyst is reading your pitch…",
  panel: "The panel has the mic.",
  judging: "The judge is deliberating…",
};

export function RoastArena() {
  const { state, start, reset } = useRoast();
  const busy = !["idle", "done", "error"].includes(state.phase);
  const showPanel = state.phase !== "idle";

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-10 px-5 py-10 sm:px-8 sm:py-14">
      {/* Poster header */}
      <header className="animate-rise">
        <div className="flex items-center gap-2">
          <span className="size-2 rounded-full bg-destructive ember-dot" />
          <span className="text-xs font-medium tracking-[0.3em] text-muted-foreground uppercase">
            Live from the meetup
          </span>
        </div>
        <h1 className="mt-3 font-display text-[clamp(3rem,9vw,6.5rem)] leading-[0.95] tracking-wide uppercase">
          AI Startup
          <span className="block text-ember">Roast Night</span>
        </h1>
        <p className="mt-4 max-w-xl text-base text-muted-foreground sm:text-lg">
          Four agents walk into your pitch. None of them are kind. A judge
          decides if the idea leaves alive.
        </p>
      </header>

      <StartupForm busy={busy} onSubmit={start} />

      {/* Empty state: tonight's lineup */}
      {state.phase === "idle" && (
        <section aria-label="Tonight's lineup" className="animate-rise">
          <p className="text-xs font-medium tracking-[0.3em] text-muted-foreground uppercase">
            Tonight&apos;s lineup
          </p>
          <ul className="mt-3 grid gap-x-8 gap-y-2 text-sm sm:grid-cols-2">
            {(Object.keys(PERSONAS) as PanelistKey[]).map((key) => (
              <li key={key} className="flex items-baseline gap-2">
                <span aria-hidden>{PERSONAS[key].emoji}</span>
                <span
                  className="font-display tracking-wide uppercase"
                  style={{ color: PERSONAS[key].accent }}
                >
                  {PERSONAS[key].title}
                </span>
                <span className="text-muted-foreground">
                  — {PERSONAS[key].role}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Top-level failure */}
      {state.phase === "error" && state.error && (
        <div
          role="alert"
          className="animate-rise rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive"
        >
          The show stopped early: {state.error}
        </div>
      )}

      {/* Narration line */}
      {NARRATION[state.phase] && (
        <p
          aria-live="polite"
          className="text-sm tracking-wide text-muted-foreground"
        >
          {NARRATION[state.phase]}
        </p>
      )}

      {/* Triage dossier */}
      {state.triage && (
        <section
          aria-label="Analyst summary"
          className="animate-rise border-l-2 border-ember pl-4"
        >
          <dl className="grid gap-x-8 gap-y-1 text-sm sm:grid-cols-3">
            <div>
              <dt className="text-xs tracking-widest text-muted-foreground uppercase">
                Product
              </dt>
              <dd>{state.triage.product}</dd>
            </div>
            <div>
              <dt className="text-xs tracking-widest text-muted-foreground uppercase">
                Audience
              </dt>
              <dd>{state.triage.audience}</dd>
            </div>
            <div>
              <dt className="text-xs tracking-widest text-muted-foreground uppercase">
                Business model
              </dt>
              <dd>{state.triage.businessModel}</dd>
            </div>
          </dl>
          <p className="mt-2 text-sm text-foreground/75 italic">
            “{state.triage.summary}”
          </p>
        </section>
      )}

      {/* The panel: three opening acts, then the headliner */}
      {showPanel && (
        <section aria-label="The panel" className="flex flex-col gap-4">
          <div className="grid gap-4 md:grid-cols-3">
            {OPENING_ACTS.map((key) => (
              <AgentCard
                key={key}
                persona={PERSONAS[key]}
                state={state.panelists[key]}
              />
            ))}
          </div>
          <AgentCard
            persona={PERSONAS.roast}
            state={state.panelists.roast}
            headliner
          />
        </section>
      )}

      {state.verdict && <RoastReport verdict={state.verdict} />}

      {(state.phase === "done" || state.phase === "error") && (
        <div>
          <button
            type="button"
            onClick={reset}
            className="text-sm text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
          >
            Roast another idea →
          </button>
        </div>
      )}

      <footer className="mt-auto pt-8 text-xs text-muted-foreground/70">
        Built with the OpenAI Agents SDK · Next.js 16 · one triage, four
        panelists, one judge
      </footer>
    </main>
  );
}
