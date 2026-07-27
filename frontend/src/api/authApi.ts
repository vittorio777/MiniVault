import { apiRequest } from "@/api/apiClient";

export interface LoginRequest {
  nickname: string;
  password: string;
}

export interface RegisterRequest {
  nickname: string;
  email: string;
  password: string;
}

export interface UserResponse {
  id: number;
  nickname: string;
  email: string;
}

export interface AuthResponse {
  token: string;
  user: UserResponse;
}

export async function login(request: LoginRequest): Promise<AuthResponse> {
  const response = await apiRequest<AuthResponse>("/api/users/login", {
    method: "POST",
    body: JSON.stringify(request),
  });

  saveAuth(response);

  return response;
}

export async function register(
  request: RegisterRequest,
): Promise<AuthResponse> {
  const response = await apiRequest<AuthResponse>("/api/users/register", {
    method: "POST",
    body: JSON.stringify(request),
  });

  saveAuth(response);

  return response;
}

export function getStoredUser(): UserResponse | null {
  const storedUser = localStorage.getItem("user");

  if (!storedUser) {
    return null;
  }

  try {
    return JSON.parse(storedUser) as UserResponse;
  } catch {
    localStorage.removeItem("user");
    return null;
  }
}

export function getStoredToken(): string | null {
  return localStorage.getItem("token");
}

export function isAuthenticated(): boolean {
  return Boolean(getStoredToken());
}

export function logout(): void {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
}

function saveAuth(response: AuthResponse): void {
  localStorage.setItem("token", response.token);
  localStorage.setItem("user", JSON.stringify(response.user));
}
