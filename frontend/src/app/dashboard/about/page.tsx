"use client";

import React, { useRef, useState } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { 
  UploadCloud, 
  FileJson, 
  Cpu, 
  Map, 
  PlayCircle, 
  SlidersHorizontal, 
  Download,
  CheckCircle2
} from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const TIMELINE_DATA = [
  {
    id: 'upload',
    label: 'Upload',
    icon: UploadCloud,
    fe: '<UploadZone />',
    api: '/upload',
    output: 'file_id',
    next: 'Metadata Extraction',
    tech: 'React Dropzone',
    workflow: ['User', 'UploadDropzone', 'POST /upload', 'UploadService', '/tmp Cache', 'HF Bucket', 'file_id']
  },
  {
    id: 'metadata',
    label: 'Metadata',
    icon: FileJson,
    fe: '<MetadataCard />',
    api: '/metadata',
    output: 'CRS, bounds',
    next: 'Interpolation',
    tech: 'SatPy, Xarray',
    workflow: ['file_id', 'GET /metadata', 'MetadataService', 'SatPy / Xarray', 'Metadata JSON']
  },
  {
    id: 'interpolation',
    label: 'Interpolation',
    icon: Cpu,
    fe: '<InterpolationPanel />',
    api: '/interpolation',
    output: 'artifact_id',
    next: 'Visualization',
    tech: 'ONNX, RIFE, CUDA',
    workflow: ['T0 + T1', 'POST /generate', 'InterpolationService', 'ONNX Runtime (RIFE)', 'Generated NetCDF', 'result_file_id']
  },
  {
    id: 'visualization',
    label: 'Visualization',
    icon: Map,
    fe: '<MapClient />',
    api: '/visualization',
    output: 'PNG tiles',
    next: 'Animation',
    tech: 'Leaflet',
    workflow: ['artifact_id', 'VisualizationService', 'PNG Tile', 'Leaflet Overlay']
  },
  {
    id: 'animation',
    label: 'Animation',
    icon: PlayCircle,
    fe: '<AnimationControls />',
    api: '/animation',
    output: 'GIF / MP4',
    next: 'Metrics',
    tech: 'FFmpeg',
    workflow: ['artifact_id', 'GET /animation', 'AnimationService', 'FFmpeg', 'MP4 / GIF']
  },
  {
    id: 'metrics',
    label: 'Metrics',
    icon: SlidersHorizontal,
    fe: '<ValidationSlider />',
    api: '/metrics',
    output: 'SSIM, PSNR',
    next: 'Export',
    tech: 'SciPy',
    workflow: ['artifact_id + truth_file_id', 'ValidationService', 'Difference Map', 'Metrics']
  },
  {
    id: 'export',
    label: 'Export',
    icon: Download,
    fe: '<ExportPanel />',
    api: '/export',
    output: 'NetCDF, MP4',
    next: 'Complete',
    tech: 'HF Bucket',
    workflow: ['artifact_id', 'GET /export', 'ExportService', 'NetCDF / MP4']
  },
];

export default function AboutPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  // Parallax layers
  // Background slow
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  // Spine medium
  const spineY = useTransform(scrollYProgress, [0, 1], ["-5%", "5%"]);

  return (
    <div 
      ref={containerRef} 
      className="relative min-h-[200vh] w-full overflow-hidden bg-background text-foreground flex flex-col"
    >
      {/* Background Parallax Layer */}
      <motion.div 
        style={{ y: bgY }}
        className="absolute inset-0 z-0 pointer-events-none opacity-[0.03]"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,var(--primary)_0,transparent_100%)]" />
        {/* Subtle grid to show motion better */}
        <div className="h-[200%] w-[100%] bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:4rem_4rem]" />
      </motion.div>

      <div className="relative z-10 w-full max-w-3xl mx-auto  px-4 flex-1 flex flex-col items-center">
        
        <div className="mb-32 text-center mt-12">
          <h1 className="text-4xl font-bold tracking-tight mb-4">Pipeline Architecture</h1>
          <p className="text-muted-foreground">Scroll to explore the stateless, AI-driven interpolation workflow.</p>
        </div>

        <div className="relative w-full flex flex-col items-center pb-32">
          {/* Parallax Spine */}
          <motion.div 
            style={{ y: spineY }}
            className="absolute top-0 bottom-0 w-1 bg-gradient-to-b from-transparent via-primary/30 to-transparent left-1/2 -translate-x-1/2"
          />

          <TooltipProvider delayDuration={100}>
            {TIMELINE_DATA.map((node, i) => {
              const isEven = i % 2 === 0;
              
              return (
                <TimelineNode 
                  key={node.id}
                  node={node}
                  isEven={isEven}
                />
              )
            })}
          </TooltipProvider>

        </div>
      </div>
    </div>
  );
}

function TimelineNode({ node, isEven }: { node: typeof TIMELINE_DATA[0], isEven: boolean }) {
  const ref = useRef(null);
  const [isHovered, setIsHovered] = useState(false);
  
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 85%", "end 35%"]
  });

  const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [0, 1, 1]);
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.8, 1, 1]);
  const y = useTransform(scrollYProgress, [0, 1], [80, 0]);

  const Icon = node.icon;

  return (
    <motion.div 
      ref={ref}
      style={{ opacity, scale, y }}
      className={`w-full flex items-start justify-center my-20 relative z-20 ${isEven ? 'flex-row' : 'flex-row-reverse'}`}
    >
      <div className={`w-1/2 flex ${isEven ? 'justify-end pr-8 sm:pr-16' : 'justify-start pl-8 sm:pl-16'}`}>
        <div 
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="group cursor-pointer">
                <Card className="w-32 sm:w-48 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border-primary/20 hover:border-primary/50 bg-background/80 backdrop-blur-sm">
                  <CardHeader className="p-4 flex flex-col items-center text-center space-y-2">
                    <div className="p-3 rounded-full bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
                      <Icon className="w-6 h-6" />
                    </div>
                    <CardTitle className="text-sm sm:text-base flex items-center gap-2">
                      {node.label}
                      
                        <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                    
                    </CardTitle>
                  </CardHeader>
                </Card>
              </div>
            </TooltipTrigger>
            <TooltipContent 
              side={isEven ? "left" : "right"} 
              sideOffset={16}
              className="p-0 border-none bg-transparent shadow-none"
            >
              <Card className="w-[280px] border-primary/30 shadow-2xl bg-card">
                <CardContent className="p-4 space-y-3 text-sm">
                  <div className="flex justify-between items-center pb-2 border-b">
                    <span className="font-semibold text-primary">{node.label} Node</span>
                    <Badge variant="secondary" className="text-[10px] uppercase tracking-wider">{node.tech}</Badge>
                  </div>
                  <div className="grid grid-cols-[60px_1fr] gap-x-2 gap-y-1.5 text-muted-foreground">
                    <span className="font-medium text-foreground">FE:</span> 
                    <span className="font-mono text-xs truncate" title={node.fe}>{node.fe}</span>
                    
                    <span className="font-medium text-foreground">API:</span> 
                    <span className="font-mono text-xs truncate" title={node.api}>{node.api}</span>
                    
                    <span className="font-medium text-foreground">Output:</span> 
                    <span className="font-mono text-xs truncate" title={node.output}>{node.output}</span>
                    
                    <span className="font-medium text-foreground">Next:</span> 
                    <span className="truncate">{node.next}</span>
                  </div>
                </CardContent>
              </Card>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>

      {/* Central Node Indicator */}
      <div className="absolute left-1/2 top-10 -translate-x-1/2 w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-primary/80 border-2 sm:border-4 border-background shadow-[0_0_10px_rgba(var(--primary),0.5)] z-30" />
      
      {/* Workflow visualization on the opposite side */}
      <div className={`w-1/2 flex items-start ${isEven ? 'justify-start pl-8 sm:pl-16' : 'justify-end pr-8 sm:pr-16'}`}>
        <AnimatePresence>
          {isHovered && node.workflow && (
            <WorkflowVisualizer steps={node.workflow} />
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

function WorkflowVisualizer({ steps }: { steps: string[] }) {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col items-center pointer-events-none mt-2"
    >
      {steps.map((step, i) => (
        <React.Fragment key={i}>
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1, duration: 0.3 }}
            className="px-3 py-1.5 rounded-md bg-secondary/80 text-secondary-foreground text-xs font-mono border border-secondary shadow-sm whitespace-nowrap"
          >
            {step}
          </motion.div>
          {i < steps.length - 1 && (
            <motion.div
              initial={{ opacity: 0, scaleY: 0 }}
              animate={{ opacity: 1, scaleY: 1 }}
              transition={{ delay: i * 0.1 + 0.1, duration: 0.2 }}
              className="w-px h-6 bg-primary/30 origin-top my-1"
            />
          )}
        </React.Fragment>
      ))}
    </motion.div>
  )
}
