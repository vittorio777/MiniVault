import { apiRequest } from "@/api/apiClient";
import type { Collectible } from "@/types/collectible";

export interface CreateCollectibleRequest {
  title: string;
  category: string;
  description: string;
  originalImageUrl: string;
  generatedImageUrl: string;
}

export interface UpdateCollectibleRequest {
  title: string;
  category: string;
  description: string;
}

export function getCollectibles(): Promise<Collectible[]> {
  return apiRequest<Collectible[]>("/api/collectibles");
}

export function getCollectiblesByCategory(
  category: string,
): Promise<Collectible[]> {
  return apiRequest<Collectible[]>(
    `/api/collectibles/category/${encodeURIComponent(category)}`,
  );
}

export function getCollectibleById(id: number): Promise<Collectible> {
  return apiRequest<Collectible>(`/api/collectibles/${id}`);
}

export function createCollectible(
  request: CreateCollectibleRequest,
): Promise<Collectible> {
  return apiRequest<Collectible>("/api/collectibles", {
    method: "POST",
    body: JSON.stringify(request),
  });
}

export function updateCollectible(
  id: number,
  request: UpdateCollectibleRequest,
): Promise<void> {
  return apiRequest<void>(`/api/collectibles/${id}`, {
    method: "PUT",
    body: JSON.stringify(request),
  });
}

export function deleteCollectible(id: number): Promise<void> {
  return apiRequest<void>(`/api/collectibles/${id}`, {
    method: "DELETE",
  });
}
