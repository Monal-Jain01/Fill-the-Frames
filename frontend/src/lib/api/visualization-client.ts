import { ApiResponse } from "@/types/api";
import { FrameDataResponse, MapBoundsResponse } from "@/features/visualization/types";
import { BASE_URL } from "./base-client";

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

  getBounds: async (fileId: string, variable: string = "C13"): Promise<ApiResponse<MapBoundsResponse>> => {
    const response = await fetch(`${BASE_URL}/visualization/${fileId}/bounds?variable=${encodeURIComponent(variable)}`);
    if (!response.ok) {
      throw new Error(`Failed to get bounds with status ${response.status}`);
    }
    return response.json();
  },

  getLayerUrl: (fileId: string, variable: string, _timeIndex: number = 0): string => {
    return `${BASE_URL}/visualization/${fileId}/layer?variable=${encodeURIComponent(variable)}`;
  },

  getErrorMapLayerUrl: (fileId1: string, fileId2: string, variable: string, timestamp: number = 0): string => {
    return `${BASE_URL}/visualization/error-map/layer?actual_file_id=${fileId1}&ai_file_id=${fileId2}&variable=${encodeURIComponent(variable)}&timestamp=${timestamp}`;
  }
};