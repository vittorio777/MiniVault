import { useEffect, useState, type FormEvent } from "react";
import { Modal } from "react-bootstrap";

import { login, type UserResponse } from "@/api/authApi";

import "./LoginModal.css";

interface LoginModalProps {
  show: boolean;
  onClose: () => void;
  onLoginSuccess: (user: UserResponse) => void;
}

export default function LoginModal({
  show,
  onClose,
  onLoginSuccess,
}: LoginModalProps) {
  const [nickname, setNickname] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Clear previous errors whenever the modal is closed.
  useEffect(() => {
    if (!show) {
      setError("");
    }
  }, [show]);

  async function handleLogin(): Promise<void> {
    // Perform basic client-side validation before sending
    // the login request to the API.
    if (!nickname.trim() || !password) {
      setError("Please enter your nickname and password.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await login({
        nickname: nickname.trim(),
        password,
      });

      // Notify the parent component so it can update
      // the authenticated user state immediately.
      onLoginSuccess(response.user);

      // Reset the form after successful authentication.
      setNickname("");
      setPassword("");
      setError("");

      onClose();
    } catch (requestError) {
      if (requestError instanceof Error) {
        setError(requestError.message);
      } else {
        setError("Login failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    void handleLogin();
  }

  function handleClose(): void {
    // Keep the modal open while authentication is in progress
    // to prevent duplicate or interrupted submissions.
    if (loading) {
      return;
    }

    setError("");
    onClose();
  }

  return (
    <Modal
      show={show}
      onHide={handleClose}
      centered
      backdrop={loading ? "static" : true}
      keyboard={!loading}
      contentClassName="border-0 bg-transparent"
      dialogClassName="minivault-login-modal"
    >
      <div className="login-modal">
        <button
          type="button"
          aria-label="Close login"
          onClick={handleClose}
          disabled={loading}
          className={`login-modal__close-button ${
            loading ? "login-modal__close-button--disabled" : ""
          }`}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
            className="login-modal__icon-svg"
          >
            <path
              d="M6 6L18 18"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            />

            <path
              d="M18 6L6 18"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          </svg>
        </button>

        <div className="login-modal__header">
          <div className="login-modal__logo">
            <svg
              width="30"
              height="30"
              viewBox="0 0 32 32"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M8 10.5L16 6L24 10.5V21.5L16 26L8 21.5V10.5Z"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinejoin="round"
              />

              <path
                d="M8.5 10.8L16 15L23.5 10.8"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinejoin="round"
              />

              <path
                d="M16 15V25.5"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
              />

              <path
                d="M12.3 8.2L20 12.5"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
              />
            </svg>
          </div>

          <h2 className="login-modal__title">MiniVault</h2>
        </div>

        <form onSubmit={handleSubmit} className="login-modal__form">
          <label className="login-modal__field">
            <span
              className={`login-modal__input-wrapper ${
                error && !nickname.trim()
                  ? "login-modal__input-wrapper--error"
                  : ""
              }`}
            >
              <span className="login-modal__input-icon" aria-hidden="true">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M12 12a4 4 0 100-8 4 4 0 000 8Z"
                    stroke="currentColor"
                    strokeWidth="1.7"
                  />

                  <path
                    d="M5 20c0-3.2 2.8-5 7-5s7 1.8 7 5"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                  />
                </svg>
              </span>

              <input
                type="text"
                autoComplete="username"
                value={nickname}
                disabled={loading}
                placeholder="Nickname"
                onChange={(event) => {
                  setNickname(event.target.value);

                  // Remove the previous error once the user
                  // starts correcting the form.
                  if (error) {
                    setError("");
                  }
                }}
                className="login-modal__input"
              />
            </span>
          </label>

          <label className="login-modal__field">
            <span
              className={`login-modal__input-wrapper ${
                error && !password ? "login-modal__input-wrapper--error" : ""
              }`}
            >
              <span className="login-modal__input-icon" aria-hidden="true">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <rect
                    x="5"
                    y="10"
                    width="14"
                    height="10"
                    rx="2.5"
                    stroke="currentColor"
                    strokeWidth="1.7"
                  />

                  <path
                    d="M8 10V7.5C8 5.3 9.8 3.5 12 3.5C14.2 3.5 16 5.3 16 7.5V10"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                  />

                  <path
                    d="M12 14V16"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                  />
                </svg>
              </span>

              <input
                type="password"
                autoComplete="current-password"
                value={password}
                disabled={loading}
                placeholder="Password"
                onChange={(event) => {
                  setPassword(event.target.value);

                  if (error) {
                    setError("");
                  }
                }}
                className="login-modal__input"
              />
            </span>
          </label>

          {error && (
            <div className="login-modal__error-message" role="alert">
              <span className="login-modal__error-icon" aria-hidden="true">
                !
              </span>

              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`login-modal__submit-button ${
              loading ? "login-modal__submit-button--loading" : ""
            }`}
          >
            {loading ? (
              <>
                <span className="login-modal__spinner" aria-hidden="true" />
                <span>Opening vault...</span>
              </>
            ) : (
              <>
                <span>Continue</span>

                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M5 12H19"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />

                  <path
                    d="M14 7L19 12L14 17"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </>
            )}
          </button>
        </form>
      </div>
    </Modal>
  );
}
