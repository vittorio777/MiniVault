import { apiRequest } from "@/api/apiClient";
import type { Collectible } from "@/types/collectible";

export function captureImage(file: File): Promise<Collectible> {
  const formData = new FormData();

  formData.append("file", file);

  return apiRequest<Collectible>("/api/generation/capture", {
    method: "POST",
    body: formData,
  });
}
