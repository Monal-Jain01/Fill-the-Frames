import React from 'react';
import { ComparisonMode } from '../types';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Maximize, Minimize, RefreshCcw } from 'lucide-react';

interface ComparisonToolbarProps {
  mode: ComparisonMode;
  onModeChange: (mode: ComparisonMode) => void;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  onResetView: () => void;
}

export function ComparisonToolbar({
  mode,
  onModeChange,
  isFullscreen,
  onToggleFullscreen,
  onResetView,
}: ComparisonToolbarProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 bg-muted/20 p-2 rounded-lg border">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-muted-foreground mr-2">Mode:</span>
        <Select value={mode} onValueChange={(val) => onModeChange(val as ComparisonMode)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select Mode" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="side-by-side">Side-by-Side</SelectItem>
            <SelectItem value="three-frame">Three Frame View</SelectItem>
            <SelectItem value="split-view">Split View</SelectItem>
            <SelectItem value="difference-map">Difference Map</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={onResetView} title="Reset Sync View">
          <RefreshCcw className="w-4 h-4 mr-2" />
          Reset Pan/Zoom
        </Button>
        <Button variant="outline" size="sm" onClick={onToggleFullscreen} title="Toggle Fullscreen">
          {isFullscreen ? <Minimize className="w-4 h-4 mr-2" /> : <Maximize className="w-4 h-4 mr-2" />}
          {isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
        </Button>
      </div>
    </div>
  );
}
