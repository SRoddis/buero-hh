import { formatArea, formatAvailability, formatFloor, formatRent } from "@/lib/format";
import type { RentalUnit } from "@/lib/types";

export function UnitsTable({ units }: { units: RentalUnit[] }) {
  return (
    <div className="overflow-x-auto rounded-xl border bg-white">
      <table className="w-full min-w-[560px] text-sm">
        <thead className="bg-muted/60 text-left text-xs tracking-wide text-muted-foreground uppercase">
          <tr>
            <th className="px-4 py-3 font-semibold">Einheit</th>
            <th className="px-4 py-3 font-semibold">Etage</th>
            <th className="px-4 py-3 text-right font-semibold">Fläche</th>
            <th className="px-4 py-3 text-right font-semibold">Miete / m²</th>
            <th className="px-4 py-3 text-right font-semibold">NK / m²</th>
            <th className="px-4 py-3 font-semibold">Verfügbar</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {units.map((unit) => (
            <tr key={unit.id} className="hover:bg-muted/30">
              <td className="px-4 py-3 font-medium">
                {unit.label}
                {unit.divisible && <span className="ml-2 text-xs font-normal text-muted-foreground">teilbar</span>}
              </td>
              <td className="px-4 py-3">{unit.floor != null ? formatFloor(unit.floor) : "–"}</td>
              <td className="px-4 py-3 text-right tabular-nums">{formatArea(unit.areaSqm)}</td>
              <td className="px-4 py-3 text-right font-semibold tabular-nums">
                {unit.rentPerSqm != null ? formatRent(unit.rentPerSqm) : "auf Anfrage"}
              </td>
              <td className="px-4 py-3 text-right text-muted-foreground tabular-nums">
                {unit.serviceChargePerSqm != null ? formatRent(unit.serviceChargePerSqm) : "–"}
              </td>
              <td className="px-4 py-3">{formatAvailability(unit.availableFrom)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
