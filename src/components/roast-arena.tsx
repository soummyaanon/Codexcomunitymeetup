"use client";

import { AgentCard, type AgentPersona } from "@/components/agent-card";
import { RoastReport } from "@/components/roast-report";
import { StartupForm } from "@/components/startup-form";
import { useRoast, useStagedReveal } from "@/hooks/use-roast";
import type { PanelistKey } from "@/types/report";

const PERSONAS: Record<PanelistKey, AgentPersona> = {
  investor: {
    title: "The Investor",
    role: "Ruthless VC, allergic to small TAMs",
    emoji: "💰",
    accent: "oklch(0.84 0.095 238)",
    thinkingLine: "Counting your TAM on one hand",
  },
  customer: {
    title: "The Customer",
    role: "Allegedly your user",
    emoji: "🛒",
    accent: "oklch(0.74 0.13 258)",
    thinkingLine: "Checking their wallet",
  },
  competitor: {
    title: "The Competitor",
    role: "Already shipped your roadmap",
    emoji: "🦈",
    accent: "oklch(0.66 0.16 277)",
    thinkingLine: "Sharpening the knives",
  },
  roast: {
    title: "The Roast",
    role: "Tonight's headliner",
    emoji: "🔥",
    accent: "oklch(0.63 0.18 244)",
    thinkingLine: "Cooking",
  },
};

const OPENING_ACTS: PanelistKey[] = ["investor", "customer", "competitor"];

export function RoastArena() {
  const { state, start, reset } = useRoast();
  const { displayed, revealDone } = useStagedReveal(state);

  const showPanel = state.phase !== "idle";
  const showVerdict = Boolean(state.verdict) && revealDone;
  const busy = !["idle", "error"].includes(state.phase) && !showVerdict;

  const narration =
    state.phase === "triage"
      ? "The analyst is reading your pitch…"
      : state.phase === "error"
        ? null
        : showPanel && !revealDone
          ? "The panel has the mic."
          : showPanel && !showVerdict
            ? "The judge is deliberating…"
            : null;

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-10 px-5 py-10 sm:px-8 sm:py-14">
      {/* Poster header */}
      <header className="animate-rise">
        <h1 className="font-display text-[clamp(3rem,9vw,6.5rem)] leading-[0.95] tracking-wide uppercase">
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
      {narration && (
        <p
          aria-live="polite"
          className="text-sm tracking-wide text-muted-foreground"
        >
          {narration}
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
                state={displayed[key]}
              />
            ))}
          </div>
          <AgentCard
            persona={PERSONAS.roast}
            state={displayed.roast}
            headliner
          />
        </section>
      )}

      {showVerdict && state.verdict && <RoastReport verdict={state.verdict} />}

      {(showVerdict || state.phase === "error") && (
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
