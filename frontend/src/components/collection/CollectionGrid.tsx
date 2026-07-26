import type { Collectible } from "@/types/collectible";

import CollectionCard from "./CollectionCard";

interface CollectionGridProps {
  collectibles: Collectible[];
  onCollectibleClick: (collectible: Collectible) => void;
}

export default function CollectionGrid({
  collectibles,
  onCollectibleClick,
}: CollectionGridProps) {
  if (collectibles.length === 0) {
    return <p>No collectibles found.</p>;
  }

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
        gap: "20px",
      }}
    >
      {collectibles.map((collectible) => (
        <CollectionCard
          key={collectible.id}
          collectible={collectible}
          onClick={onCollectibleClick}
        />
      ))}
    </div>
  );
}
