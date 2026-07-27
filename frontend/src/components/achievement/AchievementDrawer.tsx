import { useEffect, useState } from "react";
import { Button, Offcanvas, Spinner } from "react-bootstrap";

import { getAchievements } from "@/api/achievementsApi";
import type { Achievement } from "@/types/achievement";

import AchievementItem from "./AchievementItem";

export default function AchievementDrawer() {
  const [show, setShow] = useState(false);

  const [achievements, setAchievements] = useState<Achievement[]>([]);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  useEffect(() => {
    if (!show) {
      return;
    }

    void loadAchievements();
  }, [show]);

  async function loadAchievements(): Promise<void> {
    try {
      setLoading(true);
      setError("");

      const data = await getAchievements();

      setAchievements(data);
    } catch (requestError) {
      if (requestError instanceof Error) {
        setError(requestError.message);
      } else {
        setError("Failed to load achievements.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Button
        type="button"
        variant="outline-primary"
        onClick={() => setShow(true)}
      >
        Achievements
      </Button>

      <Offcanvas show={show} onHide={() => setShow(false)} placement="start">
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>Achievements</Offcanvas.Title>
        </Offcanvas.Header>

        <Offcanvas.Body>
          {loading && (
            <div className="d-flex justify-content-center py-5">
              <Spinner animation="border" />
            </div>
          )}

          {!loading && error && <p className="text-danger">{error}</p>}

          {!loading &&
            !error &&
            achievements.map((achievement) => (
              <AchievementItem
                key={achievement.achievementId}
                achievement={achievement}
              />
            ))}

          {!loading && !error && achievements.length === 0 && (
            <p className="text-secondary">No achievements yet.</p>
          )}
        </Offcanvas.Body>
      </Offcanvas>
    </>
  );
}
