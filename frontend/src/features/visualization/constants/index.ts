import { ColorMap } from '../types';

export const COLOR_MAPS: Record<ColorMap, unknown> = {
  Thermal: [
    [0.0, 'rgb(0,0,0)'],
    [0.2, 'rgb(0,0,255)'],
    [0.4, 'rgb(0,255,255)'],
    [0.6, 'rgb(255,255,0)'],
    [0.8, 'rgb(255,165,0)'],
    [1.0, 'rgb(255,0,0)'],
  ],
  Inferno: 'Inferno',
  Plasma: 'Plasma',
  Turbo: 'Turbo',
  Grayscale: 'Greys',
};

export const VISUALIZATION_DEFAULTS = {
  initialColorMap: 'Thermal' as ColorMap,
  initialFrame: 'T0' as const,
};
