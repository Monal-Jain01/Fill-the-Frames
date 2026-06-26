import React from 'react';
import { InterpolationConfig } from '../types';
import { MOCK_GPU_STATUS } from '../constants';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Cpu, Settings2, ShieldCheck } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface InterpolationConfigPanelProps {
  config: InterpolationConfig;
  onConfigChange: (config: Partial<InterpolationConfig>) => void;
  disabled?: boolean;
  availableVariables?: string[];
}

export function InterpolationConfigPanel({ config, onConfigChange, disabled, availableVariables = ["C13", "TIR1"] }: InterpolationConfigPanelProps) {
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
              {MOCK_GPU_STATUS}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6 flex flex-col gap-6">
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
            <div className="mt-2 text-sm font-mono bg-muted py-1.5 px-3 rounded inline-block w-fit">
              {config.model}
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
