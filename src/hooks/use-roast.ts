"use client";

import { useCallback, useRef, useState } from "react";

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
