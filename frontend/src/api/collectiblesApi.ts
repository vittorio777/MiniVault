const API_BASE_URL = "http://localhost:5158";
import type { Collectible } from "../types/collectible";

// export async function getCollectibles(): Promise<Collectible[]> {
//     const response = await fetch(`${API_BASE_URL}/api/collectibles`);

//     if (!response.ok) {
//         throw new Error("Failed to fetch collections");
//     }

//     return response.json();;
// }

export async function getCollectiblesByUserId(
  userId: number,
): Promise<Collectible[]> {
  const response = await fetch(
    `${API_BASE_URL}/api/collectibles/user/${userId}`,
  );

  if (!response.ok) {
    throw new Error("Failed to fetch collections");
  }

  return response.json();
}

export async function createCollectible(
  collectible: Omit<Collectible, "id" | "userId" | "createdAt" | "updatedAt">,
): Promise<Collectible> {
  const response = await fetch(`${API_BASE_URL}/api/collectibles`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(collectible),
  });

  if (!response.ok) {
    throw new Error("Failed to create collectible");
  }

  return response.json();
}
