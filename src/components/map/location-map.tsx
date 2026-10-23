"use client";

import { Map as MapLibreMap, Marker, NavigationControl, setWorkerUrl } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { useEffect, useRef } from "react";

import { BRAND, MAP_STYLE_URL, WORKER_URL } from "./map-style";

setWorkerUrl(WORKER_URL);

/** Kleine Lagekarte mit einem Marker für die Detailseite. */
export default function LocationMap({ lat, lng }: { lat: number; lng: number }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const map = new MapLibreMap({
      container: containerRef.current,
      style: MAP_STYLE_URL,
      center: [lng, lat],
      zoom: 14.5,
      scrollZoom: false,
      dragRotate: false,
      cooperativeGestures: true,
    });
    map.addControl(new NavigationControl({ showCompass: false }), "top-right");
    new Marker({ color: BRAND }).setLngLat([lng, lat]).addTo(map);
    return () => map.remove();
  }, [lat, lng]);

  return <div ref={containerRef} className="size-full" />;
}
