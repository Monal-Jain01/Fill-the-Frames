'use client';

import { motion } from 'framer-motion';
import { Rocket } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export function CTA() {
  return (
    <section className="py-32 relative overflow-hidden">
      <div className="absolute inset-0 bg-primary/5"></div>
      
      <div className="container mx-auto px-4 relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-2xl mx-auto"
        >
          <Rocket className="h-16 w-16 text-primary mx-auto mb-6" />
          <h2 className="text-4xl font-bold mb-6">Ready to Fill the Frames?</h2>
          <p className="text-xl text-muted-foreground mb-10">
            Upload your INSAT-3D, GOES, or Himawari datasets and generate high-fidelity interpolations in minutes.
          </p>
          
          <Button asChild size="lg" className="h-14 px-10 text-lg">
            <Link href="/dashboard/upload">
              Access the Platform
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
