"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, ImageOverlay, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useAnimationStore } from "@/store/animation-store";

// South Asia / India approximate bounds for INSAT
const DEFAULT_BOUNDS: [[number, number], [number, number]] = [
  [-10, 45],
  [45, 100],
];

// Helper to fit bounds when they change
function MapController({ bounds }: { bounds: [[number, number], [number, number]] }) {
  const map = useMap();
  useEffect(() => {
    map.fitBounds(bounds, { animate: true });
  }, [map, bounds]);
  return null;
}

export default function AnimationMapClient() {
  const { frames, currentFrameIndex } = useAnimationStore();
  const currentFrame = frames[currentFrameIndex];

  const bounds = currentFrame?.bounds || DEFAULT_BOUNDS;

  return (
    <div className="w-full h-[600px] rounded-xl overflow-hidden border border-slate-800 shadow-xl relative z-0">
      <MapContainer
        bounds={bounds}
        zoomControl={true}
        scrollWheelZoom={true}
        style={{ height: "100%", width: "100%", background: "#0f172a" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        
        {currentFrame?.imageUrl && (
          <ImageOverlay
            url={currentFrame.imageUrl}
            bounds={bounds}
            opacity={0.8}
            zIndex={10}
          />
        )}
        
        <MapController bounds={bounds} />
      </MapContainer>
    </div>
  );
}
