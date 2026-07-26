import { useRef, useState } from "react";
import { Button, Spinner } from "react-bootstrap";

import { captureImage } from "@/api/generationApi";
import type { Collectible } from "@/types/collectible";

interface UploadButtonProps {
  onUploadSuccess: (collectible: Collectible) => void;
}

export default function UploadButton({ onUploadSuccess }: UploadButtonProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isGenerating, setIsGenerating] = useState(false);

  function handleClick() {
    fileInputRef.current?.click();
  }

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    try {
      setIsGenerating(true);

      const collectible = await captureImage(file);

      onUploadSuccess(collectible);
    } catch (error) {
      if (error instanceof Error) {
        alert(error.message);
      } else {
        alert("Failed to generate collectible.");
      }
    } finally {
      setIsGenerating(false);

      // 清空 input，允许再次选择同一张图片
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

      <Button variant="primary" onClick={handleClick} disabled={isGenerating}>
        {isGenerating ? (
          <>
            <Spinner animation="border" size="sm" className="me-2" />
            Generating...
          </>
        ) : (
          "Upload"
        )}
      </Button>
    </>
  );
}
