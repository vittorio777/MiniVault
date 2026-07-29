import "./UserButton.css";

interface UserButtonProps {
  isLoggedIn: boolean;
  nickname?: string;
  onLoginClick: () => void;
  onLogoutClick: () => void;
}

export default function UserButton({
  isLoggedIn,
  nickname,
  onLoginClick,
  onLogoutClick,
}: UserButtonProps) {

  if (!isLoggedIn) {
    return (
      <button
        type="button"
        onClick={onLoginClick}
        className="user-button__login"
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M12 12a4 4 0 100-8 4 4 0 000 8Z"
            stroke="currentColor"
            strokeWidth="1.8"
          />

          <path
            d="M5 20c0-3.2 2.8-5 7-5s7 1.8 7 5"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </svg>

        <span>Login</span>
      </button>
    );
  }

  return (
    <div className="user-button__container">
      <span className="user-button__name">{nickname || "Collector"}</span>

      <span className="user-button__divider" aria-hidden="true" />

      <button
        type="button"
        onClick={onLogoutClick}
        aria-label="Logout"
        title="Logout"
        className="user-button__logout"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M15 7L20 12L15 17"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          <path
            d="M20 12H9"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
          />

          <path
            d="M12 4H7C5.9 4 5 4.9 5 6V18C5 19.1 5.9 20 7 20H12"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
          />
        </svg>
      </button>
    </div>
  );
}

