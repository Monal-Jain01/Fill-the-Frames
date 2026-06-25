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
    const { frames, selectedVariable, currentFrameIndex } = get();
    const filtered = selectedVariable ? frames.filter(f => f.variable === selectedVariable) : frames;
    if (filtered.length === 0) return;
    
    // Check if current index is out of bounds for the filtered array
    set({ 
      playing: true,
      currentFrameIndex: currentFrameIndex >= filtered.length - 1 ? 0 : currentFrameIndex 
    });
  },
  
  pause: () => set({ playing: false }),
  
  stop: () => set({ playing: false, currentFrameIndex: 0 }),
  
  nextFrame: () => {
    const { frames, selectedVariable, currentFrameIndex } = get();
    const filtered = selectedVariable ? frames.filter(f => f.variable === selectedVariable) : frames;
    if (filtered.length === 0) return;
    set({
      currentFrameIndex: (currentFrameIndex + 1) % filtered.length,
    });
  },
  
  prevFrame: () => {
    const { frames, selectedVariable, currentFrameIndex } = get();
    const filtered = selectedVariable ? frames.filter(f => f.variable === selectedVariable) : frames;
    if (filtered.length === 0) return;
    set({
      currentFrameIndex: currentFrameIndex > 0 ? currentFrameIndex - 1 : filtered.length - 1,
    });
  },
  
  jumpToFrame: (index: number) => {
    const { frames, selectedVariable } = get();
    const filtered = selectedVariable ? frames.filter(f => f.variable === selectedVariable) : frames;
    if (index >= 0 && index < filtered.length) {
      set({ currentFrameIndex: index });
    }
  },
  
  setSpeed: (speed: number) => set({ playbackSpeed: speed }),
  
  setSelectedVariable: (variable: string | null) => set({ 
    selectedVariable: variable,
    currentFrameIndex: 0 // Reset index when variable changes
  }),
  setLoading: (loading: boolean) => set({ loading }),
  setError: (error: string | null) => set({ error }),
}));
