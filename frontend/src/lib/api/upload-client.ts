import { ApiResponse } from "@/types/api";
import { BASE_URL } from "./base-client";

export interface UploadResponse {
  fileId: string;
  filename: string;
  status: string;
}

export const uploadClient = {
  uploadFile: async (file: File): Promise<ApiResponse<UploadResponse>> => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(`${BASE_URL}/upload/`, {
      method: "POST",
      // headers: { "Authorization": `Bearer ${process.env.NEXT_PUBLIC_HF_TOKEN}` },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Upload failed with status ${response.status}`);
    }

    return response.json();
  },
};
