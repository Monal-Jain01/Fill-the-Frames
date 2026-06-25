"use client";

import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";

// Dynamically import the Leaflet map with SSR disabled
const AnimationMapClient = dynamic(() => import("./animation-map-client"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[600px] bg-slate-950 flex items-center justify-center rounded-xl overflow-hidden border border-slate-800">
      <div className="flex flex-col items-center gap-4">
        <Skeleton className="w-16 h-16 rounded-full bg-slate-800" />
        <Skeleton className="h-4 w-48 bg-slate-800" />
      </div>
    </div>
  ),
});

export function AnimationMap() {
  return <AnimationMapClient />;
}
