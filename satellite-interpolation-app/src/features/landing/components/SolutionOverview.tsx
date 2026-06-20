'use client';

import { motion } from 'framer-motion';
import { Network, Layers, Maximize } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export function SolutionOverview() {
  return (
    <section className="py-24">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="flex flex-col md:flex-row items-center gap-12">
          <motion.div 
            className="flex-1 space-y-6"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-primary">Our Solution</h2>
            <p className="text-lg text-muted-foreground">
              We leverage an advanced AI-powered frame interpolation pipeline (modified RIFE model) optimized specifically for single-channel Thermal Infrared (TIR) satellite imagery.
            </p>
            <ul className="space-y-4">
              {[
                { icon: Network, text: "Deep Learning Interpolation" },
                { icon: Layers, text: "Scientific Metadata Preservation" },
                { icon: Maximize, text: "High-Fidelity Output Generation" }
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-foreground font-medium">
                  <div className="p-2 rounded-full bg-primary/10 text-primary">
                    <item.icon className="h-5 w-5" />
                  </div>
                  {item.text}
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div 
            className="flex-1 w-full"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Card className="p-1 bg-gradient-to-br from-primary/30 to-accent/30 border-none">
              <div className="bg-card rounded-lg p-8 h-full flex flex-col justify-center items-center relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('/noise.png')] opacity-5 mix-blend-overlay"></div>
                <div className="flex items-center justify-between w-full relative z-10">
                  <div className="text-center">
                    <div className="w-24 h-24 rounded-md bg-secondary border border-border flex items-center justify-center text-muted-foreground font-mono text-sm shadow-inner">T0</div>
                    <p className="mt-2 text-xs font-semibold">00:00</p>
                  </div>
                  
                  <div className="flex-1 flex items-center justify-center px-4">
                    <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-primary to-transparent relative">
                      <motion.div 
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-primary/20 rounded-full blur-xl"
                        animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                      />
                    </div>
                  </div>

                  <div className="text-center z-10">
                    <motion.div 
                      className="w-24 h-24 rounded-md border-2 border-primary bg-primary/5 flex items-center justify-center text-primary font-mono text-sm font-bold shadow-[0_0_15px_rgba(37,99,235,0.5)]"
                      initial={{ scale: 0.9 }}
                      animate={{ scale: 1 }}
                      transition={{ repeat: Infinity, repeatType: "reverse", duration: 1.5 }}
                    >
                      T0.5
                    </motion.div>
                    <p className="mt-2 text-xs font-semibold text-primary">00:15 (Generated)</p>
                  </div>

                  <div className="flex-1 flex items-center justify-center px-4 z-10">
                    <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-primary to-transparent"></div>
                  </div>

                  <div className="text-center z-10">
                    <div className="w-24 h-24 rounded-md bg-secondary border border-border flex items-center justify-center text-muted-foreground font-mono text-sm shadow-inner">T1</div>
                    <p className="mt-2 text-xs font-semibold">00:30</p>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
