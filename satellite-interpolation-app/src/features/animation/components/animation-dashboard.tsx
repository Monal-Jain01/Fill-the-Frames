import { useEffect } from "react";
import { useAnimation } from "../hooks/use-animation";
import { MOCK_ANIMATION_FRAMES } from "../mock/data";

import { AnimationSummary } from "./animation-summary";
import { AnimationStatistics } from "./animation-statistics";
import { AnimationControls } from "./animation-controls";
import { AnimationPlayer } from "./animation-player";
import { FrameTimeline } from "./frame-timeline";
import { FrameMetadataPanel } from "./frame-metadata-panel";
import { AnimationSettingsPanel } from "./animation-settings";
import { AnimationEmptyState } from "./animation-empty-state";

export function AnimationDashboard() {
  const animation = useAnimation([]);

  // Load mock data on mount
  useEffect(() => {
    animation.setFrames(MOCK_ANIMATION_FRAMES);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex flex-col space-y-6 max-w-6xl mx-auto w-full pb-12">
      <AnimationSummary />
      
      {animation.totalFrames === 0 ? (
        <AnimationEmptyState />
      ) : (
        <>
          <AnimationStatistics 
            totalFrames={animation.totalFrames}
            currentFrameIndex={animation.currentFrameIndex}
            settings={animation.settings}
          />
          
          <AnimationControls 
            playbackState={animation.playbackState}
            settings={animation.settings}
            totalFrames={animation.totalFrames}
            onPlay={animation.play}
            onPause={animation.pause}
            onStop={animation.stop}
            onNext={animation.nextFrame}
            onPrev={animation.prevFrame}
            onUpdateSettings={animation.updateSettings}
          />
          
          <AnimationPlayer currentFrame={animation.currentFrame} />
          
          <FrameTimeline 
            frames={animation.frames}
            currentIndex={animation.currentFrameIndex}
            onJumpToFrame={animation.jumpToFrame}
          />
          
          <FrameMetadataPanel frame={animation.currentFrame} />
          
          <AnimationSettingsPanel 
            settings={animation.settings}
            onUpdateSettings={animation.updateSettings}
          />
        </>
      )}
    </div>
  );
}
