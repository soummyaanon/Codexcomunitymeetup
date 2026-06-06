"use client";

import type { PanelistState } from "@/hooks/use-roast";
import { cn } from "@/lib/utils";

export interface AgentPersona {
  title: string;
  role: string;
  emoji: string;
  /** OKLCH accent for this panelist — label color + streaming glow. */
  accent: string;
  thinkingLine: string;
}

interface AgentCardProps {
  persona: AgentPersona;
  state: PanelistState;
  headliner?: boolean;
}

function StatusBadge({ status }: { status: PanelistState["status"] }) {
  if (status === "streaming") {
    return (
      <span className="flex items-center gap-1.5 rounded-full border border-ember/30 bg-ember/10 px-2 py-1 text-xs font-medium tracking-widest text-ember uppercase">
        <span className="size-1.5 rounded-full bg-ember ember-dot" />
        Live
      </span>
    );
  }
  if (status === "done") {
    return (
      <span className="rounded-full border border-border/80 bg-secondary/45 px-2 py-1 text-xs font-medium tracking-widest text-muted-foreground uppercase">
        Done
      </span>
    );
  }
  if (status === "error") {
    return (
      <span className="rounded-full border border-destructive/30 bg-destructive/10 px-2 py-1 text-xs font-medium tracking-widest text-destructive uppercase">
        Dropped out
      </span>
    );
  }
  return null;
}

function ThinkingDots() {
  return (
    <span className="ml-1 inline-flex gap-1" aria-hidden>
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="size-1 rounded-full bg-current ember-dot"
          style={{ animationDelay: `${i * 0.18}s` }}
        />
      ))}
    </span>
  );
}

export function AgentCard({ persona, state, headliner = false }: AgentCardProps) {
  const { status, text, error } = state;
  const streaming = status === "streaming";

  return (
    <article
      className={cn(
        "group relative flex min-h-44 flex-col gap-4 overflow-hidden rounded-lg border bg-card/82 p-5 shadow-[0_24px_80px_-62px_var(--glow)] backdrop-blur transition-all duration-300",
        "before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-[var(--glow)] before:to-transparent before:opacity-55",
        status === "idle" && "opacity-60",
        streaming && "glow-streaming border-transparent bg-card",
        headliner && "min-h-52 p-6 sm:p-8",
      )}
      style={
        {
          "--glow": persona.accent,
          "--glow-edge": `color-mix(in oklch, ${persona.accent} 55%, transparent)`,
        } as React.CSSProperties
      }
    >
      <header className="relative flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span
            className={cn(
              "grid size-10 place-items-center rounded-lg border border-border/70 bg-secondary/50 text-2xl shadow-inner shadow-white/5",
              headliner && "size-12 text-3xl",
            )}
            aria-hidden
          >
            {persona.emoji}
          </span>
          <div>
            <h3
              className={cn(
                "font-display tracking-wide uppercase",
                headliner ? "text-2xl" : "text-lg",
              )}
              style={{ color: persona.accent }}
            >
              {persona.title}
            </h3>
            <p className="mt-0.5 text-xs text-muted-foreground">{persona.role}</p>
          </div>
        </div>
        <StatusBadge status={status} />
      </header>

      {status === "idle" && (
        <p className="relative mt-auto text-sm text-muted-foreground">In the green room.</p>
      )}

      {status === "waiting" && (
        <p className="relative mt-auto flex items-center text-sm text-muted-foreground">
          {persona.thinkingLine}
          <ThinkingDots />
        </p>
      )}

      {(streaming || status === "done") && text && (
        <p
          className={cn(
            "relative whitespace-pre-wrap leading-relaxed text-foreground/90",
            headliner ? "text-base sm:text-lg" : "text-sm sm:text-[0.95rem]",
          )}
        >
          {text}
          {streaming && <span className="caret" aria-hidden />}
        </p>
      )}

      {status === "done" && !text && (
        <p className="relative mt-auto text-sm text-muted-foreground">Passed on the mic.</p>
      )}

      {status === "error" && (
        <p className="relative text-sm text-destructive">
          Lost the mic: {error ?? "unknown error"}
        </p>
      )}
    </article>
  );
}
