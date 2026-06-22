import { AnimationFrame } from "../types";

export const MOCK_ANIMATION_FRAMES: AnimationFrame[] = [
  {
    id: "frame-t0",
    label: "T0",
    timestamp: "2023-10-25T12:00:00Z",
    interpolationRatio: 0,
    resolution: "4km",
    frameType: "observation",
    imageData: {
      type: "mock_matrix",
      pattern: "base_cloud",
      intensity: 0.2,
    },
  },
  {
    id: "frame-t0-25",
    label: "T0.25",
    timestamp: "2023-10-25T12:07:30Z",
    interpolationRatio: 0.25,
    resolution: "4km",
    frameType: "interpolated",
    imageData: {
      type: "mock_matrix",
      pattern: "growing_cloud",
      intensity: 0.4,
    },
  },
  {
    id: "frame-t0-5",
    label: "T0.5",
    timestamp: "2023-10-25T12:15:00Z",
    interpolationRatio: 0.5,
    resolution: "4km",
    frameType: "interpolated",
    imageData: {
      type: "mock_matrix",
      pattern: "peak_cloud",
      intensity: 0.6,
    },
  },
  {
    id: "frame-t0-75",
    label: "T0.75",
    timestamp: "2023-10-25T12:22:30Z",
    interpolationRatio: 0.75,
    resolution: "4km",
    frameType: "interpolated",
    imageData: {
      type: "mock_matrix",
      pattern: "dissipating_cloud",
      intensity: 0.8,
    },
  },
  {
    id: "frame-t1",
    label: "T1",
    timestamp: "2023-10-25T12:30:00Z",
    interpolationRatio: 1.0,
    resolution: "4km",
    frameType: "observation",
    imageData: {
      type: "mock_matrix",
      pattern: "clear_sky",
      intensity: 1.0,
    },
  },
];
