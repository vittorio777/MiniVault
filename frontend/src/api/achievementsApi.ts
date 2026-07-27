import { apiRequest } from "@/api/apiClient";
import type { Achievement } from "@/types/achievement";

export function getAchievements(): Promise<Achievement[]> {
  return apiRequest<Achievement[]>("/api/achievements");
}