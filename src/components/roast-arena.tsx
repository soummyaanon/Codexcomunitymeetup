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
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-5 py-8 sm:px-8 sm:py-12 lg:gap-10">
      {/* Poster header */}
      <header className="animate-rise max-w-4xl">
        <p className="mb-3 text-xs font-medium tracking-[0.3em] text-muted-foreground uppercase">
          Multi-agent pitch tribunal
        </p>
        <h1 className="font-display text-[clamp(3rem,9vw,7.5rem)] leading-[0.9] tracking-wide uppercase text-balance">
          AI Startup
          <span className="block text-ember">Roast Night</span>
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
          Four agents walk into your pitch. None of them are kind. A judge
          decides if the idea leaves alive.
        </p>
      </header>

      <StartupForm busy={busy} onSubmit={start} />

      {/* Empty state: tonight's lineup */}
      {state.phase === "idle" && (
        <section
          aria-label="Tonight's lineup"
          className="animate-rise rounded-lg border bg-card/55 p-5 backdrop-blur"
        >
          <div className="flex items-center justify-between gap-4">
            <p className="text-xs font-medium tracking-[0.3em] text-muted-foreground uppercase">
              Tonight&apos;s lineup
            </p>
            <span className="hidden h-px flex-1 bg-gradient-to-r from-border to-transparent sm:block" />
          </div>
          <ul className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
            {(Object.keys(PERSONAS) as PanelistKey[]).map((key) => (
              <li
                key={key}
                className="flex items-center gap-3 rounded-md border border-border/60 bg-secondary/25 px-3 py-2"
              >
                <span className="text-lg" aria-hidden>{PERSONAS[key].emoji}</span>
                <span className="min-w-0">
                  <span
                    className="block font-display tracking-wide uppercase"
                    style={{ color: PERSONAS[key].accent }}
                  >
                    {PERSONAS[key].title}
                  </span>
                  <span className="block truncate text-muted-foreground">
                    {PERSONAS[key].role}
                  </span>
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
          className="animate-rise rounded-full border border-border/70 bg-card/50 px-4 py-2 text-sm tracking-wide text-muted-foreground backdrop-blur"
        >
          {narration}
        </p>
      )}

      {/* Triage dossier */}
      {state.triage && (
        <section
          aria-label="Analyst summary"
          className="animate-rise rounded-lg border border-ember/35 bg-card/65 p-5 shadow-[0_24px_80px_-62px_var(--ember)] backdrop-blur"
        >
          <p className="mb-4 text-xs font-medium tracking-[0.3em] text-ember uppercase">
            Analyst dossier
          </p>
          <dl className="grid gap-x-8 gap-y-4 text-sm sm:grid-cols-3">
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
          <p className="mt-4 border-t border-border/60 pt-4 text-sm text-foreground/75 italic">
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
