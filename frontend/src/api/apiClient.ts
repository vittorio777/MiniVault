const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const isFormData = options.body instanceof FormData;

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      ...(options.headers ?? {}),
    },
  });

  if (!response.ok) {
    let message = `Request failed: ${response.status}`;

    try {
      const error = await response.json();

      if (typeof error === "string") {
        message = error;
      } else if (error && typeof error === "object") {
        if ("message" in error && typeof error.message === "string") {
          message = error.message;
        } else if ("title" in error && typeof error.title === "string") {
          message = error.title;
        }
      }
    } catch {
      try {
        const text = await response.text();

        if (text) {
          message = text;
        }
      } catch {
        // Ignore
      }
    }

    throw new Error(message);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}
