"use client";

import React, { useState } from 'react';
import { MetadataResponse, VariableInfo } from '../types';
import { MetadataCard } from './metadata-card';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface MetadataVariableListProps {
  data: MetadataResponse;
}

export function MetadataVariableList({ data }: MetadataVariableListProps) {
  return (
    <MetadataCard title="Variables" description="Detailed list of data variables and their attributes.">
      <div className="space-y-4">
        {data.variables.map((variable) => (
          <VariableItem key={variable.name} variable={variable} />
        ))}
      </div>
    </MetadataCard>
  );
}

function VariableItem({ variable }: { variable: VariableInfo }) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="border rounded-lg overflow-hidden">
      <button
        className="w-full flex items-center justify-between p-4 bg-muted/30 hover:bg-muted/50 transition-colors text-left focus:outline-none"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <span className="font-semibold text-base">{variable.name}</span>
          <Badge variant="outline">{variable.datatype}</Badge>
          <span className="text-sm text-muted-foreground hidden sm:inline-block">
            {variable.dimensions.join(', ')}
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground hidden md:inline-block">
            {String(variable.attributes.long_name || '')}
          </span>
          {isExpanded ? <ChevronUp className="w-5 h-5 text-muted-foreground" /> : <ChevronDown className="w-5 h-5 text-muted-foreground" />}
        </div>
      </button>
      
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="border-t bg-card"
          >
            <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-sm font-semibold mb-2 text-muted-foreground uppercase tracking-wider">Attributes</h4>
                <dl className="space-y-2 text-sm">
                  {Object.entries(variable.attributes).map(([key, value]) => (
                    <div key={key} className="grid grid-cols-3 gap-2">
                      <dt className="font-medium">{key}:</dt>
                      <dd className="col-span-2 text-muted-foreground">{String(value)}</dd>
                    </div>
                  ))}
                </dl>
              </div>
              
              <div>
                <h4 className="text-sm font-semibold mb-2 text-muted-foreground uppercase tracking-wider">Statistics</h4>
                <dl className="space-y-2 text-sm">
                  <div className="grid grid-cols-3 gap-2">
                    <dt className="font-medium">Min:</dt>
                    <dd className="col-span-2 text-muted-foreground">{variable.min_value ?? 'N/A'}</dd>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <dt className="font-medium">Max:</dt>
                    <dd className="col-span-2 text-muted-foreground">{variable.max_value ?? 'N/A'}</dd>
                  </div>
                </dl>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
