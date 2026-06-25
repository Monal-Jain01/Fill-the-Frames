import { api } from "./base-client";
import { MetricsResponse } from "./validation-client";

export interface MetricsCompareRequest {
  generated_file_id: string;
  truth_file_id: string;
  variable?: string;
}

export const metricsClient = {
  compare: (request: MetricsCompareRequest): Promise<MetricsResponse> =>
    api.get("/metrics/compare", { params: request as any }),
};
