import Card from "react-bootstrap/Card";
import ProgressBar from "react-bootstrap/ProgressBar";

import type { Achievement } from "@/types/achievement";

interface AchievementItemProps {
  achievement: Achievement;
}

export default function AchievementItem({ achievement }: AchievementItemProps) {
  const percentage =
    achievement.targetValue === 0
      ? 100
      : Math.min(100, (achievement.progress / achievement.targetValue) * 100);

  return (
    <Card
      className="mb-3"
      style={{
        opacity: achievement.isUnlocked ? 1 : 0.6,
      }}
    >
      <Card.Body>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
          }}
        >
          <img
            src={achievement.icon}
            alt={achievement.achievementName}
            width={64}
            height={64}
          />

          <div style={{ flex: 1 }}>
            <Card.Title>{achievement.achievementName}</Card.Title>

            <Card.Text>{achievement.description}</Card.Text>

            <ProgressBar
              now={percentage}
              label={`${achievement.progress}/${achievement.targetValue}`}
            />

            {achievement.isUnlocked && (
              <small>
                Unlocked at{" "}
                {achievement.unlockedAt
                  ? new Date(achievement.unlockedAt).toLocaleString()
                  : ""}
              </small>
            )}
          </div>
        </div>
      </Card.Body>
    </Card>
  );
}
