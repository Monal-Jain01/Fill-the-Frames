import { ApiResponse } from "@/types/api";
import { FrameDataResponse } from "@/features/visualization/types";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://sid385-fill-the-frames.hf.space/api/v1";

export const visualizationClient = {
  getAvailableVariables: async (fileId: string): Promise<ApiResponse<string[]>> => {
    const response = await fetch(`${BASE_URL}/visualization/${fileId}/variables`);

    if (!response.ok) {
      throw new Error(`Failed to get variables with status ${response.status}`);
    }

    return response.json();
  },

  getFrame: async (fileId: string, variable: string, timeIndex: number = 0): Promise<ApiResponse<FrameDataResponse>> => {
    const response = await fetch(
      `${BASE_URL}/visualization/${fileId}/frame?variable=${encodeURIComponent(variable)}&time_index=${timeIndex}`
    );

    if (!response.ok) {
      throw new Error(`Failed to get frame with status ${response.status}`);
    }

    return response.json();
  },

  getBounds: async (fileId: string): Promise<ApiResponse<any>> => {
    const response = await fetch(`${BASE_URL}/visualization/${fileId}/bounds`);
    if (!response.ok) {
      throw new Error(`Failed to get bounds with status ${response.status}`);
    }
    return response.json();
  },

  getLayerUrl: (fileId: string, variable: string, timestamp: number = 0): string => {
    return `/visualization/${fileId}/layer?variable=${variable}&timestamp=${timestamp}`;
  },

  getErrorMapLayerUrl: (fileId1: string, fileId2: string, variable: string, timestamp: number = 0): string => {
    return `/visualization/error-map/layer?actual_file_id=${fileId1}&ai_file_id=${fileId2}&variable=${variable}&timestamp=${timestamp}`;
  }
};