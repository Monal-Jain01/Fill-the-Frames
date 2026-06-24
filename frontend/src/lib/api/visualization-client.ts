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
};