import { Button } from "react-bootstrap";

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
  if (isLoggedIn) {
    return (
      <div
        style={{
          position: "fixed",
          top: 20,
          right: 20,
          display: "flex",
          gap: "8px",
          alignItems: "center",
        }}
      >
        <span>{nickname}</span>

        <Button variant="outline-secondary" onClick={onLogoutClick}>
          Logout
        </Button>
      </div>
    );
  }

  return (
    <Button
      style={{
        position: "fixed",
        top: 20,
        right: 20,
      }}
      onClick={onLoginClick}
    >
      Login
    </Button>
  );
}
