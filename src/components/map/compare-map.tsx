"use client";

import { AttributionControl, LngLatBounds, Map as MapLibreMap, Marker, NavigationControl, setWorkerUrl } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { useEffect, useRef } from "react";

import { MAP_STYLE_URL, WORKER_URL } from "./map-style";

setWorkerUrl(WORKER_URL);

export interface ComparePoint {
  label: string;
  lat: number;
  lng: number;
}

/** Karte für den Objektvergleich: ein Buchstaben-Pin (A, B, C) je Objekt, Ausschnitt passt sich an. */
export default function CompareMap({ points }: { points: ComparePoint[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const key = JSON.stringify(points);

  useEffect(() => {
    if (!containerRef.current) return;
    const current: ComparePoint[] = JSON.parse(key);
    const map = new MapLibreMap({
      container: containerRef.current,
      style: MAP_STYLE_URL,
      center: current[0] ? [current[0].lng, current[0].lat] : [9.9937, 53.5511],
      zoom: 12,
      dragRotate: false,
      cooperativeGestures: true,
      attributionControl: false,
    });
    map.addControl(new NavigationControl({ showCompass: false }), "top-right");
    // Quellenhinweis eingeklappt (ⓘ), sonst verdeckt er auf der kleinen Karte die Pins
    map.addControl(new AttributionControl({ compact: true }));
    map.once("load", () => containerRef.current?.querySelector(".maplibregl-compact-show")?.classList.remove("maplibregl-compact-show"));

    for (const point of current) {
      const el = document.createElement("div");
      el.className =
        "flex size-8 items-center justify-center rounded-full border-2 border-white bg-brand text-sm font-bold text-white shadow-md";
      el.textContent = point.label;
      new Marker({ element: el, anchor: "center" }).setLngLat([point.lng, point.lat]).addTo(map);
    }
    if (current.length > 1) {
      const bounds = new LngLatBounds();
      for (const p of current) bounds.extend([p.lng, p.lat]);
      map.fitBounds(bounds, { padding: 56, maxZoom: 15, duration: 0 });
    } else if (current.length === 1) {
      map.setZoom(14.5);
    }
    return () => map.remove();
  }, [key]);

  return <div ref={containerRef} className="size-full" />;
}
