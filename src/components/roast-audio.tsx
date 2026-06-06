"use client";

import { useEffect, useRef, useState } from "react";
import { Play, Square } from "lucide-react";

import { Button } from "@/components/ui/button";

interface RoastAudioProps {
  text: string;
  /** Play automatically once the voice is ready (skipped when sfx are muted). */
  autoPlay?: boolean;
}

/** Fetches a TTS rendition of the roast and plays it like a closing set. */
export function RoastAudio({ text, autoPlay = false }: RoastAudioProps) {
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [failed, setFailed] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!text) return;

    let isMounted = true;
    let url: string | null = null;

    const fetchAudio = async () => {
      setIsLoading(true);
      setFailed(false);
      try {
        const res = await fetch("/api/tts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text }),
        });
        if (!res.ok) throw new Error("TTS failed");

        const blob = await res.blob();
        if (!isMounted) return;

        url = URL.createObjectURL(blob);
        setAudioUrl(url);
        if (autoPlay && audioRef.current) {
          audioRef.current.src = url;
          audioRef.current.play().catch(() => undefined);
          setIsPlaying(true);
        }
      } catch {
        if (isMounted) setFailed(true);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchAudio();

    return () => {
      isMounted = false;
      if (url) URL.revokeObjectURL(url);
    };
    // autoPlay only matters for the initial fetch — don't refetch on toggle.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text]);

  const togglePlayback = () => {
    const audio = audioRef.current;
    if (!audio || !audioUrl) return;
    if (isPlaying) {
      audio.pause();
      audio.currentTime = 0;
      setIsPlaying(false);
    } else {
      if (!audio.src) audio.src = audioUrl;
      audio.play().catch(() => undefined);
      setIsPlaying(true);
    }
  };

  if (!text || failed) return null;

  return (
    <div className="flex items-center gap-4 rounded-md border border-ember/30 bg-ember/10 px-4 py-3">
      <audio
        ref={audioRef}
        onEnded={() => setIsPlaying(false)}
        className="hidden"
      />
      <div className="min-w-0 flex-1">
        <p className="font-display text-sm text-ember">Hear the roast</p>
        <p className="text-xs text-muted-foreground">
          {isLoading ? "Warming up the announcer…" : "AI voice, onyx, no mercy"}
        </p>
      </div>
      <Button
        variant="outline"
        size="icon"
        aria-label={isPlaying ? "Stop the roast audio" : "Play the roast audio"}
        className="shrink-0 border-ember/40 bg-transparent text-ember hover:bg-ember/15 hover:text-ember"
        onClick={togglePlayback}
        disabled={isLoading || !audioUrl}
      >
        {isPlaying ? <Square className="size-4" /> : <Play className="size-4" />}
      </Button>
    </div>
  );
}
