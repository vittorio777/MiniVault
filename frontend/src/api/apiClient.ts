const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";

interface ApiErrorResponse {
  message?: string;
  title?: string;
  detail?: string;
}

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const token = localStorage.getItem("token");
  const isFormData = options.body instanceof FormData;

  const headers = new Headers(options.headers);

  if (!isFormData && options.body !== undefined) {
    headers.set("Content-Type", "application/json");
  }

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const message = await getErrorMessage(response);

    if (response.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }

    throw new Error(message);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const contentType = response.headers.get("content-type");

  if (!contentType?.includes("application/json")) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

async function getErrorMessage(
  response: Response,
): Promise<string> {
  const defaultMessage = `Request failed: ${response.status}`;

  try {
    const text = await response.text();

    if (!text) {
      return defaultMessage;
    }

    try {
      const error = JSON.parse(text) as
        | ApiErrorResponse
        | string;

      if (typeof error === "string") {
        return error;
      }

      if (error.message) {
        return error.message;
      }

      if (error.detail) {
        return error.detail;
      }

      if (error.title) {
        return error.title;
      }

      return defaultMessage;
    } catch {
      return text;
    }
  } catch {
    return defaultMessage;
  }
}