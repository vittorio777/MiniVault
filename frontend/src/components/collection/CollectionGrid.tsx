import type { Collectible } from "@/types/collectible";

import CollectionCard from "./CollectionCard";

import "./CollectionGrid.css";

interface CollectionGridProps {
  collectibles: Collectible[];
  onCollectibleClick: (collectible: Collectible) => void;
}

export default function CollectionGrid({
  collectibles,
  onCollectibleClick,
}: CollectionGridProps) {
  // Display an empty state until the user has created
  // their first collectible.
  if (collectibles.length === 0) {
    return (
      <div className="collection-grid__empty-state">
        <h2 className="collection-grid__empty-title">Your vault is waiting</h2>

        <p className="collection-grid__empty-description">
          Add your first photo and turn it into a miniature collectible.
        </p>
      </div>
    );
  }

  return (
    <div className="collection-grid">
      {/* Render one card for each collectible in the current collection. */}
      {collectibles.map((collectible) => (
        <div key={collectible.id} className="collection-grid__item">
          <CollectionCard
            collectible={collectible}
            onClick={onCollectibleClick}
          />
        </div>
      ))}
    </div>
  );
}
