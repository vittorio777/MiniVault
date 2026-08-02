import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { getCollectibles } from "@/api/collectiblesApi";
import {
  getStoredToken,
  getStoredUser,
  logout,
  type UserResponse,
} from "@/api/authApi";

import AchievementDrawer from "@/components/achievement/AchievementDrawer";
import CategoryMenu from "@/components/CategoryMenu";
import CollectionGrid from "@/components/collection/CollectionGrid";
import UploadButton from "@/components/UploadButton";
import LoginModal from "@/components/user/LoginModal";
import RegisterModal from "@/components/user/RegisterModal";
import UserButton from "@/components/user/UserButton";

import type { Collectible } from "@/types/collectible";

import "./HomePage.css";

// Restore the authenticated user only when both the stored
// user details and JWT are available.
function getInitialUser(): UserResponse | null {
  const token = getStoredToken();
  const user = getStoredUser();

  if (!token || !user) {
    return null;
  }

  return user;
}

export default function HomePage() {
  const navigate = useNavigate();

  const [user, setUser] = useState<UserResponse | null>(getInitialUser);
  const [collectibles, setCollectibles] = useState<Collectible[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("all");

  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Reload the collection whenever the authenticated user changes.
  // Clear user-specific state immediately after logout.
  useEffect(() => {
    if (!user) {
      setCollectibles([]);
      setSelectedCategory("all");
      return;
    }

    void loadCollectibles();
  }, [user]);

  async function loadCollectibles(): Promise<void> {
    try {
      setIsLoading(true);
      setError("");

      const data = await getCollectibles();

      setCollectibles(data);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Failed to load collectibles.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  // Update the page state after either registration or login succeeds.
  function handleAuthenticationSuccess(authenticatedUser: UserResponse): void {
    setUser(authenticatedUser);
    setSelectedCategory("all");
    setError("");

    setShowLoginModal(false);
    setShowRegisterModal(false);
  }

  function handleLogout(): void {
    // Remove the persisted token and user details before
    // clearing authenticated page state.
    logout();

    setUser(null);
    setCollectibles([]);
    setSelectedCategory("all");
    setError("");
  }

  function handleUploadSuccess(collectible: Collectible): void {
    // Insert the new collectible immediately without reloading
    // the complete collection from the API.
    setCollectibles((currentCollectibles) => [
      collectible,
      ...currentCollectibles.filter((item) => item.id !== collectible.id),
    ]);

    setSelectedCategory("all");
    setError("");
  }

  function handleCollectibleClick(collectible: Collectible): void {
    navigate(`/collectibles/${collectible.id}`);
  }

  // Derive a unique, alphabetically sorted category list
  // from the currently loaded collection.
  const categories = useMemo(
    () =>
      Array.from(
        new Set(
          collectibles
            .map((collectible) => collectible.category.trim())
            .filter(Boolean),
        ),
      ).sort((first, second) => first.localeCompare(second)),
    [collectibles],
  );

  // Recalculate the visible collection only when the collection
  // or selected category changes.
  const filteredCollectibles = useMemo(() => {
    if (selectedCategory === "all") {
      return collectibles;
    }

    return collectibles.filter(
      (collectible) => collectible.category === selectedCategory,
    );
  }, [collectibles, selectedCategory]);

  return (
    <main className="home-page">
      <header className="home-page__header">
        <div className="home-page__header-inner">
          <button
            type="button"
            aria-label="Show all collectibles"
            onClick={() => setSelectedCategory("all")}
            className="home-page__brand"
          >
            <span className="home-page__logo" aria-hidden="true">
              <svg
                width="32"
                height="32"
                viewBox="0 0 36 36"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M18 5.5L28 11L18 16.5L8 11L18 5.5Z"
                  fill="currentColor"
                />

                <path
                  d="M7 12.8L16.8 18.2V30.3L12.9 28.1V20.5L9.8 18.8V26.4L7 24.8V12.8Z"
                  fill="currentColor"
                />

                <path
                  d="M29 12.8L19.2 18.2V30.3L23.1 28.1V20.5L26.2 18.8V26.4L29 24.8V12.8Z"
                  fill="currentColor"
                />
              </svg>
            </span>

            <span className="home-page__brand-name">MiniVault</span>
          </button>

          <div className="home-page__header-actions">
            {user && <AchievementDrawer />}

            <UserButton
              isLoggedIn={user !== null}
              nickname={user?.nickname ?? ""}
              onLoginClick={() => setShowLoginModal(true)}
              onLogoutClick={handleLogout}
            />
          </div>
        </div>
      </header>

      <LoginModal
        show={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onLoginSuccess={handleAuthenticationSuccess}
      />

      <RegisterModal
        show={showRegisterModal}
        onClose={() => setShowRegisterModal(false)}
        onRegisterSuccess={handleAuthenticationSuccess}
      />

      {!user ? (
        <section className="home-page__guest-section">
          <div className="home-page__guest-content">
            <h1 className="home-page__guest-title">
              Turn anything into a miniature.
            </h1>

            <p className="home-page__guest-description">
              Create, organize, and revisit your personal collection in one
              place.
            </p>

            <button
              type="button"
              className="home-page__secondary-button"
              onClick={() => setShowRegisterModal(true)}
            >
              Create an account
            </button>
          </div>
        </section>
      ) : (
        <section className="home-page__collection-section">
          <aside className="home-page__sidebar">
            <CategoryMenu
              categories={categories}
              selectedCategory={selectedCategory}
              onCategoryChange={setSelectedCategory}
            />
          </aside>

          <div className="home-page__collection-content">
            <header className="home-page__collection-header">
              <div>
                <h1 className="home-page__collection-title">My Collection</h1>

                <p className="home-page__collection-summary">
                  <strong>{collectibles.length}</strong>{" "}
                  {collectibles.length === 1 ? "item" : "items"}
                </p>
              </div>

              <UploadButton onUploadSuccess={handleUploadSuccess} />
            </header>

            <div
              className="home-page__gallery"
              aria-live="polite"
              aria-busy={isLoading}
            >
              {isLoading && (
                <div className="home-page__status-box">
                  <span className="home-page__spinner" aria-hidden="true" />

                  <p className="home-page__status-text">Opening your vault</p>
                </div>
              )}

              {!isLoading && error && (
                <div className="home-page__error-box" role="alert">
                  <div>
                    <strong className="home-page__error-title">
                      Unable to open your vault
                    </strong>

                    <p className="home-page__error-message">{error}</p>
                  </div>

                  <button
                    type="button"
                    onClick={() => void loadCollectibles()}
                    className="home-page__retry-button"
                  >
                    Try again
                  </button>
                </div>
              )}

              {!isLoading && !error && (
                <CollectionGrid
                  collectibles={filteredCollectibles}
                  onCollectibleClick={handleCollectibleClick}
                />
              )}
            </div>

            {!isLoading && !error && filteredCollectibles.length > 0 && (
              <footer className="home-page__footer">MiniVault © 2026</footer>
            )}
          </div>
        </section>
      )}
    </main>
  );
}
