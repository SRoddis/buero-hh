"use client";

import { Map as MapLibreMap, Marker, NavigationControl, setWorkerUrl } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { useEffect, useRef } from "react";

import { addCollapsedAttribution } from "./attribution";
import { BRAND, MAP_STYLE_URL, WORKER_URL } from "./map-style";

setWorkerUrl(WORKER_URL);

/** Kleine Lagekarte mit einem Marker (Detailseite, Anfahrt auf der Startseite). */
export default function LocationMap({ lat, lng, zoom = 14.5 }: { lat: number; lng: number; zoom?: number }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const map = new MapLibreMap({
      container: containerRef.current,
      style: MAP_STYLE_URL,
      center: [lng, lat],
      zoom,
      scrollZoom: false,
      dragRotate: false,
      cooperativeGestures: true,
      attributionControl: false,
    });
    addCollapsedAttribution(map);
    map.addControl(new NavigationControl({ showCompass: false }), "top-right");
    new Marker({ color: BRAND }).setLngLat([lng, lat]).addTo(map);
    return () => map.remove();
  }, [lat, lng, zoom]);

  return <div ref={containerRef} className="size-full" />;
}
