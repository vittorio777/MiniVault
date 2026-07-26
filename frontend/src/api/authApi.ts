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

export interface AuthResponse {
  id: number;
  nickname: string;
  email: string;
}

export function login(request: LoginRequest): Promise<AuthResponse> {
  return apiRequest<AuthResponse>("/api/users/login", {
    method: "POST",
    body: JSON.stringify(request),
  });
}

export function register(request: RegisterRequest): Promise<AuthResponse> {
  return apiRequest<AuthResponse>("/api/users/register", {
    method: "POST",
    body: JSON.stringify(request),
  });
}
