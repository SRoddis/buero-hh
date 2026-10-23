import { NextResponse, type NextRequest } from "next/server";

import { getRepository } from "@/lib/data/repository";

/** GET /api/listings?ids=a,b,c – liefert Kurzinfos für die (lokal gespeicherte) Merkliste. */
export async function GET(request: NextRequest) {
  const ids = (request.nextUrl.searchParams.get("ids") ?? "")
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean)
    .slice(0, 100);

  if (!ids.length) return NextResponse.json({ items: [] });

  const items = await (await getRepository()).getByIds(ids);
  return NextResponse.json({ items });
}
