import { AttributionControl, type ControlPosition, type Map as MapLibreMap } from "maplibre-gl";

/**
 * Quellenhinweis (OpenFreeMap/OpenStreetMap) als eingeklapptes ⓘ. MapLibre klappt ihn beim ersten
 * Laden von selbst auf, sobald die Kartendaten eintreffen, und erst beim ersten Verschieben wieder zu.
 * Daher bis zum ersten fertigen Zeichnen nach jedem Daten-Ereignis wieder einklappen. Ein Klick auf ⓘ
 * zeigt den vollständigen Hinweis.
 */
export function addCollapsedAttribution(map: MapLibreMap, position: ControlPosition = "bottom-right") {
  map.addControl(new AttributionControl({ compact: true }), position);
  const collapse = () =>
    map.getContainer().querySelector(".maplibregl-compact-show")?.classList.remove("maplibregl-compact-show");
  map.on("styledata", collapse);
  map.on("sourcedata", collapse);
  map.once("idle", () => {
    collapse();
    map.off("styledata", collapse);
    map.off("sourcedata", collapse);
  });
}
