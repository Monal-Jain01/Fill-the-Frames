import { MockFrame } from '../types';

const generateMockFrameData = (width: number, height: number, offset: number): number[][] => {
  const data: number[][] = [];
  let min = Infinity;
  let max = -Infinity;

  for (let y = 0; y < height; y++) {
    const row: number[] = [];
    for (let x = 0; x < width; x++) {
      // Simulate a moving storm blob
      const cx = width / 2 + offset;
      const cy = height / 2 + offset * 0.5;
      const dist = Math.sqrt(Math.pow(x - cx, 2) + Math.pow(y - cy, 2));
      
      let temp = 280; 
      if (dist < 30) {
        temp = 210 + (dist * 1.5) + (Math.random() * 5);
      } else if (dist < 60) {
        temp = 260 - ((60 - dist) * 0.5) + (Math.random() * 8);
      } else {
        temp += (Math.random() * 10 - 5);
      }

      row.push(Number(temp.toFixed(2)));
      if (temp < min) min = temp;
      if (temp > max) max = temp;
    }
    data.push(row);
  }
  return data;
};

export const MOCK_FRAME_T0: MockFrame = {
  id: 'obs-t0-1234',
  timestamp: '2023-05-14T08:00:00Z',
  resolution: '4 km',
  dimensions: [150, 150],
  data: generateMockFrameData(150, 150, -20),
  min: 200,
  max: 300,
};

export const MOCK_FRAME_T1: MockFrame = {
  id: 'obs-t1-5678',
  timestamp: '2023-05-14T08:30:00Z',
  resolution: '4 km',
  dimensions: [150, 150],
  data: generateMockFrameData(150, 150, 20),
  min: 200,
  max: 300,
};

export const generateMockT05 = (ratio: number): MockFrame => {
  // Mock interpolation generated midway
  const offset = -20 + (40 * ratio); // Shift from -20 to +20 based on ratio
  return {
    id: `gen-t05-${Date.now()}`,
    timestamp: '2023-05-14T08:15:00Z', // Assuming 0.50 ratio for simplicity here
    resolution: '4 km',
    dimensions: [150, 150],
    data: generateMockFrameData(150, 150, offset),
    min: 200,
    max: 300,
  };
};
