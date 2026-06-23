'use client';

import { motion } from 'framer-motion';

export function Timeline() {
  const events = [
    { time: '00:00', label: 'T0 (Actual)', color: 'bg-secondary text-muted-foreground' },
    { time: '00:05', label: 'T0.16 (AI)', color: 'bg-primary/20 text-primary border border-primary/50' },
    { time: '00:10', label: 'T0.33 (AI)', color: 'bg-primary/20 text-primary border border-primary/50' },
    { time: '00:15', label: 'T0.5 (AI)', color: 'bg-primary/40 text-primary border-2 border-primary font-bold shadow-[0_0_10px_rgba(37,99,235,0.4)]' },
    { time: '00:20', label: 'T0.66 (AI)', color: 'bg-primary/20 text-primary border border-primary/50' },
    { time: '00:25', label: 'T0.83 (AI)', color: 'bg-primary/20 text-primary border border-primary/50' },
    { time: '00:30', label: 'T1 (Actual)', color: 'bg-secondary text-muted-foreground' },
  ];

  return (
    <section className="py-24 bg-card/30">
      <div className="container mx-auto px-4 max-w-5xl text-center">
        <motion.h2 
          className="text-3xl md:text-4xl font-bold mb-6"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          Unprecedented Temporal Resolution
        </motion.h2>
        <motion.p 
          className="text-muted-foreground text-lg mb-16 max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
        >
          Transform a standard 30-minute observation gap into a fluid, high-frequency timeline down to 5-minute intervals.
        </motion.p>

        <div className="relative">
          {/* Connecting Line */}
          <div className="absolute top-1/2 left-0 right-0 h-1 bg-border -translate-y-1/2 hidden md:block"></div>
          
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 relative z-10">
            {events.map((event, i) => (
              <motion.div 
                key={event.time}
                className="flex flex-col items-center group"
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, type: "spring" }}
              >
                <div className={`w-20 h-20 rounded-full flex flex-col items-center justify-center transition-transform group-hover:scale-110 ${event.color}`}>
                  <span className="text-sm font-mono">{event.time}</span>
                </div>
                <span className="mt-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {event.label}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
