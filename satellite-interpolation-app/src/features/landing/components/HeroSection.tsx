'use client';

import { motion } from 'framer-motion';
import { Satellite, ArrowRight, Activity, Globe } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export function HeroSection() {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
      {/* Background stars/grid effect */}
      <div className="absolute inset-0 z-0 opacity-20"
           style={{
             backgroundImage: 'radial-gradient(circle at center, #ffffff 1px, transparent 1px)',
             backgroundSize: '40px 40px'
           }}
      />
      
      <div className="container relative z-10 mx-auto px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="flex justify-center mb-6"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/30 bg-primary/10 text-primary text-sm font-medium">
            <Globe className="h-4 w-4" />
            <span>ISRO Hackathon Demo</span>
          </div>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white via-primary-foreground to-muted-foreground"
        >
          Fill the Frames
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="max-w-2xl mx-auto text-xl text-muted-foreground mb-10"
        >
          AI-powered temporal enhancement of geostationary satellite imagery. 
          Generate high-fidelity intermediate observations to track rapidly evolving atmospheric events.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Button asChild size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 h-12 px-8">
            <Link href="/dashboard/upload">
              Launch Platform <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="h-12 px-8 border-primary/50 hover:bg-primary/10">
            <Link href="#architecture">
              View Architecture <Activity className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
