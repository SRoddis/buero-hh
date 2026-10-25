"use client";

import { useState } from "react";

import { cn } from "@/lib/utils";

/**
 * Seitlicher Bildwechsel: Beim Wechsel von `index` gleitet das bisherige Element hinaus und das neue
 * herein – bei direction 1 („weiter“) von rechts nach links, bei -1 umgekehrt. Füllt den Elternblock
 * (absolute inset-0); Keyframes in globals.css.
 */
export function SlideTransition({
  index,
  direction,
  render,
}: {
  index: number;
  direction: 1 | -1;
  render: (index: number) => React.ReactNode;
}) {
  // outgoing = vorheriges Element, das gerade hinausgleitet; seq startet die Animation bei jedem Wechsel neu
  const [state, setState] = useState<{ index: number; outgoing: number | null; seq: number }>({
    index,
    outgoing: null,
    seq: 0,
  });
  // Wechsel während des Renderns übernehmen (React-Muster „Zustand aus vorherigem Render“), damit kein Frame ohne Animation entsteht
  if (state.index !== index) setState({ index, outgoing: state.index, seq: state.seq + 1 });

  const { outgoing, seq } = state;
  const next = direction === 1;

  return (
    <>
      {outgoing !== null && outgoing !== index && (
        <div
          key={`out-${seq}`}
          className={cn(
            "absolute inset-0 motion-reduce:hidden",
            next
              ? "animate-[carousel-out-next_320ms_ease-out_forwards]"
              : "animate-[carousel-out-prev_320ms_ease-out_forwards]",
          )}
          onAnimationEnd={() => setState((s) => (s.seq === seq ? { ...s, outgoing: null } : s))}
          aria-hidden
        >
          {render(outgoing)}
        </div>
      )}
      <div
        key={`in-${seq}`}
        className={cn(
          "absolute inset-0",
          seq > 0 &&
            (next
              ? "animate-[carousel-in-next_320ms_ease-out] motion-reduce:animate-none"
              : "animate-[carousel-in-prev_320ms_ease-out] motion-reduce:animate-none"),
        )}
      >
        {render(index)}
      </div>
    </>
  );
}
