"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "./ui/button";
import { Play, Square } from "lucide-react";

export function RoastAudio({ text }: { text: string }) {
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!text) return;
    
    let isMounted = true;
    
    const fetchAudio = async () => {
      setIsLoading(true);
      try {
        const res = await fetch("/api/tts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text }),
        });
        
        if (!res.ok) throw new Error("TTS failed");
        
        const blob = await res.blob();
        if (isMounted) {
          const url = URL.createObjectURL(blob);
          setAudioUrl(url);
          // Auto-play the audio when it's ready
          if (audioRef.current) {
            audioRef.current.src = url;
            audioRef.current.play().catch(console.error);
            setIsPlaying(true);
          }
        }
      } catch (err) {
        console.error("Audio generation failed:", err);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };
    
    fetchAudio();
    
    return () => {
      isMounted = false;
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text]); 

  const togglePlayback = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
    } else {
      audioRef.current.play().catch(console.error);
      setIsPlaying(true);
    }
  };

  if (!text) return null;

  return (
    <div className="flex items-center gap-4 mt-4 p-4 border rounded-md border-ember/20 bg-ember/5">
      <audio
        ref={audioRef}
        onEnded={() => setIsPlaying(false)}
        className="hidden"
      />
      <div className="flex-1">
        <p className="text-sm font-medium text-ember">Roast Audio</p>
        <p className="text-xs text-muted-foreground">
          {isLoading ? "Generating AI voice..." : "Ready to play"}
        </p>
      </div>
      <Button
        variant="outline"
        size="icon"
        className="border-ember/30 text-ember hover:bg-ember/10"
        onClick={togglePlayback}
        disabled={isLoading || !audioUrl}
      >
        {isPlaying ? <Square className="size-4" /> : <Play className="size-4" />}
      </Button>
    </div>
  );
}
