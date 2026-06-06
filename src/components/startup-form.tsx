"use client";

import { useState } from "react";
import { Flame, Sparkles } from "lucide-react";

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
    <form
      onSubmit={submit}
      className="animate-rise rounded-lg border bg-card/80 p-3 shadow-[0_24px_90px_-56px_var(--ember)] backdrop-blur sm:p-4"
    >
      <div className="flex flex-col gap-3 sm:flex-row">
        <Input
          value={idea}
          onChange={(event) => setIdea(event.target.value)}
          placeholder="Pitch us. e.g. Uber for Dog Walkers"
          aria-label="Your startup idea"
          disabled={busy}
          className="h-14 border-input/70 bg-background/35 px-5 text-base shadow-inner shadow-black/10 placeholder:text-muted-foreground/80 sm:flex-1 md:text-lg"
        />
        <Button
          type="submit"
          size="lg"
          disabled={busy || !idea.trim()}
          className="h-14 gap-2 px-8 font-display text-lg tracking-wide uppercase shadow-[0_18px_48px_-24px_var(--ember)]"
        >
          {busy ? <Sparkles className="size-4 animate-spin" /> : <Flame className="size-4" />}
          {busy ? "Roasting…" : "Roast it"}
        </Button>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
        <span className="text-muted-foreground">Borrow a bad idea:</span>
        {SAMPLE_IDEAS.map((sample) => (
          <button
            key={sample}
            type="button"
            disabled={busy}
            onClick={() => setIdea(sample)}
            className="rounded-full border border-border/80 bg-secondary/45 px-3 py-1 text-foreground/85 transition-all hover:-translate-y-0.5 hover:border-ember hover:bg-secondary hover:text-foreground disabled:translate-y-0 disabled:opacity-50"
          >
            {sample}
          </button>
        ))}
      </div>
    </form>
  );
}
