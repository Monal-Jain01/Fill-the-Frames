import React from 'react';
import { InterpolationConfig } from '../types';
import { healthClient } from '@/lib/api/health-client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Cpu, Settings2, ShieldCheck, Loader2, Info } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useQuery } from '@tanstack/react-query';

interface InterpolationConfigPanelProps {
  config: InterpolationConfig;
  onConfigChange: (config: Partial<InterpolationConfig>) => void;
  disabled?: boolean;
  availableVariables?: string[];
}

export function InterpolationConfigPanel({ config, onConfigChange, disabled, availableVariables = ["C13", "TIR1"] }: InterpolationConfigPanelProps) {
  const { data: gpuData, isLoading: isLoadingGpu, isError: isErrorGpu } = useQuery({
    queryKey: ['health', 'gpu'],
    queryFn: () => healthClient.getGpuStatus(),
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  const { data: modelsData, isLoading: isLoadingModels, isError: isErrorModels } = useQuery({
    queryKey: ['health', 'models'],
    queryFn: () => healthClient.getModelsStatus(),
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  if (isErrorGpu || isErrorModels) {
    console.error("Failed to fetch health status from backend.");
  }

  const renderGpuStatus = () => {
    if (isLoadingGpu) {
      return (
        <div className="flex items-center gap-2">
          <Loader2 className="w-3 h-3 animate-spin text-muted-foreground" />
          <span className="text-muted-foreground">Checking GPU...</span>
        </div>
      );
    }
    if (isErrorGpu || !gpuData) {
      return 'GPU: Unavailable';
    }
    return gpuData.cuda_available ? 'CUDA: Available' : 'CPU Only';
  };

  const renderModelName = () => {
    if (isLoadingModels) {
      return (
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="w-4 h-4 animate-spin" />
          Loading model...
        </div>
      );
    }
    if (isErrorModels || !modelsData) {
      return 'Unavailable';
    }
    if (modelsData.rife === 'loaded') {
      return 'RIFE (Loaded)';
    }
    return 'Unknown Model';
  };

  return (
    <Card>
      <CardHeader className="pb-3 border-b">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Settings2 className="w-5 h-5" />
            Inference Configuration
          </CardTitle>
          <div className="flex gap-2">
            <Badge variant="outline" className="flex gap-1 items-center bg-muted/30">
              <ShieldCheck className="w-3 h-3 text-emerald-500" />
              {config.mode}
            </Badge>
            <Badge variant="outline" className="flex gap-1 items-center bg-muted/30">
              <Cpu className="w-3 h-3 text-blue-500" />
              {renderGpuStatus()}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6 flex flex-col gap-6">
        <div className="bg-muted/50 border border-muted text-muted-foreground text-sm p-3 rounded-md flex items-start gap-3">
          <Info className="w-4 h-4 mt-0.5 shrink-0 text-blue-500" />
          <p>
            <strong>Note:</strong> Inference uses CPU by default and can take 2-5 minutes per frame. If GPU with CUDA is available, inference is much faster (1-2 seconds).
          </p>
        </div>
      
        <div className="flex flex-col md:flex-row gap-8 items-start md:items-center justify-between">
          <div className="flex flex-col gap-2 flex-1">
            <span className="text-sm font-semibold">Interpolation Ratio</span>
            <span className="text-xs text-muted-foreground">Select the temporal midpoint to generate.</span>
            <div className="flex gap-2 mt-2">
              {[0.25, 0.50, 0.75].map((ratio) => (
                <Button
                  key={ratio}
                  variant={config.timeRatio === ratio ? 'default' : 'outline'}
                  size="sm"
                  disabled={disabled}
                  onClick={() => onConfigChange({ timeRatio: ratio as never })}
                  className="w-16"
                >
                  {ratio.toFixed(2)}
                </Button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-2 flex-1 border-l pl-8">
            <span className="text-sm font-semibold">Active Model</span>
            <span className="text-xs text-muted-foreground">Selected AI model for temporal generation.</span>
            <div className="mt-2 text-sm font-mono bg-muted py-1.5 px-3 rounded inline-block w-fit min-h-[32px] min-w-[120px] flex items-center justify-center">
              {renderModelName()}
            </div>
          </div>
        </div>
        
        <div className="flex flex-col gap-2 border-t pt-6 mt-2">
          <span className="text-sm font-semibold">Observation Variable</span>
          <span className="text-xs text-muted-foreground">Select the physical variable to interpolate.</span>
          <div className="mt-2 max-w-[250px]">
            <Select 
              disabled={disabled}
              value={config.variable || availableVariables[0]} 
              onValueChange={(val) => onConfigChange({ variable: val })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select variable..." />
              </SelectTrigger>
              <SelectContent>
                {availableVariables.map((v) => (
                  <SelectItem key={v} value={v}>{v}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
