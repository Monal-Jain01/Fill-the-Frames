import { api } from "./base-client";
import { MetricsResponse } from "./validation-client";

export interface MetricsCompareRequest {
  generated_file_id: string;
  truth_file_id: string;
  variable?: string;
}

export const metricsClient = {
  compare: async (request: MetricsCompareRequest): Promise<MetricsResponse> => {
    const res = await api.get<{ data: MetricsResponse }>("/metrics/compare", { params: request as any });
    return (res as any).data ?? res;
  },
};
