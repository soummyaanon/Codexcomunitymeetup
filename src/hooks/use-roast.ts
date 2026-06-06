"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  PANELISTS,
  type PanelistKey,
  type RoastEvent,
  type TriageSummary,
  type Verdict,
} from "@/types/report";

export type PanelistStatus = "idle" | "waiting" | "streaming" | "done" | "error";

export interface PanelistState {
  status: PanelistStatus;
  text: string;
  error?: string;
}

export type Phase = "idle" | "triage" | "panel" | "judging" | "done" | "error";

export interface RoastState {
  phase: Phase;
  triage: TriageSummary | null;
  panelists: Record<PanelistKey, PanelistState>;
  verdict: Verdict | null;
  error: string | null;
}

function freshPanelists(status: PanelistStatus) {
  return Object.fromEntries(
    PANELISTS.map((key) => [key, { status, text: "" }]),
  ) as Record<PanelistKey, PanelistState>;
}

const initialState: RoastState = {
  phase: "idle",
  triage: null,
  panelists: freshPanelists("idle"),
  verdict: null,
  error: null,
};

function withPanelist(
  state: RoastState,
  key: PanelistKey,
  update: (panelist: PanelistState) => PanelistState,
): RoastState {
  return {
    ...state,
    panelists: { ...state.panelists, [key]: update(state.panelists[key]) },
  };
}

function panelFinished(panelists: Record<PanelistKey, PanelistState>) {
  return PANELISTS.every((key) =>
    ["done", "error"].includes(panelists[key].status),
  );
}

function applyEvent(state: RoastState, event: RoastEvent): RoastState {
  switch (event.type) {
    case "triage":
      return { ...state, phase: "panel", triage: event.data };
    case "delta":
      return withPanelist(state, event.agent, (p) => ({
        status: "streaming",
        text: p.text + event.text,
      }));
    case "agent_done": {
      const next = withPanelist(state, event.agent, (p) => ({
        ...p,
        status: "done",
      }));
      return panelFinished(next.panelists) ? { ...next, phase: "judging" } : next;
    }
    case "verdict":
      return { ...state, phase: "done", verdict: event.data };
    case "error": {
      if (!event.agent) {
        return { ...state, phase: "error", error: event.message };
      }
      const next = withPanelist(state, event.agent, (p) => ({
        ...p,
        status: "error",
        error: event.message,
      }));
      return panelFinished(next.panelists) ? { ...next, phase: "judging" } : next;
    }
    case "done":
      return state;
  }
}

/** Drives a roast run: POSTs the idea, consumes the SSE stream, exposes live state. */
export function useRoast() {
  const [state, setState] = useState<RoastState>(initialState);
  const abortRef = useRef<AbortController | null>(null);

  const reset = useCallback(() => {
    abortRef.current?.abort();
    setState(initialState);
  }, []);

  const start = useCallback(async (idea: string) => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setState({
      ...initialState,
      phase: "triage",
      panelists: freshPanelists("waiting"),
    });

    try {
      const res = await fetch("/api/roast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idea }),
        signal: controller.signal,
      });

      if (!res.ok || !res.body) {
        const data = await res.json().catch(() => null);
        const message =
          data && typeof data.error === "string"
            ? data.error
            : `Request failed (${res.status})`;
        throw new Error(message);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        const frames = buffer.split("\n\n");
        buffer = frames.pop() ?? "";
        for (const frame of frames) {
          const line = frame
            .split("\n")
            .find((candidate) => candidate.startsWith("data: "));
          if (!line) continue;
          const event = JSON.parse(line.slice(6)) as RoastEvent;
          setState((current) => applyEvent(current, event));
        }
      }
    } catch (error) {
      if (controller.signal.aborted) return;
      setState((current) => ({
        ...current,
        phase: "error",
        error: error instanceof Error ? error.message : String(error),
      }));
    }
  }, []);

  return { state, start, reset };
}

/**
 * Staged reveal — agents run in parallel on the server, but take the mic one
 * by one in the UI (plan.md: "Responses appear one by one"). Each panelist's
 * buffered stream is typed out in stage order; the next act waits its turn.
 */
export const REVEAL_ORDER: PanelistKey[] = [
  "investor",
  "customer",
  "competitor",
  "roast",
];

const REVEAL_TICK_MS = 40;
const REVEAL_CHARS_PER_TICK = 7; // ≈175 chars/sec — fast enough to feel live

interface RevealState {
  stage: number;
  shown: Record<PanelistKey, number>;
}

const initialReveal: RevealState = {
  stage: 0,
  shown: { investor: 0, customer: 0, competitor: 0, roast: 0 },
};

function advanceReveal(
  reveal: RevealState,
  panelists: Record<PanelistKey, PanelistState>,
): RevealState {
  if (reveal.stage >= REVEAL_ORDER.length) return reveal;

  const key = REVEAL_ORDER[reveal.stage];
  const panelist = panelists[key];
  const shown = reveal.shown[key];

  if (shown < panelist.text.length) {
    return {
      ...reveal,
      shown: {
        ...reveal.shown,
        [key]: Math.min(panelist.text.length, shown + REVEAL_CHARS_PER_TICK),
      },
    };
  }
  // Caught up with the buffer — hand over the mic once the server is done.
  if (panelist.status === "done" || panelist.status === "error") {
    return { ...reveal, stage: reveal.stage + 1 };
  }
  return reveal;
}

export function useStagedReveal(state: RoastState) {
  const [reveal, setReveal] = useState(initialReveal);
  const stateRef = useRef(state);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  // New run or reset → rewind the show (adjust-state-during-render pattern).
  const [prevPhase, setPrevPhase] = useState(state.phase);
  if (prevPhase !== state.phase) {
    setPrevPhase(state.phase);
    if (state.phase === "triage" || state.phase === "idle") {
      setReveal(initialReveal);
    }
  }

  const revealDone = reveal.stage >= REVEAL_ORDER.length;
  const running =
    state.phase !== "idle" && state.phase !== "error" && !revealDone;

  useEffect(() => {
    if (!running) return;
    const id = setInterval(
      () =>
        setReveal((prev) => advanceReveal(prev, stateRef.current.panelists)),
      REVEAL_TICK_MS,
    );
    return () => clearInterval(id);
  }, [running]);

  // What each card should show right now, given whose turn it is.
  const displayed = useMemo(() => {
    const out = {} as Record<PanelistKey, PanelistState>;
    REVEAL_ORDER.forEach((key, index) => {
      const server = state.panelists[key];
      if (index < reveal.stage) {
        out[key] = server;
        return;
      }
      if (index > reveal.stage) {
        out[key] = {
          status: server.status === "idle" ? "idle" : "waiting",
          text: "",
        };
        return;
      }
      const text = server.text.slice(0, reveal.shown[key]);
      if (text.length === 0) {
        out[key] = {
          status:
            server.status === "error"
              ? "error"
              : server.status === "idle"
                ? "idle"
                : "waiting",
          text: "",
          error: server.error,
        };
        return;
      }
      out[key] = { status: "streaming", text };
    });
    return out;
  }, [state.panelists, reveal]);

  return { displayed, revealDone };
}
