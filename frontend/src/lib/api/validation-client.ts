import { BASE_URL } from "./base-client";

export interface MetricsCompareRequest {
  generated_file_id: string;
  ground_truth_file_id: string;
  variable?: string;
}

export interface MetricsResponse {
  psnr_db: number;
  ssim: number;
  accuracy_percentage: number;
}

export const validationClient = {
  compareMetrics: async (request: MetricsCompareRequest): Promise<MetricsResponse> => {
    const searchParams = new URLSearchParams();
    searchParams.append("generated_file_id", request.generated_file_id);
    searchParams.append("truth_file_id", request.ground_truth_file_id);
    if (request.variable) searchParams.append("variable", request.variable);

    const response = await fetch(`${BASE_URL}/metrics/compare?${searchParams.toString()}`, {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error(`Failed to compute metrics with status ${response.status}`);
    }

    const json = await response.json();
    return json.data as MetricsResponse; // Because backend returns ApiResponse wrapper
  },
};
