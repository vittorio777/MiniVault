const ACHIEVEMENTS_UPDATED_EVENT = "minivault:achievements-updated";

export function notifyAchievementsUpdated(): void {
  window.dispatchEvent(new CustomEvent(ACHIEVEMENTS_UPDATED_EVENT));
}

export function subscribeToAchievementsUpdated(
  listener: () => void,
): () => void {
  window.addEventListener(ACHIEVEMENTS_UPDATED_EVENT, listener);

  return () => {
    window.removeEventListener(ACHIEVEMENTS_UPDATED_EVENT, listener);
  };
}
