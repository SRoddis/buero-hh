"use client";

import { LngLatBounds, Map as MapLibreMap, Marker, NavigationControl, setWorkerUrl } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { useEffect, useRef } from "react";

import { addCollapsedAttribution } from "./attribution";
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
    addCollapsedAttribution(map);

    for (const point of current) {
      const el = document.createElement("div");
      el.className =
        "flex size-8 items-center justify-center rounded-full border-2 border-white bg-brand text-sm font-bold text-white shadow-md";
      el.textContent = point.label;
      new Marker({ element: el, anchor: "center" }).setLngLat([point.lng, point.lat]).addTo(map);
    }
    const fit = () => {
      if (current.length > 1) {
        const bounds = new LngLatBounds();
        for (const p of current) bounds.extend([p.lng, p.lat]);
        // rechts mehr Platz: dort liegen die Zoom-Schaltflächen
        map.fitBounds(bounds, { padding: { top: 48, bottom: 48, left: 48, right: 64 }, maxZoom: 15, duration: 0 });
      } else if (current.length === 1) {
        map.jumpTo({ center: [current[0].lng, current[0].lat], zoom: 14.5 });
      }
    };
    fit();

    // Ändert sich die Größe des Kartenfelds (Layout beim Laden, Fenstergröße), behält MapLibre Mittelpunkt und Zoom –
    // die Pins rutschen aus der Mitte. Daher neu einpassen, bis der Nutzer selbst verschiebt oder zoomt.
    let userMoved = false;
    map.on("movestart", (e) => {
      if (e.originalEvent) userMoved = true;
    });
    let frame = 0;
    const observer = new ResizeObserver(() => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        map.resize();
        if (!userMoved) fit();
      });
    });
    observer.observe(containerRef.current);

    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
      map.remove();
    };
  }, [key]);

  return <div ref={containerRef} className="size-full" />;
}
