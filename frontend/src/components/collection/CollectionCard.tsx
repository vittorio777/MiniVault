import type { Collectible } from "@/types/collectible";

interface CollectionCardProps {
  collectible: Collectible;
  onClick: (collectible: Collectible) => void;
}

export default function CollectionCard({
  collectible,
  onClick,
}: CollectionCardProps) {
  return (
    <button type="button" onClick={() => onClick(collectible)}>
      <img src={collectible.generatedImageUrl} alt={collectible.title} />

      <h3>{collectible.title}</h3>

      <p>{collectible.category}</p>

      <p>{collectible.description}</p>
    </button>
  );
}
