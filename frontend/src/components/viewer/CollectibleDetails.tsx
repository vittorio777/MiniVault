import { Button } from "react-bootstrap";

import type { Collectible } from "@/types/collectible";
import { getImageUrl } from "@/utils/imageUrl";

interface CollectibleDetailsProps {
  collectible: Collectible;
  onEdit: () => void;
  onDelete: () => void;
}

export default function CollectibleDetails({
  collectible,
  onEdit,
  onDelete,
}: CollectibleDetailsProps) {
  return (
    <>
      <div className="overflow-hidden rounded bg-white shadow-sm">
        <img
          src={getImageUrl(collectible.generatedImageUrl)}
          alt={collectible.title}
          className="d-block w-100"
          style={{
            maxHeight: "620px",
            objectFit: "contain",
          }}
        />
      </div>

      <div className="mt-4 rounded bg-white p-4 shadow-sm">
        <div className="mb-3 d-flex flex-column flex-md-row align-items-md-start justify-content-between gap-3">
          <div>
            <h2 className="mb-2">{collectible.title}</h2>

            <span className="text-secondary">{collectible.category}</span>
          </div>

          <div className="d-flex gap-2">
            <Button type="button" variant="outline-primary" onClick={onEdit}>
              Edit
            </Button>

            <Button type="button" variant="outline-danger" onClick={onDelete}>
              Delete
            </Button>
          </div>
        </div>

        <p className="mb-3 text-secondary">
          {collectible.description || "No description."}
        </p>

        <small className="text-muted">
          Created {new Date(collectible.createdAt).toLocaleString()}
        </small>
      </div>
    </>
  );
}
