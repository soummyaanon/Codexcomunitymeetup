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
      <span className="flex items-center gap-1.5 text-xs font-medium tracking-widest text-ember uppercase">
        <span className="size-1.5 rounded-full bg-ember ember-dot" />
        Live
      </span>
    );
  }
  if (status === "done") {
    return (
      <span className="text-xs font-medium tracking-widest text-muted-foreground uppercase">
        Done
      </span>
    );
  }
  if (status === "error") {
    return (
      <span className="text-xs font-medium tracking-widest text-destructive uppercase">
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
        "flex flex-col gap-3 rounded-lg border bg-card/80 p-5 transition-colors",
        status === "idle" && "opacity-60",
        streaming && "glow-streaming border-transparent",
        headliner && "p-6 sm:p-8",
      )}
      style={
        {
          "--glow": persona.accent,
          "--glow-edge": `color-mix(in oklch, ${persona.accent} 55%, transparent)`,
        } as React.CSSProperties
      }
    >
      <header className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className={cn("text-2xl", headliner && "text-3xl")} aria-hidden>
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
            <p className="text-xs text-muted-foreground">{persona.role}</p>
          </div>
        </div>
        <StatusBadge status={status} />
      </header>

      {status === "idle" && (
        <p className="text-sm text-muted-foreground">In the green room.</p>
      )}

      {status === "waiting" && (
        <p className="flex items-center text-sm text-muted-foreground">
          {persona.thinkingLine}
          <ThinkingDots />
        </p>
      )}

      {(streaming || status === "done") && (
        <p
          className={cn(
            "whitespace-pre-wrap leading-relaxed",
            headliner ? "text-base sm:text-lg" : "text-sm sm:text-[0.95rem]",
          )}
        >
          {text}
          {streaming && <span className="caret" aria-hidden />}
        </p>
      )}

      {status === "error" && (
        <p className="text-sm text-destructive">
          Lost the mic: {error ?? "unknown error"}
        </p>
      )}
    </article>
  );
}
