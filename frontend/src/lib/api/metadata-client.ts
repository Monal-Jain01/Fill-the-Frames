import { ApiResponse } from "@/types/api";
import { MetadataResponse } from "@/features/metadata/types";
import { BASE_URL } from "./base-client";

export const metadataClient = {
  getMetadata: async (fileId: string): Promise<ApiResponse<MetadataResponse>> => {
    const response = await fetch(`${BASE_URL}/metadata/${fileId}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch metadata with status ${response.status}`);
    }

    return response.json();
  },
};
