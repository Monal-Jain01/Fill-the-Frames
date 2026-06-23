import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EXPORT_CATEGORIES } from "../constants";
import { ExportOptions } from "../types";

interface ExportFormatSelectorProps {
  options: ExportOptions;
  onUpdateOptions: (options: Partial<ExportOptions>) => void;
}

export function ExportFormatSelector({ options, onUpdateOptions }: ExportFormatSelectorProps) {
  return (
    <Card>
      <CardHeader className="py-3 border-b">
        <CardTitle className="text-sm font-medium">Export Format</CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="grid md:grid-cols-2 gap-6">
          {Object.entries(EXPORT_CATEGORIES).map(([category, formats]) => (
            <div key={category} className="space-y-3">
              <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                {category}
              </h4>
              <div className="flex flex-wrap gap-3">
                {formats.map((format) => (
                  <button
                    key={format}
                    onClick={() => onUpdateOptions({ format })}
                    className={`relative flex items-center justify-center px-6 py-3 rounded-md border-2 transition-all ${
                      options.format === format
                        ? "border-primary bg-primary/10 text-primary font-bold shadow-sm"
                        : "border-muted bg-background hover:bg-muted/50 hover:border-muted-foreground/30 text-foreground"
                    }`}
                  >
                    {format}
                    {options.format === format && (
                      <span className="absolute -top-2 -right-2 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
                        ✓
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
