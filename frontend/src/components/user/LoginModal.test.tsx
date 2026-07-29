import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";

import LoginModal from "./LoginModal";

import { login } from "@/api/authApi";

vi.mock("@/api/authApi", () => ({
  login: vi.fn(),
}));

const mockedLogin = vi.mocked(login);

describe("LoginModal", () => {
  const onClose = vi.fn();
  const onLoginSuccess = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  function renderModal() {
    return render(
      <LoginModal
        show={true}
        onClose={onClose}
        onLoginSuccess={onLoginSuccess}
      />,
    );
  }

  it("renders correctly", () => {
    renderModal();

    expect(screen.getByText("MiniVault")).toBeInTheDocument();

    expect(screen.getByPlaceholderText("Nickname")).toBeInTheDocument();

    expect(screen.getByPlaceholderText("Password")).toBeInTheDocument();

    expect(
      screen.getByRole("button", {
        name: /continue/i,
      }),
    ).toBeInTheDocument();
  });

  it("shows validation message when fields are empty", async () => {
    renderModal();

    fireEvent.click(
      screen.getByRole("button", {
        name: /continue/i,
      }),
    );

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Please enter your nickname and password.",
    );

    expect(mockedLogin).not.toHaveBeenCalled();
  });

  it("logs in successfully", async () => {
    mockedLogin.mockResolvedValue({
      token: "jwt-token",
      user: {
        id: 1,
        nickname: "wayne",
        email: "wayne@example.com",
      },
    });

    renderModal();

    fireEvent.change(screen.getByPlaceholderText("Nickname"), {
      target: {
        value: "wayne",
      },
    });

    fireEvent.change(screen.getByPlaceholderText("Password"), {
      target: {
        value: "Password123!",
      },
    });

    fireEvent.submit(
      screen
        .getByRole("button", {
          name: /continue/i,
        })
        .closest("form")!,
    );

    await waitFor(() => {
      expect(mockedLogin).toHaveBeenCalledWith({
        nickname: "wayne",
        password: "Password123!",
      });
    });

    expect(onLoginSuccess).toHaveBeenCalledWith({
      id: 1,
      nickname: "wayne",
      email: "wayne@example.com",
    });

    expect(onClose).toHaveBeenCalled();
  });

  it("shows server error when login fails", async () => {
    mockedLogin.mockRejectedValue(new Error("Invalid nickname or password."));

    renderModal();

    fireEvent.change(screen.getByPlaceholderText("Nickname"), {
      target: {
        value: "wayne",
      },
    });

    fireEvent.change(screen.getByPlaceholderText("Password"), {
      target: {
        value: "wrong",
      },
    });

    fireEvent.click(
      screen.getByRole("button", {
        name: /continue/i,
      }),
    );

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Invalid nickname or password.",
    );
  });

  it("closes when close button is clicked", () => {
    renderModal();

    fireEvent.click(
      screen.getByRole("button", {
        name: /close login/i,
      }),
    );

    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
