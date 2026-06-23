export type PlaybackState = "idle" | "playing" | "paused" | "stopped";

export interface AnimationFrame {
  id: string;
  label: string; // e.g., "T0", "T0.25", "T0.5", "T0.75", "T1"
  timestamp: string; // ISO string
  interpolationRatio: number; // 0 for T0, 1 for T1, 0.5 for T0.5
  resolution: string; // e.g., "4km"
  frameType: "observation" | "interpolated";
  imageData: unknown; // Opaque payload for visualization (e.g., Plotly data, Image URL, Heatmap array)
}

export interface AnimationSettings {
  fps: number;
  loopMode: boolean;
  playbackSpeed: number; // e.g., 0.5, 1, 2, 4
}

export interface AnimationState {
  frames: AnimationFrame[];
  currentFrameIndex: number;
  playbackState: PlaybackState;
  settings: AnimationSettings;
  exportFramesReady: boolean;
  frameCount: number;
}
