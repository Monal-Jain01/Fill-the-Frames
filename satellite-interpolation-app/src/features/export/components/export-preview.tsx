import { Card } from "@/components/ui/card";
import { FileCode, Image as ImageIcon, Film, Video } from "lucide-react";
import { ExportOptions } from "../types";

interface ExportPreviewProps {
  options: ExportOptions;
  onExport: () => void;
  isExporting: boolean;
}

export function ExportPreview({ options, onExport, isExporting }: ExportPreviewProps) {
  const getIcon = () => {
    switch (options.format) {
      case "NetCDF": return <FileCode className="h-16 w-16 text-blue-500" />;
      case "PNG": return <ImageIcon className="h-16 w-16 text-green-500" />;
      case "GIF": return <Film className="h-16 w-16 text-purple-500" />;
      case "MP4": return <Video className="h-16 w-16 text-rose-500" />;
    }
  };

  const getPreviewText = () => {
    switch (options.format) {
      case "NetCDF": return "Scientific Dataset (.nc)";
      case "PNG": return "High-Resolution Image (.png)";
      case "GIF": return "Animated Sequence (.gif)";
      case "MP4": return "Video Visualization (.mp4)";
    }
  };

  return (
    <Card className="flex flex-col md:flex-row items-center justify-between p-6 bg-muted/20 border-2 border-dashed">
      <div className="flex items-center space-x-6 mb-4 md:mb-0">
        <div className="p-4 bg-background rounded-xl shadow-sm border">
          {getIcon()}
        </div>
        <div>
          <h3 className="text-lg font-semibold">{getPreviewText()}</h3>
          <p className="text-sm text-muted-foreground mt-1">
            {options.resolution} • {options.includeMetadata ? "With Metadata" : "No Metadata"}
            {options.includeMetrics ? " • With Metrics" : ""}
          </p>
        </div>
      </div>
      
      <button
        onClick={onExport}
        disabled={isExporting}
        className="px-8 py-3 bg-primary text-primary-foreground font-semibold rounded-lg shadow hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
      >
        {isExporting ? "Export in Progress..." : `Export ${options.format}`}
      </button>
    </Card>
  );
}
