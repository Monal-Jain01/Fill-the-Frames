import { PageHeader } from '@/components/common/page-header';
import { SectionCard } from '@/components/common/section-card';
import Link from 'next/link';
import { Film, Layers, CheckCircle, ArrowRight } from 'lucide-react';

export default function DashboardHome() {
  const workflows = [
    {
      title: 'Animation',
      description: 'Visualize atmospheric evolution over time and review temporal interpolations with the Leaflet viewer.',
      href: '/dashboard/animation',
      icon: Film,
      color: 'text-blue-500',
      bg: 'bg-blue-500/10'
    },
    {
      title: 'Interpolation',
      description: 'Generate missing satellite frames utilizing the AI-driven RIFE model specifically fine-tuned for INSAT Thermal Infrared data.',
      href: '/dashboard/interpolation',
      icon: Layers,
      color: 'text-purple-500',
      bg: 'bg-purple-500/10'
    },
    {
      title: 'Validation',
      description: 'Synchronize and compare AI generated frames side-by-side with ground truth for quantitative accuracy checks.',
      href: '/dashboard/validation',
      icon: CheckCircle,
      color: 'text-emerald-500',
      bg: 'bg-emerald-500/10'
    }
  ];

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Dashboard Overview" 
        description="Select a workflow to process, visualize, or validate satellite imagery." 
      />
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {workflows.map((workflow) => (
          <Link href={workflow.href} key={workflow.title}>
            <SectionCard className="h-full hover:border-primary/50 transition-colors group cursor-pointer relative overflow-hidden">
              <div className="flex flex-col h-full space-y-4">
                <div className={`w-12 h-12 rounded-xl ${workflow.bg} flex items-center justify-center`}>
                  <workflow.icon className={`w-6 h-6 ${workflow.color}`} />
                </div>
                
                <div>
                  <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">
                    {workflow.title}
                  </h3>
                  <p className="text-sm text-slate-400">
                    {workflow.description}
                  </p>
                </div>

                <div className="flex-1" />
                
                <div className="flex items-center text-sm font-medium text-primary opacity-80 group-hover:opacity-100 transition-opacity">
                  Access Module <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </SectionCard>
          </Link>
        ))}
      </div>
    </div>
  );
}
