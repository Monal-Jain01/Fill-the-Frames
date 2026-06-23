import { MockImageData } from '../types';

// Generate synthetic 2D thermal data resembling a storm system
const generateMockHeatmap = (width: number, height: number) => {
  const data: number[][] = [];
  let min = Infinity;
  let max = -Infinity;
  let sum = 0;

  for (let y = 0; y < height; y++) {
    const row: number[] = [];
    for (let x = 0; x < width; x++) {
      // Create a blob-like shape in the center
      const cx = width / 2;
      const cy = height / 2;
      const dist = Math.sqrt(Math.pow(x - cx, 2) + Math.pow(y - cy, 2));
      
      // Base temperature (background)
      let temp = 280; 
      
      // Storm core (colder tops)
      if (dist < 40) {
        temp = 200 + (dist * 1.5) + (Math.random() * 5);
      } 
      // Storm edges
      else if (dist < 80) {
        temp = 260 - ((80 - dist) * 0.5) + (Math.random() * 8);
      }
      // Add general noise
      else {
        temp += (Math.random() * 10 - 5);
      }

      row.push(temp);
      if (temp < min) min = temp;
      if (temp > max) max = temp;
      sum += temp;
    }
    data.push(row);
  }

  // Calculate mock histogram
  const numBins = 20;
  const binWidth = (max - min) / numBins;
  const histogram = Array.from({ length: numBins }, (_, i) => ({
    binStart: min + i * binWidth,
    binEnd: min + (i + 1) * binWidth,
    count: 0
  }));

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const val = data[y][x];
      const binIdx = Math.min(Math.floor((val - min) / binWidth), numBins - 1);
      histogram[binIdx].count++;
    }
  }

  return {
    z: data,
    min: Number(min.toFixed(2)),
    max: Number(max.toFixed(2)),
    mean: Number((sum / (width * height)).toFixed(2)),
    histogram
  };
};

const mockDataGen = generateMockHeatmap(200, 200);

export const mockFrameData: MockImageData = {
  ...mockDataGen,
  info: {
    satellite: 'INSAT-3DR',
    timestamp: '2023-05-14T08:00:00Z',
    resolution: '4 km',
    dimensions: [200, 200],
    band: 'TIR1 (10.8 µm)',
    frameType: 'T0'
  }
};
