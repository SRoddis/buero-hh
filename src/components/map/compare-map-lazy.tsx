"use client";

import dynamic from "next/dynamic";

import { Skeleton } from "@/components/ui/skeleton";

export const CompareMap = dynamic(() => import("./compare-map"), {
  ssr: false,
  loading: () => <Skeleton className="size-full rounded-none" />,
});
