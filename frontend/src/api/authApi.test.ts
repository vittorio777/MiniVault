import { beforeEach, describe, expect, it, vi } from "vitest";

import { apiRequest } from "@/api/apiClient";

import {
  getStoredToken,
  getStoredUser,
  isAuthenticated,
  login,
  logout,
  register,
  type AuthResponse,
} from "./authApi";

vi.mock("@/api/apiClient", () => ({
  apiRequest: vi.fn(),
}));

const mockedApiRequest = vi.mocked(apiRequest);

describe("authApi", () => {
  const authResponse: AuthResponse = {
    token: "test-jwt-token",
    user: {
      id: 1,
      nickname: "wayne",
      email: "wayne@example.com",
    },
  };

  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  describe("login", () => {
    it("sends the login request and saves authentication data", async () => {
      mockedApiRequest.mockResolvedValue(authResponse);

      const request = {
        nickname: "wayne",
        password: "Password123!",
      };

      const result = await login(request);

      expect(mockedApiRequest).toHaveBeenCalledTimes(1);

      expect(mockedApiRequest).toHaveBeenCalledWith("/api/users/login", {
        method: "POST",
        body: JSON.stringify(request),
      });

      expect(result).toEqual(authResponse);

      expect(localStorage.getItem("token")).toBe("test-jwt-token");

      expect(JSON.parse(localStorage.getItem("user") ?? "")).toEqual(
        authResponse.user,
      );
    });

    it("does not save authentication data when the request fails", async () => {
      mockedApiRequest.mockRejectedValue(
        new Error("Invalid nickname or password."),
      );

      await expect(
        login({
          nickname: "wayne",
          password: "wrong-password",
        }),
      ).rejects.toThrow("Invalid nickname or password.");

      expect(localStorage.getItem("token")).toBeNull();
      expect(localStorage.getItem("user")).toBeNull();
    });
  });

  describe("register", () => {
    it("sends the register request and saves authentication data", async () => {
      mockedApiRequest.mockResolvedValue(authResponse);

      const request = {
        nickname: "wayne",
        email: "wayne@example.com",
        password: "Password123!",
      };

      const result = await register(request);

      expect(mockedApiRequest).toHaveBeenCalledTimes(1);

      expect(mockedApiRequest).toHaveBeenCalledWith("/api/users/register", {
        method: "POST",
        body: JSON.stringify(request),
      });

      expect(result).toEqual(authResponse);

      expect(getStoredToken()).toBe("test-jwt-token");
      expect(getStoredUser()).toEqual(authResponse.user);
    });
  });

  describe("getStoredUser", () => {
    it("returns the stored user", () => {
      localStorage.setItem("user", JSON.stringify(authResponse.user));

      expect(getStoredUser()).toEqual(authResponse.user);
    });

    it("returns null when no user is stored", () => {
      expect(getStoredUser()).toBeNull();
    });

    it("removes invalid stored user data and returns null", () => {
      localStorage.setItem("user", "invalid-json");

      expect(getStoredUser()).toBeNull();
      expect(localStorage.getItem("user")).toBeNull();
    });
  });

  describe("getStoredToken", () => {
    it("returns the stored token", () => {
      localStorage.setItem("token", "test-jwt-token");

      expect(getStoredToken()).toBe("test-jwt-token");
    });

    it("returns null when no token is stored", () => {
      expect(getStoredToken()).toBeNull();
    });
  });

  describe("isAuthenticated", () => {
    it("returns true when a token exists", () => {
      localStorage.setItem("token", "test-jwt-token");

      expect(isAuthenticated()).toBe(true);
    });

    it("returns false when no token exists", () => {
      expect(isAuthenticated()).toBe(false);
    });
  });

  describe("logout", () => {
    it("removes the token and user from localStorage", () => {
      localStorage.setItem("token", "test-jwt-token");

      localStorage.setItem("user", JSON.stringify(authResponse.user));

      logout();

      expect(localStorage.getItem("token")).toBeNull();
      expect(localStorage.getItem("user")).toBeNull();
      expect(isAuthenticated()).toBe(false);
    });
  });
});
