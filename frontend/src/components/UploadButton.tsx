import { useRef, useState, type ChangeEvent } from "react";

import { captureImage } from "@/api/generationApi";
import type { Collectible } from "@/types/collectible";
import { notifyAchievementsUpdated } from "@/utils/achievementEvents";

import "./UploadButton.css";

interface UploadButtonProps {
  onUploadSuccess: (collectible: Collectible) => void;
}

export default function UploadButton({ onUploadSuccess }: UploadButtonProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  function handleClick(): void {
    // Prevent opening the file picker while a generation
    // request is already in progress.
    if (!isGenerating) {
      fileInputRef.current?.click();
    }
  }

  async function handleFileChange(
    event: ChangeEvent<HTMLInputElement>,
  ): Promise<void> {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    try {
      setIsGenerating(true);

      // Upload the selected image and wait for the backend
      // to return the completed collectible.
      const collectible = await captureImage(file);

      onUploadSuccess(collectible);

      // Refresh achievement state because creating a collectible
      // may unlock or advance an achievement.
      notifyAchievementsUpdated();
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "Failed to generate collectible.",
      );
    } finally {
      setIsGenerating(false);
      event.target.value = "";
    }
  }

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        hidden
        onChange={handleFileChange}
      />

      <button
        type="button"
        disabled={isGenerating}
        aria-label={isGenerating ? "Generating collectible" : "Add collectible"}
        onClick={handleClick}
        className={`upload-button ${isGenerating ? "upload-button--disabled" : ""}`}
      >
        {isGenerating ? (
          <span className="upload-button__spinner" aria-hidden="true" />
        ) : (
          <svg
            width="17"
            height="17"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M12 5V19M5 12H19"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          </svg>
        )}

        <span>{isGenerating ? "Generating..." : "Add collectible"}</span>
      </button>
    </>
  );
}
