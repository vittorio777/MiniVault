import { useEffect, useMemo, useState } from "react";
import { Alert, Button, Container, Spinner } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

import { getCollectibles } from "@/api/collectiblesApi";
import {
  getStoredUser,
  getStoredToken,
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

  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const [showLoginModal, setShowLoginModal] = useState<boolean>(false);

  const [showRegisterModal, setShowRegisterModal] = useState<boolean>(false);

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [error, setError] = useState<string>("");

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
      if (requestError instanceof Error) {
        setError(requestError.message);
      } else {
        setError("Failed to load collectibles.");
      }
    } finally {
      setIsLoading(false);
    }
  }

  function handleAuthenticationSuccess(authenticatedUser: UserResponse): void {
    setUser(authenticatedUser);
    setSelectedCategory("all");
    setError("");

    setShowLoginModal(false);
    setShowRegisterModal(false);
  }

  function handleLogout(): void {
    logout();

    setUser(null);
    setCollectibles([]);
    setSelectedCategory("all");
    setError("");
  }

  function handleUploadSuccess(collectible: Collectible): void {
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

  const categories = useMemo<string[]>(
    () =>
      Array.from(
        new Set(
          collectibles
            .map((collectible) => collectible.category.trim())
            .filter((category) => category.length > 0),
        ),
      ).sort(),
    [collectibles],
  );

  const filteredCollectibles = useMemo<Collectible[]>(() => {
    if (selectedCategory === "all") {
      return collectibles;
    }

    return collectibles.filter(
      (collectible) => collectible.category === selectedCategory,
    );
  }, [collectibles, selectedCategory]);

  return (
    <main className="min-vh-100 bg-light">
      <header className="border-bottom bg-white">
        <Container className="d-flex align-items-center justify-content-between gap-3 py-3">
          <h1 className="m-0 fs-4">MiniVault</h1>

          <div className="d-flex align-items-center gap-2">
            {user && <AchievementDrawer />}

            {!user && (
              <Button
                type="button"
                variant="outline-secondary"
                onClick={() => setShowRegisterModal(true)}
              >
                Register
              </Button>
            )}

            <UserButton
              isLoggedIn={user !== null}
              nickname={user?.nickname ?? ""}
              onLoginClick={() => setShowLoginModal(true)}
              onLogoutClick={handleLogout}
            />
          </div>
        </Container>
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

      <Container className="py-4">
        {!user ? (
          <div className="py-5 text-center">
            <h2 className="mb-3">Your miniature collection</h2>

            <p className="mb-4 text-secondary">
              Log in or create an account to start building your collection.
            </p>

            <div className="d-flex justify-content-center gap-2">
              <Button
                type="button"
                variant="primary"
                onClick={() => setShowLoginModal(true)}
              >
                Log in
              </Button>

              <Button
                type="button"
                variant="outline-primary"
                onClick={() => setShowRegisterModal(true)}
              >
                Register
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div className="mb-4 d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3">
              <CategoryMenu
                categories={categories}
                selectedCategory={selectedCategory}
                onCategoryChange={setSelectedCategory}
              />

              <UploadButton onUploadSuccess={handleUploadSuccess} />
            </div>

            {isLoading && (
              <div className="d-flex justify-content-center py-5">
                <Spinner animation="border" />
              </div>
            )}

            {!isLoading && error && <Alert variant="danger">{error}</Alert>}

            {!isLoading && !error && (
              <CollectionGrid
                collectibles={filteredCollectibles}
                onCollectibleClick={handleCollectibleClick}
              />
            )}
          </>
        )}
      </Container>
    </main>
  );
}
