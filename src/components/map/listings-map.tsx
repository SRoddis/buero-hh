"use client";

import {
  AttributionControl,
  GeolocateControl,
  LngLatBounds,
  Map as MapLibreMap,
  Marker,
  NavigationControl,
  Popup,
  type Offset,
  setWorkerUrl,
  type GeoJSONSource,
  type FilterSpecification,
  type Point,
} from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { Checkbox } from "@/components/ui/checkbox";
import { CATEGORY_COLORS, HAMBURG_CENTER, type PropertyCategory } from "@/lib/constants";
import type { MapMarker, SearchFilters } from "@/lib/types";
import { cn } from "@/lib/utils";

import { MapGroupCard } from "./map-group-card";
import { MapPopupCard } from "./map-popup-card";
import { PricePin } from "./price-pin";
import { BRAND, CATEGORY_COLOR_EXPRESSION, displayCategory, MAP_STYLE_URL, toFeatureCollection, WORKER_URL } from "./map-style";

setWorkerUrl(WORKER_URL);

type Bbox = NonNullable<SearchFilters["bbox"]>;

export interface ListingsMapProps {
  markers: MapMarker[];
  /** Objekt, über dem in der Liste gerade die Maus steht */
  hoveredId: string | null;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  /** Aktiver Kartenausschnitt-Filter; null = Suche in ganz Hamburg */
  bbox: SearchFilters["bbox"];
  onBboxChange: (bbox: SearchFilters["bbox"]) => void;
  /** Ändert sich, wenn sich die Filter ändern – dann wird auf die Treffer gezoomt */
  fitKey: string;
  /** „Auf der Karte anzeigen“: zum Objekt fliegen (seq ändert sich bei jedem Klick) */
  focus?: { id: string; seq: number } | null;
  /** Aktiver Objektart-Filter – bestimmt die Punktfarbe gemischter Objekte */
  colorCategory?: PropertyCategory | null;
  className?: string;
}

/** Popup neben dem (zentrierten) Preis-Pin platzieren, ohne ihn zu verdecken */
const POPUP_OFFSET: Offset = {
  center: [0, 0],
  top: [0, 20],
  "top-left": [12, 18],
  "top-right": [-12, 18],
  bottom: [0, -20],
  "bottom-left": [12, -18],
  "bottom-right": [-12, -18],
  left: [56, 0],
  right: [-56, 0],
};

/** Unterhalb dieser Kartenbreite (px) erscheint die Objektkarte als feste Overlay-Karte */
const COMPACT_MAX_WIDTH = 520;
/** Zoomstufe für „Auf der Karte anzeigen“: Straßen und Umgebung erkennbar, nicht zu nah */
const FOCUS_ZOOM = 15;
/** Clustering – auch für die Berechnung, ab welcher Zoomstufe sich ein Objekt aus seinem Cluster löst */
const CLUSTER_RADIUS = 46;
const CLUSTER_MAX_ZOOM = 18;
/**
 * Sichtbarer Mindestabstand (px) zum nächsten anderen Ort nach „Auf der Karte anzeigen“: der Preis-Pin
 * (~90 px breit) soll frei stehen, Nachbarkreise liegen klar daneben statt dahinter.
 */
const FOCUS_SEPARATION_PX = 110;
/** Höchste Zoomstufe beim Anfliegen – Straße und Umgebung sollen erkennbar bleiben */
const FOCUS_MAX_ZOOM = 17;

/**
 * Zoomstufe, auf der das Objekt nicht mehr mit Nachbarn zu einem Kreis verschmilzt (mind. FOCUS_ZOOM).
 * Objekte an exakt derselben Adresse bleiben bewusst eine Gruppe.
 */
function separationZoom(target: MapMarker, markers: MapMarker[]) {
  const toRad = Math.PI / 180;
  const metersPerDegLat = 111_320;
  const metersPerDegLng = metersPerDegLat * Math.cos(target.lat * toRad);
  let nearest = Infinity;
  for (const m of markers) {
    if (m.id === target.id) continue;
    const d = Math.hypot((m.lat - target.lat) * metersPerDegLat, (m.lng - target.lng) * metersPerDegLng);
    if (d > 1 && d < nearest) nearest = d; // > 1 m: gleiche Adresse ignorieren
  }
  if (!Number.isFinite(nearest)) return FOCUS_ZOOM;
  // Meter pro Pixel bei Zoom z (512-px-Kacheln): 40075016.686 · cos(lat) / (512 · 2^z)
  const separationPx = Math.max(CLUSTER_RADIUS, FOCUS_SEPARATION_PX);
  const needed = Math.log2((40_075_016.686 * Math.cos(target.lat * toRad) * separationPx) / (512 * nearest)) + 0.3;
  return Math.min(FOCUS_MAX_ZOOM, Math.max(FOCUS_ZOOM, needed));
}
/** Verschiebung (px) nach unten beim Anfliegen auf dem Desktop – Platz für das Popup über dem Pin */
const FOCUS_POPUP_SHIFT = 150;

/** Abstand (px) vom oberen sichtbaren Kartenrand, ab dem der freie Bereich über der Overlay-Karte zählt */
const COMPACT_TOP_INSET = 16;
/** Verschiebung (px) beim Öffnen einer Gruppenliste auf dem Desktop */
const GROUP_LIST_SHIFT = 150;
/** Halbe Kantenlänge (Grad, ≈ 20 m) des Ausschnitts für „Alle Angebote anzeigen“ */
const GROUP_BBOX_DEGREES = 0.0002;

/** Trefferfläche um einen Punkt (px) – deckt auch den darüberliegenden Preis-Pin ab */
const HIT_PADDING: [number, number] = [26, 12];

function boundsToBbox(map: MapLibreMap): Bbox {
  const b = map.getBounds();
  return [b.getWest(), b.getSouth(), b.getEast(), b.getNorth()];
}

export default function ListingsMap(props: ListingsMapProps) {
  const { markers, hoveredId, selectedId, bbox, fitKey, focus = null, colorCategory = null, className } = props;
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const popupRef = useRef<Popup | null>(null);
  /** Mobile Overlay-Karte (Einzelobjekt oder Gruppe) – zum Ausrichten des Punkts darüber */
  const compactCardRef = useRef<HTMLDivElement>(null);
  const pinRef = useRef<Marker | null>(null);
  const lastFitKey = useRef<string | null>(null);
  const lastFocusSeq = useRef(0);
  const markersRef = useRef(markers);
  markersRef.current = markers;
  /** Cluster, der das aktive Objekt enthält und unter dem Preis-Pin liegt */
  const [pinClusterId, setPinClusterId] = useState<number | null>(null);
  const updatePinClusterRef = useRef<() => void>(() => {});
  const [ready, setReady] = useState(false);
  /** Schmale Karte: Objektkarte als feste Overlay-Karte statt Popup, damit sie nie abgeschnitten wird */
  const [compact, setCompact] = useState(false);
  /** Mehrere Angebote am selben Ort (aus einem nicht weiter teilbaren Cluster) */
  const [group, setGroup] = useState<{
    ids: string[];
    lng: number;
    lat: number;
    /** null, wenn die Gruppe aus der Liste geöffnet wurde (Cluster dann über pinClusterId) */
    clusterId: number | null;
    /** Angebot, mit dem die Gruppenkarte startet */
    initialId?: string;
  } | null>(null);
  /** Aktuell angezeigtes Angebot in der Gruppenkarte */
  const [groupActiveId, setGroupActiveId] = useState<string | null>(null);
  const popupNode = useMemo(() => document.createElement("div"), []);
  const pinNode = useMemo(() => {
    const el = document.createElement("div");
    el.style.pointerEvents = "none";
    return el;
  }, []);

  // Aktuelle Props für Event-Handler, die nur einmal registriert werden
  const latest = useRef(props);
  useEffect(() => {
    latest.current = props;
  });

  const markersById = useMemo(() => new Map(markers.map((m) => [m.id, m])), [markers]);
  const selectedMarker = selectedId ? markersById.get(selectedId) : undefined;
  // Das aktive Objekt (offenes Popup bzw. Gruppenkarte) hat Vorrang; Hover aus der Liste nur, wenn nichts aktiv ist
  const activeMarker = markersById.get(selectedId ?? (group ? groupActiveId : null) ?? hoveredId ?? "");
  const groupMarkers = useMemo(
    () => (group ? group.ids.map((id) => markersById.get(id)).filter((m): m is MapMarker => Boolean(m)) : []),
    [group, markersById],
  );
  const showGroup = !selectedMarker && groupMarkers.length > 1;

  const closeGroup = () => setGroup(null);
  /** „Alle anzeigen“: Trefferliste per eng gefasstem Kartenausschnitt auf diesen Ort beschränken */
  const showGroupInList = () => {
    if (!group) return;
    const d = GROUP_BBOX_DEGREES;
    props.onBboxChange([group.lng - d, group.lat - d, group.lng + d, group.lat + d]);
    setGroup(null);
  };

  // Karte einmalig initialisieren
  useEffect(() => {
    if (!containerRef.current) return;
    const map = new MapLibreMap({
      container: containerRef.current,
      style: MAP_STYLE_URL,
      center: HAMBURG_CENTER,
      zoom: 11,
      minZoom: 8,
      maxZoom: 18,
      attributionControl: false,
      dragRotate: false,
      pitchWithRotate: false,
    });
    mapRef.current = map;
    map.addControl(new NavigationControl({ showCompass: false }), "top-right");
    map.addControl(new GeolocateControl({ positionOptions: { enableHighAccuracy: true } }), "top-right");
    map.addControl(new AttributionControl({ compact: true }), "bottom-right");
    map.touchZoomRotate.disableRotation();

    map.on("load", () => {
      map.addSource("listings", {
        type: "geojson",
        data: toFeatureCollection(latest.current.markers, latest.current.colorCategory),
        cluster: true,
        clusterRadius: CLUSTER_RADIUS,
        // Bis zur maximalen Zoomstufe clustern: Angebote mit identischer Adresse liegen sonst
        // unsichtbar übereinander – so bleiben sie als Kreis mit Anzahl erkennbar
        clusterMaxZoom: CLUSTER_MAX_ZOOM,
      });

      map.addLayer({
        id: "clusters",
        type: "circle",
        source: "listings",
        filter: ["has", "point_count"],
        paint: {
          "circle-color": BRAND,
          "circle-radius": ["step", ["get", "point_count"], 17, 8, 21, 20, 26],
          "circle-stroke-width": 3,
          "circle-stroke-color": "rgba(255,255,255,0.9)",
        },
      });
      // Unsichtbare Kopie der Cluster ohne Ausblend-Filter – zum Ermitteln des Clusters unter dem Preis-Pin
      map.addLayer({
        id: "clusters-hit",
        type: "circle",
        source: "listings",
        filter: ["has", "point_count"],
        paint: { "circle-radius": ["step", ["get", "point_count"], 17, 8, 21, 20, 26], "circle-opacity": 0 },
      });
      map.addLayer({
        id: "cluster-count",
        type: "symbol",
        source: "listings",
        filter: ["has", "point_count"],
        layout: {
          "text-field": ["get", "point_count_abbreviated"],
          "text-font": ["Noto Sans Bold"],
          "text-size": 13,
          "text-allow-overlap": true,
        },
        paint: { "text-color": "#ffffff" },
      });
      map.addLayer({
        id: "points",
        type: "circle",
        source: "listings",
        filter: ["!", ["has", "point_count"]],
        paint: {
          "circle-color": CATEGORY_COLOR_EXPRESSION,
          "circle-radius": 8,
          "circle-stroke-width": 2.5,
          "circle-stroke-color": "#ffffff",
        },
      });

      /*
       * Alle Maus-Interaktionen laufen über die Karte selbst (der Preis-Pin ist pointer-events: none).
       * So kann der Pin, der beim Hover über dem Punkt erscheint, keine Events „stehlen“ –
       * sonst entstehen Hover-Schleifen und verlorene Klicks.
       */
      const pointAt = (p: Point) =>
        map.queryRenderedFeatures(
          [
            [p.x - HIT_PADDING[0], p.y - HIT_PADDING[1]],
            [p.x + HIT_PADDING[0], p.y + HIT_PADDING[1]],
          ],
          { layers: ["points"] },
        )[0];
      const clusterAt = (p: Point) => map.queryRenderedFeatures(p, { layers: ["clusters"] })[0];

      map.on("click", async (e) => {
        const point = pointAt(e.point);
        if (point) {
          setGroup(null);
          return latest.current.onSelect(point.properties.id as string);
        }

        const cluster = clusterAt(e.point);
        if (cluster) {
          const source = map.getSource<GeoJSONSource>("listings");
          const clusterId = cluster.properties.cluster_id as number;
          const [lng, lat] = (cluster.geometry as GeoJSON.Point).coordinates as [number, number];
          const zoom = await source?.getClusterExpansionZoom(clusterId);
          // Lässt sich der Cluster nicht weiter aufteilen (gleiche Adresse), die Angebote als Liste zeigen
          if (source && zoom != null && zoom > map.getMaxZoom()) {
            const leaves = await source.getClusterLeaves(clusterId, 500, 0);
            latest.current.onSelect(null);
            setGroup({ ids: leaves.map((f) => f.properties?.id as string), lng, lat, clusterId });
            return;
          }
          setGroup(null);
          map.easeTo({ center: [lng, lat], zoom: zoom ?? map.getZoom() + 2 });
          return;
        }

        // Klick auf freie Kartenfläche schließt das Popup
        setGroup(null);
        latest.current.onSelect(null);
      });

      // Hover über Kartenpunkten nur als Cursor – der Preis-Pin erscheint erst beim Anklicken
      map.on("mousemove", (e) => {
        map.getCanvas().style.cursor = pointAt(e.point) || clusterAt(e.point) ? "pointer" : "";
      });

      // Nur Nutzerinteraktionen (mit originalEvent) lösen eine neue Ausschnittsuche aus
      map.on("moveend", (e) => {
        if (e.originalEvent && latest.current.bbox) latest.current.onBboxChange(boundsToBbox(map));
      });

      // Cluster ändern sich beim Zoomen – Cluster unter dem Preis-Pin danach neu bestimmen
      map.on("idle", () => updatePinClusterRef.current());

      setReady(true);
    });

    const container = containerRef.current;
    const observer = new ResizeObserver(() => {
      map.resize();
      setCompact(container.clientWidth > 0 && container.clientWidth < COMPACT_MAX_WIDTH);
    });
    observer.observe(containerRef.current);

    return () => {
      observer.disconnect();
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Treffer aktualisieren und bei geänderten Filtern auf die Treffer zoomen
  useEffect(() => {
    const map = mapRef.current;
    if (!ready || !map) return;
    map.getSource<GeoJSONSource>("listings")?.setData(toFeatureCollection(markers, colorCategory));
    // Cluster in der Farbe der gefilterten Objektart, sonst in der Markenfarbe
    map.setPaintProperty("clusters", "circle-color", colorCategory ? CATEGORY_COLORS[colorCategory] : BRAND);
    setGroup(null);

    if (lastFitKey.current === fitKey) return;
    const initial = lastFitKey.current === null;
    lastFitKey.current = fitKey;

    if (initial && bbox) {
      map.fitBounds(bbox, { duration: 0 });
    } else if (!bbox && markers.length) {
      const bounds = markers.reduce(
        (b, m) => b.extend([m.lng, m.lat]),
        new LngLatBounds([markers[0].lng, markers[0].lat], [markers[0].lng, markers[0].lat]),
      );
      map.fitBounds(bounds, { padding: 64, maxZoom: 14.5, duration: initial ? 0 : 700 });
    }
  }, [ready, markers, fitKey, bbox, colorCategory]);

  // Kreis bzw. Punkt unter dem Preis-Pin ausblenden – sonst schaut ein Cluster-Kreis hinter dem Pin hervor
  const hiddenPointId = activeMarker?.id ?? null;
  const hiddenClusterId = showGroup ? (group?.clusterId ?? pinClusterId) : pinClusterId;

  const pinTarget = selectedMarker ?? (showGroup ? markersById.get(groupActiveId ?? "") : undefined);
  // Liegt das ausgewählte Objekt in einem Cluster, dessen Kreis unter dem Preis-Pin sitzt, wird dieser ausgeblendet
  // (nicht beim bloßen Hover über die Liste – sonst verschwänden z. B. große Übersichts-Cluster)
  updatePinClusterRef.current = async () => {
    const map = mapRef.current;
    const marker = pinTarget;
    if (!map || !marker) return setPinClusterId(null);
    const p = map.project([marker.lng, marker.lat]);
    const candidates = map.queryRenderedFeatures(
      [
        [p.x - 2, p.y - 2],
        [p.x + 2, p.y + 2],
      ],
      { layers: ["clusters-hit"] },
    );
    const source = map.getSource<GeoJSONSource>("listings");
    for (const cluster of candidates) {
      const clusterId = cluster.properties.cluster_id as number;
      const leaves = await source?.getClusterLeaves(clusterId, 1000, 0).catch(() => []);
      if (leaves?.some((f) => f.properties?.id === marker.id)) return setPinClusterId(clusterId);
    }
    setPinClusterId(null);
  };
  useEffect(() => {
    if (ready) updatePinClusterRef.current();
  }, [ready, pinTarget]);
  useEffect(() => {
    const map = mapRef.current;
    if (!ready || !map) return;
    const isPoint: FilterSpecification = ["!", ["has", "point_count"]];
    const isCluster: FilterSpecification = ["has", "point_count"];
    map.setFilter("points", hiddenPointId ? ["all", isPoint, ["!=", ["get", "id"], hiddenPointId]] : isPoint);
    const clusterFilter: FilterSpecification =
      hiddenClusterId != null ? ["all", isCluster, ["!=", ["get", "cluster_id"], hiddenClusterId]] : isCluster;
    map.setFilter("clusters", clusterFilter);
    map.setFilter("cluster-count", clusterFilter);
  }, [ready, hiddenPointId, hiddenClusterId]);

  // Preis-Pin für das Objekt, das in der Liste oder Karte aktiv ist
  useEffect(() => {
    const map = mapRef.current;
    if (!ready || !map) return;
    if (!activeMarker) {
      pinRef.current?.remove();
      pinRef.current = null;
      return;
    }
    pinRef.current ??= new Marker({ element: pinNode, anchor: "center" });
    pinRef.current.setLngLat([activeMarker.lng, activeMarker.lat]).addTo(map);
  }, [ready, activeMarker, pinNode]);

  // Popup für das ausgewählte Objekt
  useEffect(() => {
    const map = mapRef.current;
    if (!ready || !map) return;
    popupRef.current?.remove();
    popupRef.current = null;
    const target = selectedMarker ?? (showGroup && group ? { lng: group.lng, lat: group.lat } : null);
    if (!target) return;
    // Aus der Liste angefordert („Auf der Karte anzeigen“)
    const pendingFocus = focus && focus.seq !== lastFocusSeq.current ? focus : null;
    if (pendingFocus && selectedMarker?.id === pendingFocus.id) {
      // Weitere Angebote an derselben Adresse → Gruppenkarte öffnen, direkt beim gewählten Angebot
      const siblings = markersRef.current.filter(
        (m) => Math.abs(m.lng - selectedMarker.lng) < 1e-6 && Math.abs(m.lat - selectedMarker.lat) < 1e-6,
      );
      if (siblings.length > 1) {
        setGroup({
          ids: siblings.map((m) => m.id),
          lng: selectedMarker.lng,
          lat: selectedMarker.lat,
          clusterId: null,
          initialId: selectedMarker.id,
        });
        latest.current.onSelect(null);
        return;
      }
    }
    // …dann so nah heran, dass sich das Objekt aus seinem Cluster löst
    const focusMarker =
      pendingFocus && (selectedMarker?.id === pendingFocus.id || (showGroup && group?.ids.includes(pendingFocus.id)))
        ? markersRef.current.find((m) => m.id === pendingFocus.id)
        : undefined;
    const focusZoom = focusMarker ? separationZoom(focusMarker, markersRef.current) : null;
    if (focusZoom) lastFocusSeq.current = pendingFocus!.seq;

    if (compact) {
      // Schmale Karte (Mobil): Die Objektkarte liegt fest unten. Den Punkt in die Mitte des freien
      // Bereichs zwischen sichtbarem Kartenrand oben und Oberkante der Objektkarte schieben –
      // gemessen statt fest verschoben, damit es bei jeder Bildschirmhöhe passt.
      const frame = requestAnimationFrame(() => {
        const canvas = map.getCanvas().getBoundingClientRect();
        // Auf kleinen Bildschirmen liegt über der Karte noch Suchleiste & Co. – die Seite so weit
        // scrollen, dass die Karte oben beginnt und über der Objektkarte genug Platz bleibt
        // …aber nie so weit, dass unter der Karte der Footer hereinrutscht
        const scrollBy = Math.max(0, Math.min(canvas.top, canvas.bottom - window.innerHeight));
        if (scrollBy > 0) window.scrollBy({ top: scrollBy, behavior: "smooth" });
        const canvasTop = canvas.top - scrollBy;

        const cardTop = compactCardRef.current?.getBoundingClientRect().top ?? canvas.bottom;
        const freeTop = Math.max(canvasTop, 0) + COMPACT_TOP_INSET;
        const targetY = freeTop + Math.max(0, cardTop - freeTop) / 2;
        map.easeTo({
          center: [target.lng, target.lat],
          offset: [0, targetY - (canvasTop + canvas.height / 2)],
          ...(focusZoom ? { zoom: focusZoom, duration: 900 } : {}),
        });
      });
      return () => cancelAnimationFrame(frame);
    }

    const popup = new Popup({
      offset: POPUP_OFFSET,
      maxWidth: "none",
      closeButton: false,
      // Schließen steuert die Komponente selbst (Klick auf freie Kartenfläche), sonst schließt
      // ein Klick auf einen anderen Punkt das alte Popup und setzt die neue Auswahl zurück
      closeOnClick: false,
      focusAfterOpen: false,
      className: "bh-listing-popup",
    })
      .setLngLat([target.lng, target.lat])
      .setDOMContent(popupNode)
      .addTo(map);
    popupRef.current = popup;

    if (focusZoom) {
      // Objekt unterhalb der Mitte absetzen, damit das Popup darüber vollständig Platz hat
      // Einzel-Popup öffnet über dem Pin, die höhere Gruppenkarte darunter
      const shift = selectedMarker ? FOCUS_POPUP_SHIFT : -GROUP_LIST_SHIFT;
      map.flyTo({ center: [target.lng, target.lat], zoom: focusZoom, offset: [0, shift], duration: 1200 });
    } else if (!selectedMarker) {
      // Gruppenliste ist hoch: Ort in den oberen Kartenbereich schieben, damit die Liste darunter Platz hat
      map.easeTo({ center: [target.lng, target.lat], offset: [0, -GROUP_LIST_SHIFT] });
    } else if (!map.getBounds().contains([target.lng, target.lat])) {
      map.easeTo({ center: [target.lng, target.lat] });
    }
  }, [ready, selectedMarker, showGroup, group, popupNode, compact, focus]);

  return (
    <div className={cn("relative size-full overflow-hidden bg-[#eef0f1]", className)}>
      <div ref={containerRef} className="size-full" />

      {!ready && (
        <div className="absolute inset-0 flex animate-pulse items-center justify-center text-sm text-muted-foreground">
          Karte wird geladen …
        </div>
      )}

      {/* Nur Desktop: mobil ist die Karte zu klein, um den Ausschnitt sinnvoll zu verschieben */}
      <label className="absolute top-3 left-3 hidden cursor-pointer items-center gap-2 rounded-lg bg-white px-3 py-2 text-sm font-medium shadow-md select-none lg:flex">
        <Checkbox
          checked={bbox !== null}
          onCheckedChange={(checked) => {
            const map = mapRef.current;
            props.onBboxChange(checked && map ? boundsToBbox(map) : null);
          }}
        />
        Beim Verschieben der Karte suchen
      </label>

      {selectedMarker &&
        (compact ? (
          // Mobil am Bildschirm ausrichten (die Karte ragt dort unten über den Viewport), über dem Liste/Karte-Umschalter
          <div className="pointer-events-none fixed inset-x-0 bottom-[84px] z-40 flex justify-center px-4 lg:absolute lg:bottom-16 lg:z-10 lg:px-3">
            <div ref={compactCardRef} className="pointer-events-auto w-full max-w-[340px] overflow-hidden rounded-2xl shadow-[0_10px_30px_-8px_rgb(0_0_0/0.45)]">
              <MapPopupCard marker={selectedMarker} onClose={() => props.onSelect(null)} compact className="w-full" />
            </div>
          </div>
        ) : (
          createPortal(<MapPopupCard marker={selectedMarker} onClose={() => props.onSelect(null)} />, popupNode)
        ))}
      {showGroup &&
        (compact ? (
          <div className="pointer-events-none fixed inset-x-0 bottom-[84px] z-40 flex justify-center px-4 lg:absolute lg:bottom-16 lg:z-10 lg:px-3">
            <div ref={compactCardRef} className="pointer-events-auto w-full max-w-[340px] overflow-hidden rounded-2xl shadow-[0_10px_30px_-8px_rgb(0_0_0/0.45)]">
              <MapGroupCard
                markers={groupMarkers}
                initialId={group?.initialId}
                onActiveChange={setGroupActiveId}
                onClose={closeGroup}
                onShowAll={showGroupInList}
                compact
                className="w-full"
              />
            </div>
          </div>
        ) : (
          createPortal(
            <MapGroupCard
              markers={groupMarkers}
              initialId={group?.initialId}
              onActiveChange={setGroupActiveId}
              onClose={closeGroup}
              onShowAll={showGroupInList}
            />,
            popupNode,
          )
        ))}
      {activeMarker &&
        createPortal(
          <PricePin
            marker={activeMarker}
            category={displayCategory(activeMarker, colorCategory)}
            selected={activeMarker.id === selectedId}
          />,
          pinNode,
        )}
    </div>
  );
}
