import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  deleteCollectible,
  getCollectibleById,
  updateCollectible,
} from "@/api/collectiblesApi";

import CollectibleDetails from "@/components/viewer/CollectibleDetails";
import DeleteCollectibleModal from "@/components/viewer/DeleteCollectibleModal";
import EditCollectibleModal from "@/components/viewer/EditCollectibleModal";

import type { Collectible } from "@/types/collectible";
import { notifyAchievementsUpdated } from "@/utils/achievementEvents";

import "./ViewerPage.css";

export default function ViewerPage() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [collectible, setCollectible] = useState<Collectible | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState("");

  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    const collectibleId = Number(id);

    if (!id || Number.isNaN(collectibleId)) {
      setError("Invalid collectible ID.");
      setIsLoading(false);
      return;
    }

    void loadCollectible(collectibleId);
  }, [id]);

  async function loadCollectible(collectibleId: number): Promise<void> {
    try {
      setIsLoading(true);
      setError("");

      const data = await getCollectibleById(collectibleId);
      setCollectible(data);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Failed to load collectible.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  function openEditModal(): void {
    if (!collectible) {
      return;
    }

    setTitle(collectible.title);
    setCategory(collectible.category);
    setDescription(collectible.description);
    setError("");
    setShowEditModal(true);
  }

  function closeEditModal(): void {
    if (!isUpdating) {
      setShowEditModal(false);
    }
  }

  function closeDeleteModal(): void {
    if (!isDeleting) {
      setShowDeleteModal(false);
    }
  }

  async function handleUpdate(): Promise<void> {
    if (!collectible) {
      return;
    }

    const normalizedTitle = title.trim();
    const normalizedCategory = category.trim();
    const normalizedDescription = description.trim();

    if (!normalizedTitle) {
      setError("Title is required.");
      return;
    }

    if (!normalizedCategory) {
      setError("Category is required.");
      return;
    }

    try {
      setIsUpdating(true);
      setError("");

      await updateCollectible(collectible.id, {
        title: normalizedTitle,
        category: normalizedCategory,
        description: normalizedDescription,
      });

      setCollectible({
        ...collectible,
        title: normalizedTitle,
        category: normalizedCategory,
        description: normalizedDescription,
        updatedAt: new Date().toISOString(),
      });

      notifyAchievementsUpdated();
      setShowEditModal(false);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Failed to update collectible.",
      );
    } finally {
      setIsUpdating(false);
    }
  }

  async function handleDelete(): Promise<void> {
    if (!collectible) {
      return;
    }

    try {
      setIsDeleting(true);
      setError("");

      await deleteCollectible(collectible.id);
      notifyAchievementsUpdated();

      navigate("/", { replace: true });
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Failed to delete collectible.",
      );
      setShowDeleteModal(false);
    } finally {
      setIsDeleting(false);
    }
  }

  if (isLoading) {
    return (
      <main className="viewer-page viewer-page--centered">
        <div className="viewer-page__loading-card">
          <span className="viewer-page__spinner" aria-hidden="true" />
          <p className="viewer-page__loading-text">
            Opening your collectible
          </p>
        </div>
      </main>
    );
  }

  if (error && !collectible) {
    return (
      <main className="viewer-page viewer-page--centered">
        <section className="viewer-page__state-card">
          <div className="viewer-page__state-icon">
            <ErrorIcon />
          </div>

          <h1 className="viewer-page__state-title">
            We could not open this collectible
          </h1>

          <p className="viewer-page__state-description">
            The collectible may have been removed, or the link may no longer be
            valid.
          </p>

          <div className="viewer-page__error-alert" role="alert">
            <span className="viewer-page__error-alert-icon">
              <ErrorSmallIcon />
            </span>
            <span>{error}</span>
          </div>

          <button
            type="button"
            className="viewer-page__primary-button"
            onClick={() => navigate("/")}
          >
            <ArrowLeftIcon />
            Back to collection
          </button>
        </section>
      </main>
    );
  }

  if (!collectible) {
    return null;
  }

  return (
    <main className="viewer-page">
      <header className="viewer-page__header">
        <div className="viewer-page__header-inner">
          <button
            type="button"
            className="viewer-page__back-button"
            onClick={() => navigate(-1)}
          >
            <ArrowLeftIcon />
            <span>Back</span>
          </button>

          <button
            type="button"
            className="viewer-page__brand"
            onClick={() => navigate("/")}
            aria-label="Go to MiniVault home"
          >
            <span className="viewer-page__brand-mark">
              <LogoIcon />
            </span>
            <strong className="viewer-page__brand-name">MiniVault</strong>
          </button>

          <span className="viewer-page__header-spacer" aria-hidden="true" />
        </div>
      </header>

      <div className="viewer-page__content">
        {error && (
          <div className="viewer-page__floating-alert" role="alert">
            <span className="viewer-page__floating-alert-icon">
              <ErrorSmallIcon />
            </span>

            <span className="viewer-page__floating-alert-text">{error}</span>

            <button
              type="button"
              className="viewer-page__alert-close-button"
              aria-label="Dismiss error"
              onClick={() => setError("")}
            >
              <CloseIcon />
            </button>
          </div>
        )}

        <section className="viewer-page__details-shell">
          <div className="viewer-page__details-content">
            <CollectibleDetails
              collectible={collectible}
              onEdit={openEditModal}
              onDelete={() => setShowDeleteModal(true)}
            />
          </div>
        </section>
      </div>

      <EditCollectibleModal
        show={showEditModal}
        isUpdating={isUpdating}
        title={title}
        category={category}
        description={description}
        onClose={closeEditModal}
        onSave={() => void handleUpdate()}
        onTitleChange={setTitle}
        onCategoryChange={setCategory}
        onDescriptionChange={setDescription}
      />

      <DeleteCollectibleModal
        show={showDeleteModal}
        isDeleting={isDeleting}
        collectibleTitle={collectible.title}
        onClose={closeDeleteModal}
        onDelete={() => void handleDelete()}
      />
    </main>
  );
}

function ArrowLeftIcon() {
  return (
    <svg
      className="viewer-page__icon"
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M19 12H5M11 18L5 12L11 6"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function LogoIcon() {
  return (
    <svg
      className="viewer-page__icon"
      width="36"
      height="36"
      viewBox="0 0 36 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path d="M18 5.5L28 11L18 16.5L8 11L18 5.5Z" fill="currentColor" />
      <path
        d="M7 12.8L16.8 18.2V30.3L12.9 28.1V20.5L9.8 18.8V26.4L7 24.8V12.8Z"
        fill="currentColor"
      />
      <path
        d="M29 12.8L19.2 18.2V30.3L23.1 28.1V20.5L26.2 18.8V26.4L29 24.8V12.8Z"
        fill="currentColor"
      />
    </svg>
  );
}

function ErrorIcon() {
  return (
    <svg
      className="viewer-page__icon"
      width="32"
      height="32"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M12 8V12.5M12 16H12.01"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M10.26 4.51L3.32 16.5C2.55 17.83 3.51 19.5 5.05 19.5H18.95C20.49 19.5 21.45 17.83 20.68 16.5L13.74 4.51C12.97 3.18 11.03 3.18 10.26 4.51Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ErrorSmallIcon() {
  return (
    <svg
      className="viewer-page__icon"
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.7" />
      <path
        d="M12 8.5V12.5M12 15.5H12.01"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      className="viewer-page__icon"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M7 7L17 17M17 7L7 17"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}
