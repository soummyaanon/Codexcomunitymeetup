"use client";

import { RoastAudio } from "@/components/roast-audio";
import type { Verdict } from "@/types/report";

interface RoastReportProps {
  verdict: Verdict;
  /** The headliner's set — read aloud by the TTS announcer when present. */
  roastText?: string;
  autoPlayAudio?: boolean;
}

export function RoastReport({
  verdict,
  roastText,
  autoPlayAudio = false,
}: RoastReportProps) {
  const survival = Math.max(
    0,
    Math.min(100, parseInt(verdict.survivalChance.replace(/[^0-9]/g, ""), 10) || 0),
  );

  return (
    <section aria-label="Final verdict" className="animate-rise">
      <p className="text-xs font-medium tracking-[0.3em] text-muted-foreground uppercase">
        The judge has ruled
      </p>

      <div className="mt-4 grid items-center gap-6 rounded-lg border border-flame/25 bg-card/85 p-5 shadow-[0_26px_90px_-62px_var(--flame)] backdrop-blur sm:gap-8 sm:p-8 md:grid-cols-[auto_1fr_auto]">
        <div className="w-fit rounded-lg border border-border/70 bg-secondary/35 p-4 sm:p-5 md:w-auto">
          <div className="flex items-baseline gap-1">
            <span className="font-display text-6xl leading-none text-flame sm:text-8xl">
              {verdict.score}
            </span>
            <span className="font-display text-xl text-muted-foreground sm:text-2xl">
              /10
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-baseline justify-between gap-4">
            <span className="text-xs font-medium tracking-widest text-muted-foreground uppercase">
              Survival chance
            </span>
            <span className="font-display text-xl text-foreground">
              {verdict.survivalChance}
            </span>
          </div>
          <div
            className="h-3 overflow-hidden rounded-full bg-secondary"
            role="meter"
            aria-valuenow={survival}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Survival chance"
          >
            <div
              className="h-full rounded-full bg-gradient-to-r from-destructive via-ember to-flame shadow-[0_0_26px_-8px_var(--ember)] transition-[width] duration-700 ease-out"
              style={{ width: `${survival}%` }}
            />
          </div>
          <p className="mt-2 max-w-prose text-sm leading-relaxed text-foreground/85">
            {verdict.summary}
          </p>
        </div>

        <div className="max-w-full justify-self-center md:justify-self-end">
          <span className="animate-stamp inline-block max-w-full rotate-[-6deg] border-4 border-double border-destructive bg-destructive/10 px-4 py-2.5 text-center font-display text-xl tracking-wider text-destructive uppercase shadow-[0_20px_55px_-36px_var(--destructive)] sm:px-5 sm:py-3 sm:text-3xl">
            {verdict.verdict}
          </span>
        </div>

        {roastText && (
          <div className="md:col-span-3">
            <RoastAudio text={roastText} autoPlay={autoPlayAudio} />
          </div>
        )}
      </div>
    </section>
  );
}
