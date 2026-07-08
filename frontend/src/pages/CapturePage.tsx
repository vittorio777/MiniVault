import React, { useState } from "react";
import type { Collectible } from "../types/collectible";
import { createCollectible } from "../api/collectiblesApi";

type UploadStatus = "idle" | "uploading" | "success" | "error";
type GenerateStatus = "idle" | "generating" | "success" | "error";

const CapturePage = () => {
  const [collectible, setCollectible] = useState<
    Omit<Collectible, "id" | "createdAt" | "updatedAt">
  >({
    userId: 1, // Replace with the actual user ID
    title: "",
    category: "",
    description: "",
    originalImageUrl: "",
    generatedImageUrl: "",
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>("idle");
  const [generateStatus, setGenerateStatus] = useState<GenerateStatus>("idle");

  //   选择file
  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
  }

  //   上传file
  async function handleFileUpload() {
    try {
      if (!selectedFile) {
        alert("please select a file first");
        return;
      }
      const formData = new FormData();

      formData.append("file", selectedFile);

      setUploadStatus("uploading");
      const response = await fetch(
        "http://localhost:5158/api/generation/capture",
        {
          method: "POST",
          body: formData,
        },
      );

      if (!response) {
        alert("Failed to upload");
        setUploadStatus("error");
        return;
      }

      const data = await response.json();
      setImageUrl(data.generatedImageUrl);

      // const collectibleData = await createCollectible(collectible);
      setUploadStatus("success");
      console.log("Collectible created:", data);
    } catch (error) {
      console.error("Error creating collectible:", error);
      setUploadStatus("error");
    }
    setUploadStatus("idle");
  }

  //   更新collectibles
  async function handleSubmit() {
    try {
      const data = await createCollectible(collectible);
      console.log("Collectible created:", data);
    } catch (error) {
      console.error("Error creating collectible:", error);
    }
  }

  return (
    <div>
      <div>
        <label>title</label>
        <input
          type="text"
          placeholder="Title"
          value={collectible.title}
          onChange={(e) =>
            setCollectible({ ...collectible, title: e.target.value })
          }
        />
      </div>
      <div>
        <label>Category</label>
        <input
          type="text"
          placeholder="Category"
          value={collectible.category}
          onChange={(e) =>
            setCollectible({ ...collectible, category: e.target.value })
          }
        />
      </div>
      <div>
        <label>Description</label>
        <input
          type="text"
          placeholder="Description"
          value={collectible.description}
          onChange={(e) =>
            setCollectible({ ...collectible, description: e.target.value })
          }
        />
      </div>
      <div>
        <label>Original Image Url</label>
        <input
          type="text"
          placeholder="Original Image Url"
          value={collectible.originalImageUrl}
          onChange={(e) =>
            setCollectible({ ...collectible, originalImageUrl: e.target.value })
          }
        />
      </div>
      <div>
        <label>Generated Image Url</label>
        <input
          type="text"
          placeholder="Generated Image Url"
          value={collectible.generatedImageUrl}
          onChange={(e) =>
            setCollectible({
              ...collectible,
              generatedImageUrl: e.target.value,
            })
          }
        />
      </div>
      <button onClick={handleSubmit}>Submit</button>
      <div>
        <input type="file" accept="image/*" onChange={handleFileChange} />
        <button onClick={handleFileUpload}>submit</button>
        {imageUrl && (
          <img
            src={`http://localhost:5158/${imageUrl}`}
            alt="Uploaded"
            style={{ width: 300 }}
          />
        )}
      </div>
    </div>
  );
};

export default CapturePage;
