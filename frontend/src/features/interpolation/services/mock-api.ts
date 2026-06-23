import { InterpolationConfig, MockFrame } from '../types';
import { generateMockT05 } from '../mock/data';

/**
 * Simulates calling a backend inference API.
 * In the future, this will be replaced by actual fetch/axios calls to FastAPI.
 */
export const MockInterpolationService = {
  async generateFrame(t0: string, t1: string, config: InterpolationConfig, onProgress: (p: number) => void): Promise<MockFrame> {
    onProgress(10);
    
    // Simulate Preparing
    await new Promise(res => setTimeout(res, 1000));
    onProgress(30);

    // Simulate Processing
    for (let i = 30; i <= 90; i += 20) {
      await new Promise(res => setTimeout(res, 500));
      onProgress(i);
    }

    // Simulate finalizing
    await new Promise(res => setTimeout(res, 800));
    onProgress(100);

    return generateMockT05(config.timeRatio);
  }
};
