import { useEffect, useState, type FormEvent } from "react";
import { Modal } from "react-bootstrap";

import { register, type UserResponse } from "@/api/authApi";

import "./RegisterModal.css";

interface RegisterModalProps {
  show: boolean;
  onClose: () => void;
  onRegisterSuccess: (user: UserResponse) => void;
}

export default function RegisterModal({
  show,
  onClose,
  onRegisterSuccess,
}: RegisterModalProps) {
  const [nickname, setNickname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Clear previous errors whenever the modal is closed.
  useEffect(() => {
    if (!show) {
      setError("");
    }
  }, [show]);

  async function handleRegister(): Promise<void> {
    // Perform basic client-side validation before sending
    // the registration request to the API.
    if (!nickname.trim() || !email.trim() || !password) {
      setError("Please complete all fields.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await register({
        nickname: nickname.trim(),
        email: email.trim(),
        password,
      });

      // Notify the parent component so it can update
      // the authenticated user state immediately.
      onRegisterSuccess(response.user);

      // Reset the form after successful registration.
      setNickname("");
      setEmail("");
      setPassword("");
      setError("");

      onClose();
    } catch (requestError) {
      if (requestError instanceof Error) {
        setError(requestError.message);
      } else {
        setError("Registration failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    void handleRegister();
  }

  function handleClose(): void {
    // Keep the modal open while registration is in progress
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
      dialogClassName="minivault-register-modal"
    >
      <div className="register-modal">
        <button
          type="button"
          aria-label="Close register"
          onClick={handleClose}
          disabled={loading}
          className={`register-modal__close-button ${
            loading ? "register-modal__close-button--disabled" : ""
          }`}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
            className="register-modal__icon-svg"
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

        <div className="register-modal__header">
          <div className="register-modal__logo">
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

          <h2 className="register-modal__title">MiniVault</h2>
        </div>

        <form onSubmit={handleSubmit} className="register-modal__form">
          <input
            type="text"
            autoComplete="username"
            value={nickname}
            disabled={loading}
            placeholder="Nickname"
            onChange={(event) => {
              setNickname(event.target.value);

              if (error) {
                setError("");
              }
            }}
            className="register-modal__input"
          />

          <input
            type="email"
            autoComplete="email"
            value={email}
            disabled={loading}
            placeholder="Email"
            onChange={(event) => {
              setEmail(event.target.value);

              if (error) {
                setError("");
              }
            }}
            className="register-modal__input"
          />

          <input
            type="password"
            autoComplete="new-password"
            value={password}
            disabled={loading}
            placeholder="Password"
            onChange={(event) => {
              setPassword(event.target.value);

              if (error) {
                setError("");
              }
            }}
            className="register-modal__input"
          />

          {error && (
            <div className="register-modal__error-message" role="alert">
              <span className="register-modal__error-icon" aria-hidden="true">
                !
              </span>

              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`register-modal__submit-button ${
              loading ? "register-modal__submit-button--loading" : ""
            }`}
          >
            {loading ? (
              <>
                <span className="register-modal__spinner" aria-hidden="true" />
                <span>Creating account...</span>
              </>
            ) : (
              <>
                <span>Create account</span>

                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden="true"
                  className="register-modal__icon-svg"
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
