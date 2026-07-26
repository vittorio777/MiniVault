export interface Achievement {
  achievementId: number;

  achievementName: string;
  description: string;

  icon: string;

  targetValue: number;
  progress: number;

  isUnlocked: boolean;
  unlockedAt: string | null;
}
