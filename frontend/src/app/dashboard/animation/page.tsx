import { PageHeader } from '@/components/common/page-header';
import { SectionCard } from '@/components/common/section-card';
import { AnimationMap } from '@/features/animation/components/animation-map';
import { AnimationControls } from '@/features/animation/components/animation-controls';
import { AnimationTimeline } from '@/features/animation/components/animation-timeline';
import { AnimationInfoPanel } from '@/features/animation/components/animation-info-panel';
import { AnimationVariableSelector } from '@/features/animation/components/animation-variable-selector';

export default function AnimationPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="INSAT Time Evolution Viewer" description="Visualize atmospheric evolution over time and review temporal interpolations." />
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 space-y-4">
          <SectionCard>
            <AnimationMap />
          </SectionCard>
          
          <AnimationTimeline />
        </div>
        
        <div className="space-y-4">
          <AnimationVariableSelector />
          <AnimationControls />
          <AnimationInfoPanel />
        </div>
      </div>
    </div>
  );
}