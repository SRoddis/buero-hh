"use client";

import dynamic from "next/dynamic";

import { Skeleton } from "@/components/ui/skeleton";

/** MapLibre benötigt `window` und WebGL – daher nur clientseitig laden. */
export const ListingsMap = dynamic(() => import("./listings-map"), {
  ssr: false,
  loading: () => <Skeleton className="size-full rounded-none" />,
});
