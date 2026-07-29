import { useEffect, useState, type CSSProperties } from "react";
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
      if (requestError instanceof Error) {
        setError(requestError.message);
      } else {
        setError("Failed to load collectible.");
      }
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
    if (isUpdating) {
      return;
    }

    setShowEditModal(false);
  }

  function closeDeleteModal(): void {
    if (isDeleting) {
      return;
    }

    setShowDeleteModal(false);
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
      if (requestError instanceof Error) {
        setError(requestError.message);
      } else {
        setError("Failed to update collectible.");
      }
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

      navigate("/", {
        replace: true,
      });
    } catch (requestError) {
      if (requestError instanceof Error) {
        setError(requestError.message);
      } else {
        setError("Failed to delete collectible.");
      }

      setShowDeleteModal(false);
    } finally {
      setIsDeleting(false);
    }
  }

  if (isLoading) {
    return (
      <main
        style={{
          ...styles.page,
          ...styles.centeredPage,
        }}
      >
        <div style={styles.loadingCard}>
          <span style={styles.spinner} aria-hidden="true" />

          <p style={styles.loadingText}>Opening your collectible</p>
        </div>

        <GlobalAnimations />
      </main>
    );
  }

  if (error && !collectible) {
    return (
      <main
        style={{
          ...styles.page,
          ...styles.centeredPage,
        }}
      >
        <section style={styles.stateCard}>
          <div style={styles.stateIcon}>
            <ErrorIcon />
          </div>

          <h1 style={styles.stateTitle}>We could not open this collectible</h1>

          <p style={styles.stateDescription}>
            The collectible may have been removed, or the link may no longer be
            valid.
          </p>

          <div style={styles.errorAlert} role="alert">
            <span style={styles.errorAlertIcon}>
              <ErrorSmallIcon />
            </span>

            <span>{error}</span>
          </div>

          <button
            type="button"
            style={styles.primaryButton}
            onClick={() => navigate("/")}
          >
            <ArrowLeftIcon />
            Back to collection
          </button>
        </section>

        <GlobalAnimations />
      </main>
    );
  }

  if (!collectible) {
    return null;
  }

  return (
    <main style={styles.page}>
      <header style={styles.header}>
        <div style={styles.headerInner}>
          <button
            type="button"
            style={styles.backButton}
            onClick={() => navigate(-1)}
            onMouseEnter={(event) => {
              event.currentTarget.style.background = "#f1f1ef";
              event.currentTarget.style.transform = "translateX(-2px)";
            }}
            onMouseLeave={(event) => {
              event.currentTarget.style.background = "#ffffff";
              event.currentTarget.style.transform = "translateX(0)";
            }}
          >
            <ArrowLeftIcon />
            <span>Back</span>
          </button>

          <button
            type="button"
            style={styles.brand}
            onClick={() => navigate("/")}
            aria-label="Go to MiniVault home"
          >
            <span style={styles.brandMark}>
              <LogoIcon />
            </span>

            <strong style={styles.brandName}>MiniVault</strong>
          </button>

          <span style={styles.headerSpacer} aria-hidden="true" />
        </div>
      </header>

      <div style={styles.content}>
        {error && (
          <div style={styles.floatingAlert} role="alert">
            <span style={styles.floatingAlertIcon}>
              <ErrorSmallIcon />
            </span>

            <span style={styles.floatingAlertText}>{error}</span>

            <button
              type="button"
              aria-label="Dismiss error"
              style={styles.alertCloseButton}
              onClick={() => setError("")}
            >
              <CloseIcon />
            </button>
          </div>
        )}

        <section style={styles.detailsShell}>
          <div style={styles.detailsContent}>
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

      <GlobalAnimations />
    </main>
  );
}

function GlobalAnimations() {
  return (
    <style>
      {`
        @keyframes viewerSpin {
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes viewerFadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}
    </style>
  );
}

function ArrowLeftIcon() {
  return (
    <svg
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      style={{
        display: "block",
        pointerEvents: "none",
      }}
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
      width="36"
      height="36"
      viewBox="0 0 36 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      style={{
        display: "block",
        pointerEvents: "none",
      }}
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
      width="32"
      height="32"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      style={{
        display: "block",
        pointerEvents: "none",
      }}
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
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      style={{
        display: "block",
        pointerEvents: "none",
      }}
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
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      style={{
        display: "block",
        pointerEvents: "none",
      }}
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

const styles: Record<string, CSSProperties> = {
  page: {
    width: "100%",
    height: "100dvh",
    minHeight: 0,

    position: "relative",

    display: "flex",
    flexDirection: "column",

    overflow: "hidden",

    color: "#2f2f2f",
    background: "#f7f7f5",

    fontFamily:
      '"Inter", "Segoe UI", system-ui, -apple-system, BlinkMacSystemFont, sans-serif',
  },

  centeredPage: {
    padding: "36px 20px",

    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  header: {
    width: "100%",
    height: "76px",
    minHeight: "76px",
    padding: "0 clamp(18px, 4vw, 52px)",

    display: "flex",
    alignItems: "center",

    position: "relative",
    zIndex: 10,

    flexShrink: 0,
  },

  headerInner: {
    width: "min(1200px, 100%)",
    margin: "0 auto",

    display: "grid",
    gridTemplateColumns: "1fr auto 1fr",
    alignItems: "center",
  },

  backButton: {
    justifySelf: "start",

    minHeight: "42px",
    padding: "0 14px",

    display: "inline-flex",
    alignItems: "center",
    gap: "8px",

    border: "1px solid #dddddd",
    borderRadius: "12px",

    color: "#333333",
    background: "#ffffff",

    cursor: "pointer",

    fontFamily: "inherit",
    fontSize: "14px",
    fontWeight: 600,

    transition: "background 0.2s ease, transform 0.2s ease",
  },

  brand: {
    padding: 0,

    display: "inline-flex",
    alignItems: "center",
    gap: "10px",

    border: "none",

    color: "#2f281f",
    background: "transparent",

    cursor: "pointer",
  },

  brandMark: {
    width: "36px",
    height: "36px",

    display: "grid",
    placeItems: "center",

    color: "#9a7138",
  },

  brandName: {
    color: "#2f281f",

    fontFamily: 'Georgia, "Times New Roman", serif',
    fontSize: "22px",
    fontWeight: 700,
    letterSpacing: "-0.6px",
  },

  headerSpacer: {
    justifySelf: "end",
    width: "76px",
  },

  content: {
    width: "min(1180px, 100%)",
    minHeight: 0,
    margin: "0 auto",
    padding: "0 clamp(18px, 4vw, 52px) 24px",

    position: "relative",
    zIndex: 2,

    flex: 1,
    display: "flex",

    overflow: "hidden",

    animation: "viewerFadeIn 400ms ease both",
  },

  detailsShell: {
    width: "100%",
    height: "100%",
    minHeight: 0,
    padding: "12px",

    border: "1px solid #e5e5e5",
    borderRadius: "20px",

    background: "#ffffff",
    boxShadow: "0 10px 30px rgba(0, 0, 0, 0.05)",

    boxSizing: "border-box",
    overflow: "hidden",
  },

  detailsContent: {
    width: "100%",
    height: "100%",
    minHeight: 0,

    overflow: "hidden",
    borderRadius: "14px",
  },

  floatingAlert: {
    maxWidth: "680px",
    margin: "0 auto 16px",
    padding: "12px 14px",

    display: "flex",
    alignItems: "center",
    gap: "10px",

    border: "1px solid rgba(171, 80, 68, 0.15)",
    borderRadius: "12px",

    color: "#8c453d",
    background: "#fff4f1",

    boxShadow: "0 6px 18px rgba(120, 58, 48, 0.06)",
  },

  floatingAlertIcon: {
    flexShrink: 0,

    display: "grid",
    placeItems: "center",
  },

  floatingAlertText: {
    flex: 1,

    fontSize: "13px",
    fontWeight: 500,
  },

  alertCloseButton: {
    width: "30px",
    height: "30px",
    padding: 0,

    display: "grid",
    placeItems: "center",

    border: "none",
    borderRadius: "8px",

    color: "#9c625a",
    background: "transparent",

    cursor: "pointer",
  },

  loadingCard: {
    width: "min(360px, 100%)",
    padding: "38px 30px",

    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "18px",

    border: "1px solid #e5e5e5",
    borderRadius: "20px",

    background: "#ffffff",
    boxShadow: "0 10px 30px rgba(0, 0, 0, 0.05)",

    animation: "viewerFadeIn 400ms ease both",
  },

  spinner: {
    width: "24px",
    height: "24px",
    display: "block",

    border: "2px solid #e4e4e4",
    borderTopColor: "#333333",
    borderRadius: "50%",

    animation: "viewerSpin 800ms linear infinite",
  },

  loadingText: {
    margin: 0,

    color: "#555555",

    fontSize: "14px",
    fontWeight: 500,
  },

  stateCard: {
    width: "min(500px, 100%)",
    padding: "42px clamp(24px, 6vw, 46px)",

    display: "flex",
    flexDirection: "column",
    alignItems: "center",

    border: "1px solid #e5e5e5",
    borderRadius: "20px",

    textAlign: "center",

    background: "#ffffff",
    boxShadow: "0 10px 30px rgba(0, 0, 0, 0.05)",

    animation: "viewerFadeIn 400ms ease both",
  },

  stateIcon: {
    width: "64px",
    height: "64px",
    marginBottom: "20px",

    display: "grid",
    placeItems: "center",

    borderRadius: "18px",

    color: "#a76052",
    background: "#fff0eb",
  },

  stateTitle: {
    maxWidth: "390px",
    margin: 0,

    color: "#252525",

    fontSize: "32px",
    fontWeight: 700,
    lineHeight: 1.15,
    letterSpacing: "-1px",
  },

  stateDescription: {
    maxWidth: "400px",
    margin: "14px 0 0",

    color: "#777777",

    fontSize: "14px",
    lineHeight: 1.6,
  },

  errorAlert: {
    width: "100%",
    marginTop: "22px",
    padding: "12px 14px",

    display: "flex",
    alignItems: "center",
    gap: "9px",

    border: "1px solid rgba(171, 80, 68, 0.14)",
    borderRadius: "12px",

    color: "#8c453d",
    background: "#fff4f1",

    fontSize: "13px",
    fontWeight: 500,
    textAlign: "left",

    boxSizing: "border-box",
  },

  errorAlertIcon: {
    flexShrink: 0,

    display: "grid",
    placeItems: "center",
  },

  primaryButton: {
    minHeight: "46px",
    marginTop: "22px",
    padding: "0 18px",

    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "9px",

    border: "none",
    borderRadius: "12px",

    color: "#ffffff",
    background: "#222222",

    cursor: "pointer",

    fontFamily: "inherit",
    fontSize: "14px",
    fontWeight: 600,
  },
};
