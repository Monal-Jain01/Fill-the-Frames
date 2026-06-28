export type PlaybackState = "idle" | "playing" | "paused" | "stopped";

export interface AnimationFrame {
  frameId: string;
  timestamp: string;
  imageUrl: string;
  type?: "raw" | "ai";
  bounds?: [[number, number], [number, number]];
  variable?: string;
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
