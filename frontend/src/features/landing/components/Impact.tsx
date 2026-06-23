'use client';

import { motion } from 'framer-motion';
import { CloudLightning, ShieldCheck, ThermometerSun, FileOutput } from 'lucide-react';

export function Impact() {
  const impacts = [
    {
      title: "Cyclone Tracking",
      desc: "Monitor rapid eye-wall replacement and structural changes with continuous frames.",
      icon: CloudLightning
    },
    {
      title: "Wildfire Progression",
      desc: "Track thermal anomalies and fire front movements between standard intervals.",
      icon: ThermometerSun
    },
    {
      title: "Scientific Validation",
      desc: "Built-in SSIM and FSIM metrics to quantify interpolation fidelity against real data.",
      icon: ShieldCheck
    },
    {
      title: "Export & Share",
      desc: "Download generated frames in standard NetCDF format or MP4 animations for reporting.",
      icon: FileOutput
    }
  ];

  return (
    <section className="py-24 bg-card/50 border-t border-b border-border/50">
      <div className="container mx-auto px-4 max-w-5xl">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Scientific Impact</h2>
          <p className="text-muted-foreground text-lg">Empowering meteorologists with actionable, high-frequency intelligence.</p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8">
          {impacts.map((item, i) => (
            <motion.div 
              key={item.title}
              className="flex gap-4 p-6 rounded-xl border border-border/50 bg-background hover:bg-secondary/50 transition-colors"
              initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
            >
              <div className="shrink-0 mt-1">
                <item.icon className="h-6 w-6 text-accent" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                <p className="text-muted-foreground">{item.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
