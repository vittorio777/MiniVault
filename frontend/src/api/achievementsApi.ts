import { apiRequest } from "@/api/apiClient";
import type { Achievement } from "@/types/achievement";

export function getAchievementsByUserId(
  userId: number,
): Promise<Achievement[]> {
  return apiRequest<Achievement[]>(`/api/achievements/user/${userId}`);
}
