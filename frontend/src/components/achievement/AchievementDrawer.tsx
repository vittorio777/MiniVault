import { useEffect, useState } from "react";
import { Button, Offcanvas, Spinner } from "react-bootstrap";

import { getAchievementsByUserId } from "@/api/achievementsApi";
import type { Achievement } from "@/types/achievement";

import AchievementItem from "./AchievementItem";

interface AchievementDrawerProps {
  userId: number | null;
}

export default function AchievementDrawer({ userId }: AchievementDrawerProps) {
  const [show, setShow] = useState(false);

  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!show || userId === null) {
      return;
    }

    loadAchievements();
  }, [show, userId]);

  async function loadAchievements() {
    if (userId === null) {
      return;
    }

    try {
      setLoading(true);

      const data = await getAchievementsByUserId(userId);

      setAchievements(data);
    } catch (error) {
      console.error(error);
      alert("Failed to load achievements.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Button
        style={{
          position: "fixed",
          top: 20,
          left: 20,
          zIndex: 1000,
        }}
        onClick={() => setShow(true)}
      >
        Achievements
      </Button>

      <Offcanvas show={show} onHide={() => setShow(false)} placement="start">
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>Achievements</Offcanvas.Title>
        </Offcanvas.Header>

        <Offcanvas.Body>
          {userId === null && <p>Please login first.</p>}

          {userId !== null && loading && (
            <div
              style={{
                textAlign: "center",
                marginTop: "40px",
              }}
            >
              <Spinner />
            </div>
          )}

          {userId !== null &&
            !loading &&
            achievements.map((achievement) => (
              <AchievementItem
                key={achievement.achievementId}
                achievement={achievement}
              />
            ))}

          {userId !== null && !loading && achievements.length === 0 && (
            <p>No achievements.</p>
          )}
        </Offcanvas.Body>
      </Offcanvas>
    </>
  );
}
