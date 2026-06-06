"use client";

import { useEffect, useRef, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";

import { AgentCard, type AgentPersona } from "@/components/agent-card";
import { RoastMeme } from "@/components/roast-meme";
import { RoastReport } from "@/components/roast-report";
import { StartupForm } from "@/components/startup-form";
import { useRoast, useStagedReveal } from "@/hooks/use-roast";
import * as sfx from "@/lib/sfx";
import { cn } from "@/lib/utils";
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

/** Stage order — also sets the pitch of each panelist's "done" ding. */
const PANEL_ORDER: PanelistKey[] = [...OPENING_ACTS, "roast"];

/** Raked stage: each opening act sits a step lower than the previous. */
const STAGE_RAKE = ["", "sm:translate-y-3", "lg:translate-y-6"];

export function RoastArena() {
  const { state, start, reset } = useRoast();
  const { displayed, revealDone } = useStagedReveal(state);
  const [muted, setMuted] = useState(false);
  const [pitchedIdea, setPitchedIdea] = useState("");

  const showPanel = state.phase !== "idle";
  const showVerdict = Boolean(state.verdict) && revealDone;
  const busy = !["idle", "error"].includes(state.phase) && !showVerdict;

  // Sound cues: a ding as each panelist finishes, a gavel for the verdict,
  // a womp when the show breaks. All synthesized client-side in lib/sfx.
  const prevStatuses = useRef<Record<PanelistKey, string> | null>(null);
  useEffect(() => {
    const prev = prevStatuses.current;
    if (prev) {
      PANEL_ORDER.forEach((key, index) => {
        if (prev[key] !== "done" && displayed[key].status === "done") {
          sfx.playAgentDone(index);
        }
      });
    }
    prevStatuses.current = Object.fromEntries(
      PANEL_ORDER.map((key) => [key, displayed[key].status]),
    ) as Record<PanelistKey, string>;
  }, [displayed]);

  const verdictAnnounced = useRef(false);
  useEffect(() => {
    if (showVerdict && !verdictAnnounced.current) {
      verdictAnnounced.current = true;
      sfx.playVerdict();
    }
    if (state.phase === "idle") verdictAnnounced.current = false;
  }, [showVerdict, state.phase]);

  useEffect(() => {
    if (state.phase === "error") sfx.playError();
  }, [state.phase]);

  const handleStart = (idea: string) => {
    sfx.playStart();
    setPitchedIdea(idea);
    start(idea);
  };

  const toggleMute = () => {
    const next = !muted;
    setMuted(next);
    sfx.setMuted(next);
  };

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
      <header className="animate-rise relative max-w-4xl">
        <button
          type="button"
          onClick={toggleMute}
          aria-label={muted ? "Unmute sound effects" : "Mute sound effects"}
          aria-pressed={muted}
          className="absolute top-0 right-0 grid size-10 place-items-center rounded-full border border-border/70 bg-card/60 text-muted-foreground backdrop-blur transition-colors hover:border-ember hover:text-foreground sm:-right-1"
        >
          {muted ? (
            <VolumeX className="size-4" aria-hidden />
          ) : (
            <Volume2 className="size-4" aria-hidden />
          )}
        </button>
        <p className="mb-3 pr-12 text-xs font-medium tracking-[0.3em] text-muted-foreground uppercase">
          Multi-agent pitch tribunal
        </p>
        <h1 className="font-display text-[clamp(2.5rem,7.5vw,6.25rem)] leading-[1.04] text-balance">
          AI Startup
          <span className="block text-ember">Roast Night</span>
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
          Four agents walk into your pitch. None of them are kind. A judge
          decides if the idea leaves alive.
        </p>
      </header>

      <StartupForm busy={busy} onSubmit={handleStart} />

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
                    className="block font-display"
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
          <dl className="grid gap-x-8 gap-y-4 text-sm sm:grid-cols-2 md:grid-cols-3">
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

      {/* The panel: three opening acts, then the headliner.
          Cards take the stage one by one — staggered rise per agent —
          and sit on a raked stage: each one a step lower than the last. */}
      {showPanel && (
        <section aria-label="The panel" className="flex flex-col gap-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:pb-3">
            {OPENING_ACTS.map((key, index) => (
              <div
                key={key}
                className={cn(
                  "animate-rise",
                  index === OPENING_ACTS.length - 1 &&
                    "sm:col-span-2 lg:col-span-1",
                )}
                style={{ animationDelay: `${index * 0.14}s` }}
              >
                <AgentCard
                  persona={PERSONAS[key]}
                  state={displayed[key]}
                  className={cn("h-full", STAGE_RAKE[index])}
                />
              </div>
            ))}
          </div>
          <div
            className="animate-rise"
            style={{ animationDelay: `${OPENING_ACTS.length * 0.14}s` }}
          >
            <AgentCard
              persona={PERSONAS.roast}
              state={displayed.roast}
              headliner
            />
          </div>
        </section>
      )}

      {showVerdict && state.verdict && (
        <RoastReport
          verdict={state.verdict}
          roastText={displayed.roast.text}
          autoPlayAudio={!muted}
        />
      )}

      {showVerdict && state.verdict && pitchedIdea && (
        <RoastMeme idea={pitchedIdea} verdict={state.verdict.verdict} />
      )}

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
