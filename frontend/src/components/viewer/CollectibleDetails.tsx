import { useRef, useState, type PointerEvent } from "react";

import type { Collectible } from "@/types/collectible";
import { getImageUrl } from "@/utils/imageUrl";

import "./CollectibleDetails.css";

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
  const showcaseRef = useRef<HTMLDivElement>(null);
  const lensRef = useRef<HTMLDivElement>(null);

  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [isZoomEnabled, setIsZoomEnabled] = useState(false);

  const imageUrl = getImageUrl(collectible.generatedImageUrl);

  const addedDate = new Date(collectible.createdAt).toLocaleDateString(
    "en-NZ",
    {
      day: "numeric",
      month: "long",
      year: "numeric",
    },
  );

  function handlePointerMove(event: PointerEvent<HTMLDivElement>): void {
    // Disable hover-based effects on touch devices.
    if (event.pointerType === "touch") {
      return;
    }

    const showcase = showcaseRef.current;
    const lens = lensRef.current;

    if (!showcase) {
      return;
    }

    const rect = showcase.getBoundingClientRect();

    // Convert the pointer position into coordinates
    // relative to the image showcase.
    const pointerX = event.clientX - rect.left;
    const pointerY = event.clientY - rect.top;

    const xRatio = pointerX / rect.width;
    const yRatio = pointerY / rect.height;

    // Apply a subtle 3D tilt based on the pointer position.
    const rotateY = (xRatio - 0.5) * 5;
    const rotateX = (0.5 - yRatio) * 3;

    showcase.style.transform = `
    perspective(1000px)
    rotateX(${rotateX}deg)
    rotateY(${rotateY}deg)
  `;

    if (!lens || !isImageLoaded || !isZoomEnabled) {
      if (lens) {
        lens.style.opacity = "0";
      }

      return;
    }

    const lensSize = 220;

    // Position the lens around the pointer.
    let lensX = pointerX - lensSize / 2;
    let lensY = pointerY - lensSize / 2;

    // Keep the lens fully inside the showcase boundaries.
    lensX = Math.max(0, Math.min(lensX, rect.width - lensSize));
    lensY = Math.max(0, Math.min(lensY, rect.height - lensSize));

    lens.style.left = `${lensX}px`;
    lens.style.top = `${lensY}px`;

    // Align the magnified background with the pointer location.
    lens.style.backgroundPosition = `${xRatio * 100}% ${yRatio * 100}%`;

    lens.style.opacity = "1";
  }

  function resetPointerEffect(): void {
    const showcase = showcaseRef.current;
    const lens = lensRef.current;

    // Restore the default orientation when the pointer leaves.
    if (showcase) {
      showcase.style.transform =
        "perspective(1000px) rotateX(0deg) rotateY(0deg)";
    }

    if (lens) {
      lens.style.opacity = "0";
    }
  }

  return (
    <section className="collectible-details-layout">
      <div
        ref={showcaseRef}
        className={`collectible-details__showcase ${
          isZoomEnabled ? "collectible-details__showcase--zoom-enabled" : ""
        }`}
        onPointerMove={handlePointerMove}
        onPointerLeave={resetPointerEffect}
        onPointerCancel={resetPointerEffect}
      >
        {!isImageLoaded && (
          <div className="collectible-details__image-placeholder">
            <span className="collectible-details__loading-dot" />
            Loading image
          </div>
        )}

        <img
          src={imageUrl}
          alt={collectible.title}
          draggable={false}
          onLoad={() => setIsImageLoaded(true)}
          className={`collectible-details__image ${
            isImageLoaded ? "collectible-details__image--loaded" : ""
          }`}
        />

        <div
          ref={lensRef}
          aria-hidden="true"
          className="collectible-details__magnifier"
          style={{ backgroundImage: `url("${imageUrl}")` }}
        />

        <button
          type="button"
          className={`collectible-details__zoom-button ${
            isZoomEnabled ? "collectible-details__zoom-button--active" : ""
          }`}
          aria-pressed={isZoomEnabled}
          onClick={() => {
            setIsZoomEnabled((currentValue) => {
              const nextValue = !currentValue;

              if (!nextValue && lensRef.current) {
                lensRef.current.style.opacity = "0";
              }

              return nextValue;
            });
          }}
        >
          <MagnifierIcon />
          {isZoomEnabled ? "Zoom on" : "Zoom off"}
        </button>
      </div>

      <aside className="collectible-details__info">
        <div className="collectible-details__meta-row">
          <span className="collectible-details__category">
            {collectible.category.toUpperCase()}
          </span>
        </div>

        <h1 className="collectible-details__title">{collectible.title}</h1>

        <p className="collectible-details__description">
          {collectible.description || "No description has been added yet."}
        </p>

        <p className="collectible-details__added-text">Added · {addedDate}</p>

        <div className="collectible-details__actions">
          <button
            type="button"
            className="collectible-details__edit-button"
            onClick={onEdit}
          >
            Edit collectible
          </button>

          <button
            type="button"
            className="collectible-details__delete-button"
            onClick={onDelete}
          >
            Delete
          </button>
        </div>
      </aside>
    </section>
  );
}

function MagnifierIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className="collectible-details__magnifier-icon"
    >
      <circle
        cx="10.5"
        cy="10.5"
        r="5.5"
        stroke="currentColor"
        strokeWidth="1.8"
      />

      <path
        d="M15 15L20 20"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />

      <path
        d="M10.5 8V13M8 10.5H13"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}
