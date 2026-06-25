"use client";

import { useAnimationStore } from "@/store/animation-store";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Layers } from "lucide-react";

export function AnimationVariableSelector() {
  const { selectedVariable, setSelectedVariable, frames } = useAnimationStore();
  const disabled = frames.length === 0;

  return (
    <div className="flex items-center gap-3 bg-slate-900 p-3 rounded-lg border border-slate-800">
      <Layers className="w-4 h-4 text-slate-400" />
      <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Variable</span>
      <Select 
        value={selectedVariable || "TIR1"} 
        onValueChange={setSelectedVariable}
        disabled={disabled}
      >
        <SelectTrigger className="w-[150px] h-9 ml-auto">
          <SelectValue placeholder="Select variable" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="TIR1">TIR-1 (Thermal)</SelectItem>
          <SelectItem value="TIR2">TIR-2 (Thermal)</SelectItem>
          <SelectItem value="MIR">MIR (Mid-Infrared)</SelectItem>
          <SelectItem value="VIS">VIS (Visible)</SelectItem>
          <SelectItem value="WV">WV (Water Vapor)</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
