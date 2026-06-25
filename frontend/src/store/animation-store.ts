import { create } from 'zustand';
import { AnimationFrame } from '@/features/animation/types';

interface AnimationStore {
  frames: AnimationFrame[];
  currentFrameIndex: number;
  playing: boolean;
  playbackSpeed: number;
  selectedVariable: string | null;
  loading: boolean;
  error: string | null;

  setFrames: (frames: AnimationFrame[]) => void;
  play: () => void;
  pause: () => void;
  stop: () => void;
  nextFrame: () => void;
  prevFrame: () => void;
  jumpToFrame: (index: number) => void;
  setSpeed: (speed: number) => void;
  setSelectedVariable: (variable: string | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useAnimationStore = create<AnimationStore>((set, get) => ({
  frames: [],
  currentFrameIndex: 0,
  playing: false,
  playbackSpeed: 1,
  selectedVariable: null,
  loading: false,
  error: null,

  setFrames: (frames) => set({ frames }),
  play: () => {
    const { frames, currentFrameIndex } = get();
    if (frames.length === 0) return;
    
    set({ 
      playing: true,
      currentFrameIndex: currentFrameIndex >= frames.length - 1 ? 0 : currentFrameIndex 
    });
  },
  pause: () => set({ playing: false }),
  stop: () => set({ playing: false, currentFrameIndex: 0 }),
  nextFrame: () => {
    const { frames, currentFrameIndex } = get();
    if (frames.length === 0) return;
    set({
      currentFrameIndex: (currentFrameIndex + 1) % frames.length,
    });
  },
  prevFrame: () => {
    const { frames, currentFrameIndex } = get();
    if (frames.length === 0) return;
    set({
      currentFrameIndex: currentFrameIndex > 0 ? currentFrameIndex - 1 : frames.length - 1,
    });
  },
  jumpToFrame: (index: number) => {
    const { frames } = get();
    if (index >= 0 && index < frames.length) {
      set({ currentFrameIndex: index });
    }
  },
  setSpeed: (speed: number) => set({ playbackSpeed: speed }),
  setSelectedVariable: (variable: string | null) => set({ selectedVariable: variable }),
  setLoading: (loading: boolean) => set({ loading }),
  setError: (error: string | null) => set({ error }),
}));
