'use client';

import { motion } from 'framer-motion';
import { AlertCircle, Clock, Zap } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export function ProblemStatement() {
  return (
    <section className="py-24 bg-card/50">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">The Challenge</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Current geostationary satellites capture imagery at discrete 30-minute intervals, creating dangerous blind spots during rapid weather events.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              title: "Discrete Observations",
              description: "Satellites like INSAT-3D provide snapshots every 30 minutes, missing crucial developments.",
              icon: Clock
            },
            {
              title: "Rapid Evolution",
              description: "Cyclones and convective clouds can evolve dramatically between standard observation windows.",
              icon: Zap
            },
            {
              title: "Blind Spots",
              description: "Lack of continuous data hampers critical decision-making and precise tracking of atmospheric phenomena.",
              icon: AlertCircle
            }
          ].map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.2, duration: 0.5 }}
            >
              <Card className="bg-background border-border hover:border-primary/50 transition-colors h-full">
                <CardHeader>
                  <item.icon className="h-8 w-8 text-destructive mb-4" />
                  <CardTitle>{item.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    {item.description}
                  </CardDescription>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
