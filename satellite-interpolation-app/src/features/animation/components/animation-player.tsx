import { motion, AnimatePresence } from "framer-motion";
import { AnimationFrame } from "../types";
import { Card } from "@/components/ui/card";

interface AnimationPlayerProps {
  currentFrame: AnimationFrame | null;
}

export function AnimationPlayer({ currentFrame }: AnimationPlayerProps) {
  if (!currentFrame) return null;

  // Mock visualization representing thermal data
  const getGradient = (pattern: string, intensity: number) => {
    const hue = 210 + (intensity * 40); // Shift colors based on mock intensity
    return `radial-gradient(circle at 50% 50%, hsl(${hue}, 80%, 40%), hsl(${hue - 20}, 90%, 10%))`;
  };

  // Safe access for mock data
  const imageData = currentFrame.imageData as Record<string, unknown>;
  const pattern = (imageData?.pattern as string) || "default";
  const intensity = (imageData?.intensity as number) || 0.5;

  return (
    <Card className="relative w-full aspect-video overflow-hidden bg-black flex items-center justify-center border-slate-800 shadow-lg">
      <AnimatePresence mode="popLayout">
        <motion.div
          key={currentFrame.id}
          initial={{ opacity: 0.8, filter: "blur(4px)" }}
          animate={{ opacity: 1, filter: "blur(0px)" }}
          exit={{ opacity: 0.8, filter: "blur(4px)" }}
          transition={{ duration: 0.15 }}
          className="absolute inset-0 flex items-center justify-center"
          style={{ background: getGradient(pattern, intensity) }}
        >
          {/* Mock Satellite Data Grid Overlay */}
          <div className="absolute inset-0 opacity-30" 
               style={{ 
                 backgroundImage: 'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)', 
                 backgroundSize: '40px 40px' 
               }} 
          />
          
          <div className="text-white text-3xl md:text-5xl font-bold opacity-20 drop-shadow-2xl">
            {currentFrame.label}
          </div>
        </motion.div>
      </AnimatePresence>
      
      {/* On-Screen Display (OSD) Overlay */}
      <div className="absolute top-4 right-4 bg-black/60 text-white px-3 py-1.5 rounded text-xs md:text-sm font-mono backdrop-blur-md border border-white/10 z-10">
        {new Date(currentFrame.timestamp).toISOString().split('T')[1].replace('Z', '')} UTC
      </div>
      
      <div className="absolute bottom-4 left-4 bg-black/60 text-white px-3 py-1.5 rounded text-xs md:text-sm font-mono backdrop-blur-md border border-white/10 z-10">
        Interpolation: {(currentFrame.interpolationRatio * 100).toFixed(0)}%
      </div>
      
      <div className="absolute bottom-4 right-4 bg-black/60 text-white px-3 py-1.5 rounded text-xs md:text-sm font-mono backdrop-blur-md border border-white/10 z-10 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
        {currentFrame.frameType.toUpperCase()}
      </div>
    </Card>
  );
}
