import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ExportOptions } from "../types";

interface ExportOptionsPanelProps {
  options: ExportOptions;
  onUpdateOptions: (options: Partial<ExportOptions>) => void;
}

export function ExportOptionsPanel({ options, onUpdateOptions }: ExportOptionsPanelProps) {
  const isVideo = options.format === "MP4" || options.format === "GIF";

  return (
    <Card>
      <CardHeader className="py-3 border-b">
        <CardTitle className="text-sm font-medium">Export Options</CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <label className="text-sm font-medium">Resolution</label>
            <Select 
              value={options.resolution} 
              onValueChange={(val: string) => onUpdateOptions({ resolution: val as ExportOptions['resolution'] })}
              disabled={options.format === "NetCDF"}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select resolution" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="original">Original Data Resolution</SelectItem>
                <SelectItem value="1080p">1080p (FHD)</SelectItem>
                <SelectItem value="720p">720p (HD)</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              {options.format === "NetCDF" 
                ? "Resolution is fixed to the original dataset dimensions for Scientific exports." 
                : "Scales the visualization output to the selected resolution."}
            </p>
          </div>

          <div className="space-y-4">
            <label className="text-sm font-medium">Inclusions</label>
            
            <div className="flex items-center space-x-3">
              <input 
                type="checkbox" 
                id="includeMetadata"
                checked={options.includeMetadata}
                onChange={(e) => onUpdateOptions({ includeMetadata: e.target.checked })}
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <label htmlFor="includeMetadata" className="text-sm leading-none cursor-pointer">
                Include Metadata
              </label>
            </div>

            <div className="flex items-center space-x-3">
              <input 
                type="checkbox" 
                id="includeMetrics"
                checked={options.includeMetrics}
                onChange={(e) => onUpdateOptions({ includeMetrics: e.target.checked })}
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <label htmlFor="includeMetrics" className="text-sm leading-none cursor-pointer">
                Include Metrics (SSIM, FSIM)
              </label>
            </div>

            <div className="flex items-center space-x-3">
              <input 
                type="checkbox" 
                id="includeAnimation"
                checked={options.includeAnimation}
                onChange={(e) => onUpdateOptions({ includeAnimation: e.target.checked })}
                disabled={!isVideo}
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary disabled:opacity-50"
              />
              <label htmlFor="includeAnimation" className={`text-sm leading-none ${!isVideo ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}>
                Generate Full Animation Sequence
              </label>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
