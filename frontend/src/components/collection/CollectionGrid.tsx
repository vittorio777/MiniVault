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
  if (collectibles.length === 0) {
    return (
      <div className="collection-grid__empty-state">
        {/* <div style={styles.emptyIllustration} aria-hidden="true">
          <div style={styles.emptyGlow} />

          <div style={styles.emptyObject}>
            <span style={styles.emptyObjectTop} />
            <span style={styles.emptyObjectBody} />
          </div>

          <div style={styles.emptyBase}>
            <span style={styles.emptyPlaque}>MINIVAULT</span>
          </div>

          <div style={styles.emptyShadow} />
        </div> */}

        <h2 className="collection-grid__empty-title">Your vault is waiting</h2>

        <p className="collection-grid__empty-description">
          Add your first photo and turn it into a miniature collectible.
        </p>
      </div>
    );
  }

  return (
    <div className="collection-grid">
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

