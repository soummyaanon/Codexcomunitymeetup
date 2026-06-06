"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

export function RoastMeme({ idea, verdict }: { idea: string; verdict: string }) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!idea || !verdict) return;

    let isMounted = true;

    const fetchMeme = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/meme", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ idea, verdict }),
        });

        if (!res.ok) throw new Error("Failed to generate meme");

        const data = await res.json();
        if (isMounted) {
          setImageUrl(data.url);
        }
      } catch (err) {
        console.error("Meme generation error:", err);
        if (isMounted) {
          setError("Failed to fetch meme.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchMeme();

    return () => {
      isMounted = false;
    };
  }, [idea, verdict]);

  if (!idea || !verdict) return null;

  return (
    <div className="mt-8 flex flex-col items-center justify-center animate-rise">
      <p className="text-xs font-medium tracking-[0.3em] text-muted-foreground uppercase mb-4 self-start">
        Bonus Meme
      </p>
      
      <div className="w-full max-w-2xl overflow-hidden rounded-lg border bg-card/80 flex items-center justify-center min-h-[300px]">
        {isLoading && (
          <div className="flex flex-col items-center justify-center gap-4 p-8 text-muted-foreground">
            <Loader2 className="h-8 w-8 animate-spin" />
            <p>Fetching a random meme...</p>
          </div>
        )}
        
        {error && !isLoading && (
          <div className="p-8 text-destructive text-sm border border-destructive/50 bg-destructive/10 rounded-md">
            {error}
          </div>
        )}
        
        {imageUrl && !isLoading && (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img 
            src={imageUrl} 
            alt="Generated Meme" 
            className="w-full h-auto object-cover"
          />
        )}
      </div>
    </div>
  );
}
