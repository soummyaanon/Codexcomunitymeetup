"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

interface RoastMemeProps {
  idea: string;
  verdict: string;
}

/** The encore: a bonus meme served alongside the verdict. */
export function RoastMeme({ idea, verdict }: RoastMemeProps) {
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
        if (isMounted) setImageUrl(data.url);
      } catch {
        if (isMounted) setError("The meme guy left early. No encore tonight.");
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchMeme();

    return () => {
      isMounted = false;
    };
  }, [idea, verdict]);

  if (!idea || !verdict) return null;

  return (
    <section aria-label="Bonus meme" className="animate-rise">
      <p className="text-xs font-medium tracking-[0.3em] text-muted-foreground uppercase">
        The encore
      </p>

      <div className="mt-4 grid min-h-48 w-full max-w-2xl place-items-center overflow-hidden rounded-lg border bg-card/80 shadow-[0_24px_80px_-62px_var(--ember)] backdrop-blur">
        {isLoading && (
          <div className="flex flex-col items-center gap-3 p-8 text-sm text-muted-foreground">
            <Loader2 className="size-6 animate-spin text-ember" aria-hidden />
            <p>Finding a meme worthy of this verdict…</p>
          </div>
        )}

        {error && !isLoading && (
          <p className="p-8 text-sm text-muted-foreground">{error}</p>
        )}

        {imageUrl && !isLoading && (
          /* External meme host — domain varies, so next/image is not an option. */
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={imageUrl}
            alt={`Bonus meme for ${idea}`}
            className="h-auto w-full"
          />
        )}
      </div>
    </section>
  );
}
