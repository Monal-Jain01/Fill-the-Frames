/* eslint-disable */
"use client";

import { useEffect, useRef, useMemo } from "react";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
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

/**
 * Imperative Leaflet layer manager that pre-mounts ALL frame overlays
 * at opacity=0, then toggles only the active frame to opacity=0.8.
 *
 * This avoids the react-leaflet <ImageOverlay> pitfall where changing
 * the `url` prop destroys and recreates the DOM <img> element, causing
 * a visible flash/freeze on every frame tick.
 */
function FrameLayerManager() {
  const map = useMap();
  const { frames, currentFrameIndex, selectedVariable } = useAnimationStore();

  // url -> L.ImageOverlay instance
  const layersRef = useRef<Map<string, L.ImageOverlay>>(new Map());
  const activeUrlRef = useRef<string | null>(null);

  const filteredFrames = useMemo(() => {
    return selectedVariable
      ? frames.filter((f) => f.variable === selectedVariable)
      : frames;
  }, [frames, selectedVariable]);

  const safeIndex =
    currentFrameIndex < filteredFrames.length ? currentFrameIndex : 0;
  const currentFrame = filteredFrames[safeIndex];

  // ── Sync layer pool: add new overlays, remove stale ones ──────────
  useEffect(() => {
    const wantedUrls = new Set(
      filteredFrames.map((f) => f.imageUrl).filter(Boolean)
    );
    const pool = layersRef.current;

    // Remove overlays whose URL is no longer in the frame list
    for (const [url, layer] of pool) {
      if (!wantedUrls.has(url)) {
        map.removeLayer(layer);
        pool.delete(url);
      }
    }

    // Add overlays for new URLs (hidden at opacity 0)
    for (const frame of filteredFrames) {
      if (!frame.imageUrl || pool.has(frame.imageUrl)) continue;

      const bounds: L.LatLngBoundsExpression =
        frame.bounds || FULL_DISK_BOUNDS;

      const overlay = L.imageOverlay(frame.imageUrl, bounds, {
        opacity: 0,
        zIndex: 10,
        interactive: false,
      });
      overlay.addTo(map);
      pool.set(frame.imageUrl, overlay);
    }
  }, [filteredFrames, map]);

  // ── Toggle opacity: active frame → 0.8, previous → 0 ─────────────
  useEffect(() => {
    const targetUrl = currentFrame?.imageUrl ?? null;

    // Nothing changed — skip
    if (targetUrl === activeUrlRef.current) return;

    const pool = layersRef.current;

    // Hide previously active overlay
    if (activeUrlRef.current) {
      const prev = pool.get(activeUrlRef.current);
      if (prev) prev.setOpacity(0);
    }

    // Show the new active overlay
    if (targetUrl) {
      const next = pool.get(targetUrl);
      if (next) next.setOpacity(0.8);
    }

    activeUrlRef.current = targetUrl;
  }, [currentFrame?.imageUrl]);

  // ── Cleanup on unmount ────────────────────────────────────────────
  useEffect(() => {
    return () => {
      for (const [, layer] of layersRef.current) {
        map.removeLayer(layer);
      }
      layersRef.current.clear();
      activeUrlRef.current = null;
    };
  }, [map]);

  return null;
}

export default function AnimationMapClient() {
  // Initialize the orchestration hook (SSE, REST fetch, playback timer)
  useAnimation();

  const { frames, selectedVariable } = useAnimationStore();

  const filteredFrames = selectedVariable
    ? frames.filter((f) => f.variable === selectedVariable)
    : frames;

  return (
    <div className="w-full h-[600px] rounded-xl overflow-hidden border border-slate-800 shadow-xl relative z-0">
      {filteredFrames.length === 0 && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-full border-2 border-slate-700 border-t-blue-500 animate-spin mx-auto" />
            <p className="text-slate-400 text-sm font-medium">
              Waiting for sequence data...
            </p>
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

        {/* All frame overlays live here — managed imperatively */}
        <FrameLayerManager />
      </MapContainer>
    </div>
  );
}
