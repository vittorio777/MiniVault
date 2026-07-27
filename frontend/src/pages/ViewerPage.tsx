import { useEffect, useState } from "react";
import { Alert, Button, Container, Spinner } from "react-bootstrap";
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

export default function ViewerPage() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [collectible, setCollectible] = useState<Collectible | null>(null);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const [error, setError] = useState<string>("");

  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);

  const [title, setTitle] = useState<string>("");
  const [category, setCategory] = useState<string>("");
  const [description, setDescription] = useState<string>("");

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
      <main className="min-vh-100 bg-light">
        <Container className="d-flex justify-content-center py-5">
          <Spinner animation="border" />
        </Container>
      </main>
    );
  }

  if (error && !collectible) {
    return (
      <main className="min-vh-100 bg-light">
        <Container className="py-5">
          <Alert variant="danger">{error}</Alert>

          <Button
            type="button"
            variant="outline-secondary"
            onClick={() => navigate("/")}
          >
            Back to home
          </Button>
        </Container>
      </main>
    );
  }

  if (!collectible) {
    return null;
  }

  return (
    <main className="min-vh-100 bg-light">
      <header className="border-bottom bg-white">
        <Container className="d-flex align-items-center justify-content-between py-3">
          <Button
            type="button"
            variant="outline-secondary"
            onClick={() => navigate(-1)}
          >
            ← Back
          </Button>

          <h1 className="m-0 fs-4">MiniVault</h1>

          <div style={{ width: "84px" }} />
        </Container>
      </header>

      <Container className="py-4">
        <div className="mx-auto" style={{ maxWidth: "900px" }}>
          {error && (
            <Alert variant="danger" dismissible onClose={() => setError("")}>
              {error}
            </Alert>
          )}

          <CollectibleDetails
            collectible={collectible}
            onEdit={openEditModal}
            onDelete={() => setShowDeleteModal(true)}
          />
        </div>
      </Container>

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
