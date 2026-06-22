import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { AnimationSettings as SettingsType } from "../types";

interface AnimationSettingsProps {
  settings: SettingsType;
  onUpdateSettings: (settings: Partial<SettingsType>) => void;
}

export function AnimationSettingsPanel({ settings, onUpdateSettings }: AnimationSettingsProps) {
  return (
    <Card>
      <CardHeader className="py-3">
        <CardTitle className="text-sm font-medium">Animation Settings</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Target FPS (Frames Per Second)
            </label>
            <Input 
              type="number" 
              min={1} 
              max={60} 
              value={settings.fps}
              onChange={(e) => onUpdateSettings({ fps: parseInt(e.target.value) || 10 })}
              className="max-w-[200px]"
            />
            <p className="text-xs text-muted-foreground">
              Controls the base frame rate. Actual playback speed applies a multiplier to this value.
            </p>
          </div>
          
          <div className="flex items-center space-x-2 pt-6">
            <input 
              type="checkbox" 
              id="loop-mode"
              checked={settings.loopMode}
              onChange={(e) => onUpdateSettings({ loopMode: e.target.checked })}
              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
            />
            <label htmlFor="loop-mode" className="text-sm font-medium leading-none cursor-pointer">
              Continuous Loop
            </label>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
