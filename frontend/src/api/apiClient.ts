const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";

interface ApiErrorResponse {
  message?: string;
  title?: string;
  detail?: string;
}

/**
 * Sends an API request and handles authentication,
 * response parsing, and common error behaviour.
 */
export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const token = localStorage.getItem("token");
  const isFormData = options.body instanceof FormData;

  const headers = new Headers(options.headers);

  // Let the browser set the multipart boundary automatically
  // when sending FormData. Other request bodies use JSON.
  if (!isFormData && options.body !== undefined) {
    headers.set("Content-Type", "application/json");
  }

  // Attach the stored JWT to authenticated API requests.
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const message = await getErrorMessage(response);

    // Remove expired or invalid authentication data
    // when the backend rejects the current token.
    if (response.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }

    throw new Error(message);
  }

  // Successful delete and update requests may not
  // include a response body.
  if (response.status === 204) {
    return undefined as T;
  }

  const contentType = response.headers.get("content-type");

  // Avoid attempting to parse empty or non-JSON responses.
  if (!contentType?.includes("application/json")) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

/**
 * Extracts a readable message from JSON, text,
 * or empty API error responses.
 */
async function getErrorMessage(response: Response): Promise<string> {
  const defaultMessage = `Request failed: ${response.status}`;

  try {
    // Read the body once as text, then attempt JSON parsing.
    const text = await response.text();

    if (!text) {
      return defaultMessage;
    }

    try {
      const error = JSON.parse(text) as ApiErrorResponse | string;

      if (typeof error === "string") {
        return error;
      }

      // Support both custom API errors and ASP.NET
      // Problem Details response fields.
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
      // Return plain-text error responses directly.
      return text;
    }
  } catch {
    return defaultMessage;
  }
}
