"use client";

import dynamic from "next/dynamic";

import { MapLoading } from "./map-loading";

/** MapLibre benötigt `window` und WebGL – daher nur clientseitig laden. */
export const ListingsMap = dynamic(() => import("./listings-map"), {
  ssr: false,
  // derselbe Ladezustand wie in der Karte bis zum Einblenden – kein Wechsel zwischen Platzhaltern
  loading: () => (
    <div className="relative size-full">
      <MapLoading />
    </div>
  ),
});
