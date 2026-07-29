import type { Achievement } from "@/types/achievement";

import "./AchievementItem.css";

interface AchievementItemProps {
  achievement: Achievement;
}

function getAchievementIcon(icon: string): string {
  switch (icon.toLowerCase()) {
    case "first-capture":
      return "📸";

    case "collector":
      return "🏆";

    case "food-hunter":
      return "🍔";

    case "vehicle-collector":
      return "🚗";

    case "world-explorer":
      return "🌍";

    default:
      return "⭐";
  }
}

export default function AchievementItem({ achievement }: AchievementItemProps) {
  const percentage =
    achievement.targetValue <= 0
      ? 100
      : Math.min(100, (achievement.progress / achievement.targetValue) * 100);

  return (
    <article
      className={`achievement-item ${
        achievement.isUnlocked ? "achievement-item--unlocked" : "achievement-item--locked"
      }`}
    >
      <span
        className={`achievement-item__icon ${
          achievement.isUnlocked
            ? "achievement-item__icon--unlocked"
            : "achievement-item__icon--locked"
        }`}
        aria-hidden="true"
      >
        {getAchievementIcon(achievement.icon)}
      </span>

      <div className="achievement-item__content">
        <div className="achievement-item__header">
          <h3 className="achievement-item__title">{achievement.achievementName}</h3>

          <span
            className={`achievement-item__meta ${
              achievement.isUnlocked
                ? "achievement-item__meta--unlocked"
                : "achievement-item__meta--locked"
            }`}
          >
            {achievement.isUnlocked
              ? "Completed"
              : `${achievement.progress}/${achievement.targetValue}`}
          </span>
        </div>

        <p className="achievement-item__description">{achievement.description}</p>

        <div className="achievement-item__progress-track">
          <span
            className={`achievement-item__progress-fill ${
              achievement.isUnlocked
                ? "achievement-item__progress-fill--unlocked"
                : "achievement-item__progress-fill--locked"
            }`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    </article>
  );
}

