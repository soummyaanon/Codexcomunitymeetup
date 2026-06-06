"use client";

import type { Verdict } from "@/types/report";
import { RoastAudio } from "./roast-audio";

interface RoastReportProps {
  verdict: Verdict;
  roastText?: string;
}

export function RoastReport({ verdict, roastText }: RoastReportProps) {
  const survival = Math.max(
    0,
    Math.min(100, parseInt(verdict.survivalChance.replace(/[^0-9]/g, ""), 10) || 0),
  );

  return (
    <section aria-label="Final verdict" className="animate-rise">
      <p className="text-xs font-medium tracking-[0.3em] text-muted-foreground uppercase">
        The judge has ruled
      </p>

      <div className="mt-4 grid items-center gap-8 rounded-lg border bg-card/80 p-6 sm:p-8 md:grid-cols-[auto_1fr_auto]">
        <div className="flex items-baseline gap-1">
          <span className="font-display text-7xl leading-none text-flame sm:text-8xl">
            {verdict.score}
          </span>
          <span className="font-display text-2xl text-muted-foreground">/10</span>
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
              className="h-full rounded-full bg-gradient-to-r from-destructive via-ember to-flame transition-[width] duration-700 ease-out"
              style={{ width: `${survival}%` }}
            />
          </div>
          <p className="mt-2 max-w-prose text-sm leading-relaxed text-foreground/85">
            {verdict.summary}
          </p>
        </div>

        <div className="justify-self-center md:justify-self-end">
          <span className="animate-stamp inline-block border-4 border-double border-destructive px-5 py-3 font-display text-2xl tracking-wider text-destructive uppercase sm:text-3xl">
            {verdict.verdict}
          </span>
        </div>
      </div>

      {roastText && <RoastAudio text={roastText} />}
    </section>
  );
}
