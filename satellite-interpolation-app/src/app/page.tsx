import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { HeroSection } from '@/features/landing/components/HeroSection';
import { ProblemStatement } from '@/features/landing/components/ProblemStatement';
import { SolutionOverview } from '@/features/landing/components/SolutionOverview';
import { Timeline } from '@/features/landing/components/Timeline';
import { Architecture } from '@/features/landing/components/Architecture';
import { Impact } from '@/features/landing/components/Impact';
import { CTA } from '@/features/landing/components/CTA';

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground selection:bg-primary/30">
      <Navbar />
      
      <main className="flex-1">
        <HeroSection />
        <ProblemStatement />
        <SolutionOverview />
        <Timeline />
        <Architecture />
        <Impact />
        <CTA />
      </main>

      <Footer />
    </div>
  );
}
