import type { LucideIcon } from "lucide-react";

/** Gemeinsame Bausteine für Störungs- und 404-Seite */

export const HOMEPAGE = "https://www.buerohamburg.de";

export function InfoTile({
  icon: Icon,
  title,
  action,
  children,
}: {
  icon: LucideIcon;
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center px-6 py-7">
      <span className="flex size-12 items-center justify-center rounded-full bg-brand-light text-brand">
        <Icon className="size-5" />
      </span>
      <h2 className="mt-4 font-semibold">{title}</h2>
      <p className="mt-1.5 max-w-60 text-sm text-muted-foreground">{children}</p>
      {action}
    </div>
  );
}

/** Hamburger Skyline (Michel, Elbphilharmonie, Brücke) als schlichte Linienzeichnung */
export function SkylineIllustration() {
  const line = "#9ca3af";
  return (
    <svg viewBox="0 0 480 230" className="w-full" aria-hidden>
      <circle cx="240" cy="125" r="100" fill="#f7e9ec" />
      {/* Hintergrundgebäude */}
      <g fill="#f2d4da">
        <rect x="58" y="150" width="26" height="50" />
        <rect x="190" y="138" width="22" height="62" />
        <rect x="222" y="158" width="30" height="42" />
        <rect x="362" y="150" width="20" height="50" />
      </g>
      <g fill="#fff" stroke={line} strokeWidth="1.5" strokeLinejoin="round">
        {/* kleine Kirche links */}
        <rect x="96" y="128" width="16" height="72" />
        <path d="M96 128 L104 88 L112 128 Z" />
        <rect x="112" y="160" width="40" height="40" />
        <path d="M112 160 L132 146 L152 160" fill="none" />
        {/* Michel */}
        <rect x="140" y="150" width="56" height="50" />
        <rect x="158" y="96" width="20" height="54" />
        <rect x="161" y="72" width="14" height="24" />
        <path d="M161 72 Q168 58 175 72 Z" />
        <path d="M168 58 L168 38" />
        <circle cx="168" cy="110" r="4" fill="none" />
        {/* Elbphilharmonie */}
        <rect x="268" y="160" width="96" height="40" fill="#f1cdd4" />
        <path d="M268 160 L268 126 Q282 106 298 120 Q312 96 330 114 Q346 102 364 118 L364 160 Z" fill="#e8ebf0" />
        <path d="M268 140 H364 M268 150 H364 M292 116 V160 M316 108 V160 M340 110 V160" fill="none" strokeWidth="0.75" />
        {/* Brücke */}
        <path d="M384 200 Q418 150 452 200" fill="none" />
        <path d="M380 186 H456" fill="none" />
        <path d="M398 186 V172 M410 186 V163 M422 186 V161 M434 186 V166 M446 186 V178" fill="none" strokeWidth="0.75" />
      </g>
      {/* Boden, Wolken, Möwen */}
      <path d="M30 200 H450" stroke="#d4d4d8" strokeWidth="1.5" />
      <g fill="none" stroke={line} strokeWidth="1.25" strokeLinecap="round">
        <path d="M84 78 h36 a8 8 0 0 0 -10 -12 a12 12 0 0 0 -20 4 a7 7 0 0 0 -6 8" />
        <path d="M352 66 h42 a9 9 0 0 0 -11 -13 a13 13 0 0 0 -22 4 a8 8 0 0 0 -9 9" />
        <path d="M318 60 q4 -4 8 0 q4 -4 8 0" />
        <path d="M336 50 q3 -3 6 0 q3 -3 6 0" />
      </g>
    </svg>
  );
}
