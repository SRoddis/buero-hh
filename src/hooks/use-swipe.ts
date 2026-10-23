import { useEffect, useRef, type RefObject } from "react";

/** Mindeststrecke (px) für eine Wischgeste */
const MIN_DISTANCE = 40;

type Point = { x: number; y: number };
type SwipeHandlers = { onNext: () => void; onPrevious: () => void };

/** Wertet nur deutlich horizontale Bewegungen aus – vertikales Scrollen bleibt unberührt. */
function evaluateSwipe(from: Point, to: Point, { onNext, onPrevious }: SwipeHandlers) {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  if (Math.abs(dx) < MIN_DISTANCE || Math.abs(dx) < Math.abs(dy) * 1.5) return;
  if (dx < 0) onNext();
  else onPrevious();
}

/** Horizontale Wischgesten (Touch) als React-Handler zum Spreaden auf ein Element. */
export function useSwipe(handlers: SwipeHandlers) {
  const start = useRef<Point | null>(null);

  return {
    onTouchStart: (e: React.TouchEvent) => {
      start.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    },
    onTouchEnd: (e: React.TouchEvent) => {
      const from = start.current;
      start.current = null;
      if (from) evaluateSwipe(from, { x: e.changedTouches[0].clientX, y: e.changedTouches[0].clientY }, handlers);
    },
  };
}

/**
 * Wischgesten für ein Element, das von einer Link-Fläche überdeckt sein kann (z. B. Bildkarussell
 * in Karten mit durchgehender Klickfläche): Die Listener hängen am umgebenden Container mit
 * `data-swipe-area` (sonst am Element selbst); gewertet werden nur Gesten, die auf dem Element beginnen.
 */
export function useSwipeArea(ref: RefObject<HTMLElement | null>, handlers: SwipeHandlers, enabled = true) {
  const latest = useRef(handlers);
  useEffect(() => {
    latest.current = handlers;
  });

  useEffect(() => {
    const element = ref.current;
    if (!element || !enabled) return;
    const area = element.closest<HTMLElement>("[data-swipe-area]") ?? element;
    let start: Point | null = null;

    const onStart = (e: TouchEvent) => {
      const t = e.touches[0];
      const r = element.getBoundingClientRect();
      const inside = t.clientX >= r.left && t.clientX <= r.right && t.clientY >= r.top && t.clientY <= r.bottom;
      start = inside ? { x: t.clientX, y: t.clientY } : null;
    };
    const onEnd = (e: TouchEvent) => {
      const from = start;
      start = null;
      if (from) evaluateSwipe(from, { x: e.changedTouches[0].clientX, y: e.changedTouches[0].clientY }, latest.current);
    };

    area.addEventListener("touchstart", onStart, { passive: true });
    area.addEventListener("touchend", onEnd, { passive: true });
    return () => {
      area.removeEventListener("touchstart", onStart);
      area.removeEventListener("touchend", onEnd);
    };
  }, [ref, enabled]);
}
