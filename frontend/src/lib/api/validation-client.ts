import { ApiResponse } from "@/types/api";
import { FrameDataResponse } from "@/features/visualization/types";
import { DifferenceMapData } from "@/features/comparison/types";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://sid385-fill-the-frames.hf.space/api/v1";

export interface ValidationAlignmentRequest {
  generated_file_id: string;
  ground_truth_file_id: string;
  variable?: string;
}

export interface ValidationAlignmentResponse {
  generated_file_id: string;
  ground_truth_file_id: string;
  aligned_generated: FrameDataResponse;
  aligned_ground_truth: FrameDataResponse;
  difference_map: DifferenceMapData;
  dimensions: number[];
  metadata: Record<string, unknown>;
}

export interface MetricsResponse {
  ssim: number;
  psnr: number;
  mse: number;
  fsim: number | null;
  issm: number | null;
  quality_score: number;
  summary: string;
}

export const validationClient = {
  alignFrames: async (request: ValidationAlignmentRequest): Promise<ApiResponse<ValidationAlignmentResponse>> => {
    const response = await fetch(`${BASE_URL}/validation/align`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`Failed to align frames with status ${response.status}`);
    }

    return response.json();
  },

  compareMetrics: async (request: ValidationAlignmentRequest): Promise<MetricsResponse> => {
    const response = await fetch(`${BASE_URL}/metrics/compare`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`Failed to compute metrics with status ${response.status}`);
    }

    return response.json();
  }
};
