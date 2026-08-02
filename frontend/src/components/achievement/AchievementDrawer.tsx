import { useEffect, useMemo, useRef, useState } from "react";

import { getAchievements } from "@/api/achievementsApi";
import type { Achievement } from "@/types/achievement";
import { subscribeToAchievementsUpdated } from "@/utils/achievementEvents";

import AchievementItem from "./AchievementItem";

import "./AchievementDrawer.css";

export default function AchievementDrawer() {
  const [show, setShow] = useState(false);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [hasLoaded, setHasLoaded] = useState(false);

  const closeTimerRef = useRef<number | null>(null);

  // Mark cached achievement data as stale whenever another component
  // reports that collectible changes may have affected progress.
  useEffect(() => {
    return subscribeToAchievementsUpdated(() => {
      setHasLoaded(false);

      // Refresh immediately when the drawer is already open.
      if (show) {
        void loadAchievements();
      }
    });
  }, [show]);

  // Clear any pending close timer when the component unmounts.
  useEffect(() => {
    return () => {
      if (closeTimerRef.current !== null) {
        window.clearTimeout(closeTimerRef.current);
      }
    };
  }, []);

  // Recalculate the unlocked total only when achievement data changes.
  const unlockedCount = useMemo(
    () => achievements.filter((achievement) => achievement.isUnlocked).length,
    [achievements],
  );

  const completionPercentage =
    achievements.length === 0
      ? 0
      : Math.round((unlockedCount / achievements.length) * 100);

  async function loadAchievements(): Promise<void> {
    // Prevent duplicate requests while a load is already running.
    if (loading) {
      return;
    }

    try {
      setLoading(true);
      setError("");

      const data = await getAchievements();

      setAchievements(data);
      // Avoid reloading on every hover until the data becomes stale.
      setHasLoaded(true);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Failed to load achievements.",
      );
    } finally {
      setLoading(false);
    }
  }

  function handleMouseEnter(): void {
    // Cancel a scheduled close when the pointer returns
    // to either the trigger or popup.
    if (closeTimerRef.current !== null) {
      window.clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }

    setShow(true);

    // Load achievement data only on the first open
    // or after an achievement update invalidates it.
    if (!hasLoaded) {
      void loadAchievements();
    }
  }

  function handleMouseLeave(): void {
    // Delay closing slightly so the popup does not disappear
    // during small pointer movements between its elements.
    closeTimerRef.current = window.setTimeout(() => {
      setShow(false);
    }, 160);
  }

  return (
    <div
      className="achievement-drawer"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button
        type="button"
        aria-label="View achievements"
        aria-expanded={show}
        className="achievement-drawer__trigger"
      >
        <AchievementIcon />
      </button>

      {show && (
        <section
          className="achievement-drawer__popup"
          aria-label="Achievements"
        >
          <header className="achievement-drawer__header">
            <div>
              <h2 className="achievement-drawer__title">Achievements</h2>

              {!loading && !error && achievements.length > 0 && (
                <p className="achievement-drawer__summary">
                  {unlockedCount} of {achievements.length} unlocked
                </p>
              )}
            </div>

            {!loading && !error && achievements.length > 0 && (
              <span className="achievement-drawer__percentage">
                {completionPercentage}%
              </span>
            )}
          </header>

          {!loading && !error && achievements.length > 0 && (
            <div className="achievement-drawer__progress-track">
              <span
                className="achievement-drawer__progress-fill"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
          )}

          <div className="achievement-drawer__content">
            {loading && (
              <div className="achievement-drawer__state">
                <span className="achievement-drawer__spinner" />
                <span>Loading...</span>
              </div>
            )}

            {!loading && error && (
              <div className="achievement-drawer__error-state">
                <p className="achievement-drawer__error-text">
                  Unable to load achievements.
                </p>

                <button
                  type="button"
                  className="achievement-drawer__retry-button"
                  onClick={() => void loadAchievements()}
                >
                  Try again
                </button>
              </div>
            )}

            {!loading && !error && achievements.length > 0 && (
              <div className="achievement-drawer__list">
                {achievements.map((achievement) => (
                  <AchievementItem
                    key={achievement.achievementId}
                    achievement={achievement}
                  />
                ))}
              </div>
            )}

            {!loading && !error && achievements.length === 0 && (
              <div className="achievement-drawer__empty-state">
                <p className="achievement-drawer__empty-title">
                  No achievements yet
                </p>

                <p className="achievement-drawer__empty-text">
                  Create collectibles to unlock milestones.
                </p>
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
}

function AchievementIcon() {
  return (
    <svg
      width="21"
      height="21"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M8 4H16V7.5C16 10.4 14.2 12.7 12 13.4C9.8 12.7 8 10.4 8 7.5V4Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />

      <path
        d="M8 6H5.5V7.3C5.5 9.1 6.7 10.6 8.4 11M16 6H18.5V7.3C18.5 9.1 17.3 10.6 15.6 11"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />

      <path
        d="M12 13.5V17M9 20H15M10 17H14V20H10V17Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
