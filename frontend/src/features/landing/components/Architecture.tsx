'use client';

import { motion } from 'framer-motion';
import { Server, BrainCircuit, LineChart, LayoutDashboard } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export function Architecture() {
  const tiers = [
    {
      title: "Frontend Layer",
      icon: LayoutDashboard,
      tech: "Next.js 15, Tailwind CSS, Zustand",
      desc: "Responsive web interface for upload, visualization, and interactive comparison."
    },
    {
      title: "Backend API",
      icon: Server,
      tech: "FastAPI, Python 3.11+",
      desc: "High-performance REST API handling metadata extraction and job scheduling."
    },
    {
      title: "AI Inference Service",
      icon: BrainCircuit,
      tech: "PyTorch, CUDA, Modified RIFE",
      desc: "GPU-accelerated interpolation specifically trained on satellite TIR data."
    },
    {
      title: "Data & Metrics Layer",
      icon: LineChart,
      tech: "Xarray, scikit-image",
      desc: "Preserves CRS coordinates and computes structural similarity (SSIM, FSIM)."
    }
  ];

  return (
    <section id="architecture" className="py-24">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">System Architecture</h2>
          <p className="text-muted-foreground text-lg">Decoupled, scalable, and built for scientific workloads.</p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {tiers.map((tier, i) => (
            <motion.div
              key={tier.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15, duration: 0.5 }}
            >
              <Card className="bg-card border-border h-full hover:shadow-lg hover:shadow-primary/5 transition-all">
                <CardContent className="p-6 text-center flex flex-col items-center">
                  <div className="p-4 rounded-full bg-secondary text-primary mb-6">
                    <tier.icon className="h-8 w-8" />
                  </div>
                  <h3 className="text-lg font-bold mb-2">{tier.title}</h3>
                  <p className="text-xs text-accent font-mono mb-4 bg-accent/10 px-2 py-1 rounded">{tier.tech}</p>
                  <p className="text-sm text-muted-foreground">{tier.desc}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
