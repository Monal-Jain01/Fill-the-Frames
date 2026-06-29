"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, ImageOverlay, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useAnimationStore } from "@/store/animation-store";
import { useAnimation } from "@/features/animation/hooks/use-animation";

// Specific bounds to lock the camera strictly to India
const INDIA_BOUNDS: [[number, number], [number, number]] = [
  [6.0, 68.0],  // South-West
  [38.0, 98.0], // North-East
];

// Fallback bounds for the actual satellite image if missing (Full Hemisphere)
const FULL_DISK_BOUNDS: [[number, number], [number, number]] = [
  [-81.0, 1.0],
  [81.0, 163.0],
];

export default function AnimationMapClient() {
  // Initialize the orchestration hook (handles API polling, SSE, and playback timers)
  useAnimation();

  const { frames, currentFrameIndex, selectedVariable } = useAnimationStore();
  
  // Filter frames by selected variable
  const filteredFrames = selectedVariable 
    ? frames.filter(f => f.variable === selectedVariable)
    : frames;
    
  // Since index might be out of bounds for filtered frames, bound it
  const safeIndex = currentFrameIndex < filteredFrames.length ? currentFrameIndex : 0;
  const currentFrame = filteredFrames[safeIndex];

  // The actual PNG needs to be stretched over the entire hemisphere to be physically accurate
  const imageBounds = currentFrame?.bounds || FULL_DISK_BOUNDS;

  return (
    <div className="w-full h-[600px] rounded-xl overflow-hidden border border-slate-800 shadow-xl relative z-0">
      {filteredFrames.length === 0 && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-full border-2 border-slate-700 border-t-blue-500 animate-spin mx-auto" />
            <p className="text-slate-400 text-sm font-medium">Waiting for sequence data...</p>
          </div>
        </div>
      )}
      
      <MapContainer
        bounds={INDIA_BOUNDS}
        maxBounds={INDIA_BOUNDS}
        maxBoundsViscosity={1.0}
        minZoom={4}
        zoomControl={true}
        scrollWheelZoom={true}
        style={{ height: "100%", width: "100%", background: "#0f172a" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        
        {currentFrame?.imageUrl && (
          <ImageOverlay
            url={currentFrame.imageUrl}
            bounds={imageBounds}
            opacity={0.8}
            zIndex={10}
          />
        )}
      </MapContainer>
    </div>
  );
}