"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const SAMPLE_IDEAS = [
  "Uber for Dog Walkers",
  "Tinder for Plants",
  "Blockchain-Powered Babysitting",
  "AI Toothbrush Subscription",
];

interface StartupFormProps {
  busy: boolean;
  onSubmit: (idea: string) => void;
}

export function StartupForm({ busy, onSubmit }: StartupFormProps) {
  const [idea, setIdea] = useState("");

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const trimmed = idea.trim();
    if (trimmed && !busy) onSubmit(trimmed);
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-3">
      <div className="flex flex-col gap-3 sm:flex-row">
        <Input
          value={idea}
          onChange={(event) => setIdea(event.target.value)}
          placeholder="Pitch us. e.g. Uber for Dog Walkers"
          aria-label="Your startup idea"
          disabled={busy}
          className="h-14 bg-card/70 px-5 text-base sm:flex-1 md:text-lg"
        />
        <Button
          type="submit"
          size="lg"
          disabled={busy || !idea.trim()}
          className="h-14 px-8 font-display text-lg tracking-wide uppercase"
        >
          {busy ? "Roasting…" : "Roast it"}
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-2 text-sm">
        <span className="text-muted-foreground">No idea? Borrow one:</span>
        {SAMPLE_IDEAS.map((sample) => (
          <button
            key={sample}
            type="button"
            disabled={busy}
            onClick={() => setIdea(sample)}
            className="rounded-full border border-border px-3 py-1 text-foreground/80 transition-colors hover:border-ember hover:text-foreground disabled:opacity-50"
          >
            {sample}
          </button>
        ))}
      </div>
    </form>
  );
}
