const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5158";

export function getImageUrl(imageUrl?: string | null): string {
  if (!imageUrl) {
    return "";
  }

  // Return absolute URLs directly without modification.
  if (
    imageUrl.startsWith("http://") ||
    imageUrl.startsWith("https://") ||
    imageUrl.startsWith("data:") ||
    imageUrl.startsWith("blob:")
  ) {
    return imageUrl;
  }

  const normalizedBaseUrl = API_BASE_URL.replace(/\/+$/, "");
  const normalizedImageUrl = imageUrl.startsWith("/")
    ? imageUrl
    : `/${imageUrl}`;

  // Resolve application-relative image paths against
  // the configured backend base URL.
  return `${normalizedBaseUrl}${normalizedImageUrl}`;
}
