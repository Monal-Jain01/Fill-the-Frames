import React from 'react';
import { ColorMapSelector } from './color-map-selector';
import { ColorMap } from '../types';
import { Button } from '@/components/ui/button';
import { Maximize, Minimize, RefreshCcw } from 'lucide-react';

interface VisualizationToolbarProps {
  colorMap: ColorMap;
  onColorMapChange: (val: ColorMap) => void;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  onResetView: () => void;
}

export function VisualizationToolbar({
  colorMap,
  onColorMapChange,
  isFullscreen,
  onToggleFullscreen,
  onResetView,
}: VisualizationToolbarProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 bg-muted/20 p-2 rounded-lg border">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-muted-foreground mr-2">Color Map:</span>
        <ColorMapSelector value={colorMap} onChange={onColorMapChange} />
      </div>

      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={onResetView} title="Reset View">
          <RefreshCcw className="w-4 h-4 mr-2" />
          Reset
        </Button>
        <Button variant="outline" size="sm" onClick={onToggleFullscreen} title="Toggle Fullscreen">
          {isFullscreen ? <Minimize className="w-4 h-4 mr-2" /> : <Maximize className="w-4 h-4 mr-2" />}
          {isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
        </Button>
      </div>
    </div>
  );
}
