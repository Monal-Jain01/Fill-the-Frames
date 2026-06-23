import { ComparisonFrame, DifferenceMapData } from '../types';

const generateMockData = (offset: number, noise: number): number[][] => {
  const data: number[][] = [];
  for (let y = 0; y < 100; y++) {
    const row: number[] = [];
    for (let x = 0; x < 100; x++) {
      const cx = 50 + offset;
      const cy = 50 + offset * 0.5;
      const dist = Math.sqrt(Math.pow(x - cx, 2) + Math.pow(y - cy, 2));
      let temp = 280;
      if (dist < 20) {
        temp = 220 + dist + Math.random() * noise;
      } else if (dist < 40) {
        temp = 250 - (40 - dist) * 0.5 + Math.random() * noise;
      } else {
        temp += Math.random() * noise - (noise / 2);
      }
      row.push(Number(temp.toFixed(2)));
    }
    data.push(row);
  }
  return data;
};

const getMinMax = (data: number[][]) => {
  let min = Infinity;
  let max = -Infinity;
  data.forEach(row => row.forEach(val => {
    if (val < min) min = val;
    if (val > max) max = val;
  }));
  return { min, max };
};

const t0Data = generateMockData(-15, 5);
const t1Data = generateMockData(15, 5);
const t05Data = generateMockData(0, 3); // smoother generated

const { min: t0Min, max: t0Max } = getMinMax(t0Data);
const { min: t1Min, max: t1Max } = getMinMax(t1Data);
const { min: t05Min, max: t05Max } = getMinMax(t05Data);

export const MOCK_COMP_T0: ComparisonFrame = {
  id: 'comp-t0',
  type: 'T0',
  timestamp: '2023-05-14T08:00:00Z',
  band: 'Band 13 (TIR)',
  resolution: '2 km',
  dimensions: [100, 100],
  data: t0Data,
  min: t0Min,
  max: t0Max,
};

export const MOCK_COMP_T1: ComparisonFrame = {
  id: 'comp-t1',
  type: 'T1',
  timestamp: '2023-05-14T08:30:00Z',
  band: 'Band 13 (TIR)',
  resolution: '2 km',
  dimensions: [100, 100],
  data: t1Data,
  min: t1Min,
  max: t1Max,
};

export const MOCK_COMP_T05: ComparisonFrame = {
  id: 'comp-t05',
  type: 'T0.5',
  timestamp: '2023-05-14T08:15:00Z',
  band: 'Band 13 (TIR)',
  resolution: '2 km',
  dimensions: [100, 100],
  data: t05Data,
  min: t05Min,
  max: t05Max,
};

// Calculate Difference between T0.5 and average of T0/T1 (as a mock difference)
export const calculateMockDifference = (): DifferenceMapData => {
  const diffData: number[][] = [];
  let meanDiff = 0;
  let maxDiff = -Infinity;
  let minDiff = Infinity;
  let count = 0;

  for (let y = 0; y < 100; y++) {
    const row: number[] = [];
    for (let x = 0; x < 100; x++) {
      const expected = (t0Data[y][x] + t1Data[y][x]) / 2;
      const actual = t05Data[y][x];
      const diff = Number((actual - expected).toFixed(2));
      
      row.push(diff);
      meanDiff += Math.abs(diff);
      if (diff > maxDiff) maxDiff = diff;
      if (diff < minDiff) minDiff = diff;
      count++;
    }
    diffData.push(row);
  }

  meanDiff = meanDiff / count;

  // std dev
  let variance = 0;
  diffData.forEach(row => row.forEach(val => {
    variance += Math.pow(Math.abs(val) - meanDiff, 2);
  }));
  const stdDeviation = Math.sqrt(variance / count);

  return {
    id: 'comp-diff',
    type: 'T0.5',
    timestamp: '2023-05-14T08:15:00Z',
    band: 'Difference Map',
    resolution: '2 km',
    dimensions: [100, 100],
    data: diffData,
    min: minDiff,
    max: maxDiff,
    meanDifference: meanDiff,
    maxDifference: maxDiff,
    minDifference: minDiff,
    stdDeviation: stdDeviation,
    similarityScore: 0.942,
  };
};

export const MOCK_DIFFERENCE_MAP = calculateMockDifference();
