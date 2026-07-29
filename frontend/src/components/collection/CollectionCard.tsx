import "./CollectionCard.css";

import {
  useEffect,
  useRef,
  useState,
  type PointerEvent,
} from "react";

import type { Collectible } from "@/types/collectible";
import { getImageUrl } from "@/utils/imageUrl";

interface CollectionCardProps {
  collectible: Collectible;
  onClick: (collectible: Collectible) => void;
}

export default function CollectionCard({
  collectible,
  onClick,
}: CollectionCardProps) {
  const cardRef = useRef<HTMLButtonElement>(null);
  const objectRef = useRef<HTMLSpanElement>(null);
  const shadowRef = useRef<HTMLSpanElement>(null);
  const animationFrameRef = useRef<number | null>(null);

  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const imageUrl = getImageUrl(collectible.generatedImageUrl);

  function updatePointerEffect(clientX: number, clientY: number): void {
    const card = cardRef.current;
    const object = objectRef.current;
    const shadow = shadowRef.current;

    if (!card || !object || !shadow) {
      return;
    }

    const bounds = card.getBoundingClientRect();

    if (bounds.width === 0 || bounds.height === 0) {
      return;
    }

    const localX = (clientX - bounds.left) / bounds.width;
    const localY = (clientY - bounds.top) / bounds.height;

    const normalizedX = Math.max(-1, Math.min(1, (localX - 0.5) * 2));
    const normalizedY = Math.max(-1, Math.min(1, (localY - 0.5) * 2));

    const rotateY = normalizedX * 2.4;
    const rotateX = normalizedY * -1.6;
    const translateX = normalizedX * 2.5;
    const translateY = normalizedY * 1.5;

    object.style.transform = `
      translate3d(${translateX}px, ${translateY - 5}px, 0)
      rotateX(${rotateX}deg)
      rotateY(${rotateY}deg)
      scale(1.025)
    `;

    shadow.style.transform = `
      translate3d(${normalizedX * -7}px, ${normalizedY * 2}px, 0)
      scaleX(${1 + Math.abs(normalizedX) * 0.04})
    `;
  }

  function handlePointerMove(event: PointerEvent<HTMLButtonElement>): void {
    if (event.pointerType === "touch") {
      return;
    }

    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    animationFrameRef.current = requestAnimationFrame(() => {
      updatePointerEffect(event.clientX, event.clientY);
      animationFrameRef.current = null;
    });
  }

  function resetPointerEffect(): void {
    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    if (objectRef.current) {
      objectRef.current.style.transform =
        "translate3d(0, 0, 0) rotateX(0deg) rotateY(0deg) scale(1)";
    }

    if (shadowRef.current) {
      shadowRef.current.style.transform = "translate3d(0, 0, 0) scaleX(1)";
    }

    setIsHovered(false);
  }

  useEffect(() => {
    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  return (
    <button
      ref={cardRef}
      type="button"
      aria-label={`View ${collectible.title}`}
      onClick={() => onClick(collectible)}
      onPointerEnter={() => setIsHovered(true)}
      onPointerMove={handlePointerMove}
      onPointerLeave={resetPointerEffect}
      onPointerCancel={resetPointerEffect}
      className="collection-card"
    >
      <span className="collection-card__stage">
        {!isImageLoaded && (
          <span className="collection-card__placeholder" aria-hidden="true">
            <span className="collection-card__placeholder-top" />
            <span className="collection-card__placeholder-body" />
          </span>
        )}

        <span
          ref={objectRef}
          className="collection-card__object"
          style={{ opacity: isImageLoaded ? 1 : 0 }}
        >
          <img
            src={imageUrl}
            alt={collectible.title}
            loading="lazy"
            draggable={false}
            onLoad={() => setIsImageLoaded(true)}
            className="collection-card__image"
          />

          {/* <span
            style={{
              ...styles.imageHighlight,
              opacity: isHovered ? 0.52 : 0.28,
            }}
            aria-hidden="true"
          /> */}
        </span>

        <span
          ref={shadowRef}
          className="collection-card__shadow"
          style={{ opacity: isHovered ? 0.32 : 0.22 }}
          aria-hidden="true"
        />
      </span>
    </button>
  );
}

