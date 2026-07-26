import { useEffect, useMemo, useState } from "react";
import { Button, Spinner } from "react-bootstrap";

import { getCollectiblesByUserId } from "@/api/collectiblesApi";
import AchievementDrawer from "@/components/achievement/AchievementDrawer";
import CategoryMenu from "@/components/CategoryMenu";
import CollectionGrid from "@/components/collection/CollectionGrid";
import UploadButton from "@/components/UploadButton";
import LoginModal from "@/components/user/LoginModal";
import RegisterModal from "@/components/user/RegisterModal";
import UserButton from "@/components/user/UserButton";
import type { Collectible } from "@/types/collectible";

function getStoredUserId(): number | null {
  const storedUserId = localStorage.getItem("userId");

  if (!storedUserId) {
    return null;
  }

  const parsedUserId = Number(storedUserId);

  if (Number.isNaN(parsedUserId)) {
    return null;
  }

  return parsedUserId;
}

export default function HomePage() {
  const [userId, setUserId] = useState<number | null>(getStoredUserId);

  const [nickname, setNickname] = useState<string>(
    () => localStorage.getItem("nickname") ?? "",
  );

  const [collectibles, setCollectibles] = useState<Collectible[]>([]);

  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const [showLoginModal, setShowLoginModal] = useState<boolean>(false);

  const [showRegisterModal, setShowRegisterModal] = useState<boolean>(false);

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (userId === null) {
      setCollectibles([]);
      setSelectedCategory("all");
      return;
    }

    void loadCollectibles(userId);
  }, [userId]);

  async function loadCollectibles(currentUserId: number): Promise<void> {
    try {
      setIsLoading(true);
      setError("");

      const data = await getCollectiblesByUserId(currentUserId);

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

  function handleAuthenticationSuccess(
    authenticatedUserId: number,
    authenticatedNickname: string,
  ): void {
    setUserId(authenticatedUserId);
    setNickname(authenticatedNickname);
    setSelectedCategory("all");
    setError("");

    localStorage.setItem("userId", authenticatedUserId.toString());

    localStorage.setItem("nickname", authenticatedNickname);

    setShowLoginModal(false);
    setShowRegisterModal(false);
  }

  function handleLogout(): void {
    setUserId(null);
    setNickname("");
    setCollectibles([]);
    setSelectedCategory("all");
    setError("");

    localStorage.removeItem("userId");
    localStorage.removeItem("nickname");
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
    console.log("Selected collectible:", collectible);
  }

  const categories = useMemo<string[]>(
    () =>
      Array.from(
        new Set(
          collectibles
            .map((collectible) => collectible.category)
            .filter((category) => category.trim().length > 0),
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
    <main>
      <UserButton
        isLoggedIn={userId !== null}
        nickname={nickname}
        onLoginClick={() => setShowLoginModal(true)}
        onLogoutClick={handleLogout}
      />

      {userId === null && (
        <Button
          type="button"
          variant="secondary"
          onClick={() => setShowRegisterModal(true)}
        >
          Register
        </Button>
      )}

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

      <AchievementDrawer userId={userId} />

      {userId === null ? (
        <p>Please log in or register to view your collection.</p>
      ) : (
        <>
          <UploadButton onUploadSuccess={handleUploadSuccess} />

          <CategoryMenu
            categories={categories}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
          />

          {isLoading && <Spinner animation="border" />}

          {!isLoading && error && <p>{error}</p>}

          {!isLoading && !error && (
            <CollectionGrid
              collectibles={filteredCollectibles}
              onCollectibleClick={handleCollectibleClick}
            />
          )}
        </>
      )}
    </main>
  );
}
