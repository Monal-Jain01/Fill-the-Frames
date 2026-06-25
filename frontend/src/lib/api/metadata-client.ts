import { ApiResponse } from "@/types/api";
import { MetadataResponse } from "@/features/metadata/types";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://sid385-fill-the-frames.hf.space/api/v1";

export const metadataClient = {
  getMetadata: async (fileId: string): Promise<ApiResponse<MetadataResponse>> => {
    const response = await fetch(`${BASE_URL}/metadata/${fileId}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch metadata with status ${response.status}`);
    }

    return response.json();
  },
};
