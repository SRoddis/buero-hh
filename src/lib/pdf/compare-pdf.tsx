import "server-only";

import { Document, Font, Image, Page, Path, StyleSheet, Svg, Text, View } from "@react-pdf/renderer";

import { COMPANY, OFFER_TERMS } from "@/lib/company";
import type { CompareRow } from "@/lib/compare-rows";
import { formatArea, formatRentLabel } from "@/lib/format";
import type { Listing } from "@/lib/types";

// Keine automatische Silbentrennung (react-pdf trennt sonst z. B. „Ter-rasse“)
Font.registerHyphenationCallback((word) => [word]);

const BRAND = "#8B2038";
const MUTED = "#6b7280";
const BORDER = "#e5e7eb";
const GOOD = { bg: "#ecfdf5", fg: "#065f46" };
const BAD = { bg: "#fff1f2", fg: "#9f1239" };

const styles = StyleSheet.create({
  page: { paddingTop: 76, paddingBottom: 70, paddingHorizontal: 36, fontFamily: "Helvetica", fontSize: 8.5, color: "#111827" },
  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 58,
    backgroundColor: BRAND,
    paddingHorizontal: 36,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  wordmark: { flexDirection: "row", alignItems: "flex-end", color: "white" },
  headerRight: { flexDirection: "row", alignItems: "flex-end", gap: 14 },
  tagline: { color: "white", fontSize: 7, letterSpacing: 0.6, marginBottom: 2 },
  title: { fontSize: 12, fontFamily: "Helvetica-Bold", marginBottom: 6 },
  table: { borderWidth: 1, borderColor: BORDER, borderRadius: 4 },
  row: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: BORDER },
  labelCell: { width: 120, paddingVertical: 2.5, paddingHorizontal: 8, color: MUTED, backgroundColor: "#f9fafb" },
  cell: { flex: 1, paddingVertical: 2.5, paddingHorizontal: 8, borderLeftWidth: 1, borderLeftColor: BORDER },
  headCell: { flex: 1, padding: 5, borderLeftWidth: 1, borderLeftColor: BORDER },
  thumb: { width: "100%", height: 64, objectFit: "cover", borderRadius: 3, marginBottom: 5 },
  thumbEmpty: { width: "100%", height: 64, borderRadius: 3, marginBottom: 5, backgroundColor: "#f3f4f6" },
  footer: { position: "absolute", left: 36, right: 36, bottom: 18, borderTopWidth: 0.75, borderTopColor: "#9ca3af", paddingTop: 6 },
  footerText: { fontSize: 5.6, color: "#4b5563", lineHeight: 1.35 },
  pageNumber: { position: "absolute", right: 36, bottom: 10, fontSize: 6, color: MUTED },
});

/** Haken im Kreis (grün) bzw. Kreuz im Kreis (rot) – wie in der Vergleichstabelle der Website */
function Flag({ value }: { value: boolean }) {
  const color = value ? "#059669" : "#e11d48";
  return (
    <Svg width={10} height={10} viewBox="0 0 24 24">
      <Path d="M12 2a10 10 0 1 0 0 20a10 10 0 1 0 0-20" stroke={color} strokeWidth={2.25} fill="none" />
      <Path d={value ? "M8 12.5l2.7 2.7L16 9.8" : "M9 9l6 6M15 9l-6 6"} stroke={color} strokeWidth={2.25} fill="none" />
    </Svg>
  );
}

export interface ComparePdfProps {
  listings: Listing[];
  rows: CompareRow[];
  /** JPEG-Daten des ersten Bildes je Objekt (null = kein Bild) */
  images: (Buffer | null)[];
  /** Gebäude-Bildmarke (PNG) für den Kopf */
  logoMark: Buffer | null;
  /** z. B. „1.100+“ für „… Gewerbeimmobilien in Hamburg“ */
  totalLabel: string;
  onlyDifferences: boolean;
}

/** Vergleichs-PDF: Kopf und Fuß wie das bisherige PDF von buerohamburg.de, Inhalt = Vergleichstabelle der Website */
export function ComparePdf({ listings, rows, images, logoMark, totalLabel, onlyDifferences }: ComparePdfProps) {
  return (
    <Document title="Immobilienvergleich – BüroHamburg.de" author="BüroHamburg.de" language="de">
      <Page size="A4" orientation="landscape" style={styles.page}>
        <View style={styles.header} fixed>
          <View style={styles.wordmark}>
            <Text style={{ fontSize: 18, fontFamily: "Helvetica-Bold" }}>BÜRO</Text>
            <Text style={{ fontSize: 18 }}>HAMBURG</Text>
            <Text style={{ fontSize: 9, marginBottom: 2 }}>.DE</Text>
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.tagline}>{totalLabel} GEWERBEIMMOBILIEN IN HAMBURG.</Text>
            {/* eslint-disable-next-line jsx-a11y/alt-text -- react-pdf-Image kennt kein alt */}
            {logoMark && <Image src={logoMark} style={{ width: 52, height: 30 }} />}
          </View>
        </View>

        <Text style={styles.title}>
          Immobilienvergleich{onlyDifferences ? " – nur Unterschiede" : ""}
        </Text>

        <View style={styles.table}>
          <View style={styles.row} wrap={false}>
            <View style={[styles.labelCell, { justifyContent: "flex-end", color: "#111827", fontFamily: "Helvetica-Bold" }]}>
              <Text>Kriterium</Text>
            </View>
            {listings.map((listing, i) => (
              <View key={listing.id} style={styles.headCell}>
                {/* eslint-disable-next-line jsx-a11y/alt-text -- react-pdf-Image kennt kein alt */}
                {images[i] ? <Image src={images[i]!} style={styles.thumb} /> : <View style={styles.thumbEmpty} />}
                <Text style={{ fontFamily: "Helvetica-Bold", fontSize: 8.5 }}>{listing.title}</Text>
                <Text style={{ color: MUTED, marginTop: 2 }}>
                  {formatRentLabel(listing)} · {formatArea(listing.area)}
                </Text>
              </View>
            ))}
          </View>

          {rows.map((row, r) => (
            <View
              key={row.key}
              style={[styles.row, r === rows.length - 1 ? { borderBottomWidth: 0 } : {}]}
              wrap={false}
            >
              <Text style={styles.labelCell}>{row.label}</Text>
              {listings.map((listing, i) => {
                const tone = row.tones?.[i];
                const colors = tone === "good" ? GOOD : tone === "bad" ? BAD : null;
                return (
                  <View
                    key={listing.id}
                    style={[styles.cell, colors ? { backgroundColor: colors.bg } : {}]}
                  >
                    {row.flags ? (
                      <Flag value={row.flags[i]} />
                    ) : (
                      <Text
                        style={colors ? { color: colors.fg, fontFamily: "Helvetica-Bold" } : {}}
                      >
                        {row.values[i] ?? "–"}
                      </Text>
                    )}
                  </View>
                );
              })}
            </View>
          ))}
          {rows.length === 0 && (
            <Text style={{ padding: 12, color: MUTED }}>Keine Unterschiede in den verglichenen Angaben.</Text>
          )}
        </View>

        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>
            <Text style={{ fontFamily: "Helvetica-Bold" }}>Geschäftsbedingungen: </Text>
            {OFFER_TERMS}
          </Text>
          <Text style={[styles.footerText, { marginTop: 6 }]}>
            {COMPANY.name} / {COMPANY.street} / {COMPANY.postalCode} {COMPANY.city} / T {COMPANY.phone.display} / F{" "}
            {COMPANY.fax.display} / {COMPANY.email} / {COMPANY.bank.name} / BIC {COMPANY.bank.bic} / IBAN{" "}
            {COMPANY.bank.iban} / Steuernummer {COMPANY.taxNumber} / {COMPANY.register.court}, {COMPANY.register.number} /{" "}
            {COMPANY.website}
          </Text>
        </View>
        <Text
          style={styles.pageNumber}
          fixed
          render={({ pageNumber, totalPages }) => (totalPages > 1 ? `Seite ${pageNumber} von ${totalPages}` : "")}
        />
      </Page>
    </Document>
  );
}
