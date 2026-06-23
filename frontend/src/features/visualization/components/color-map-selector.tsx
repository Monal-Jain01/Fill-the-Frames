import React from 'react';
import { ColorMap } from '../types';
import { COLOR_MAPS } from '../constants';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ColorMapSelectorProps {
  value: ColorMap;
  onChange: (value: ColorMap) => void;
}

export function ColorMapSelector({ value, onChange }: ColorMapSelectorProps) {
  const options = Object.keys(COLOR_MAPS) as ColorMap[];

  return (
    <Select value={value} onValueChange={(val) => onChange(val as ColorMap)}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Select Color Map" />
      </SelectTrigger>
      <SelectContent>
        {options.map((opt) => (
          <SelectItem key={opt} value={opt}>
            {opt}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
