import { useState } from "react";
import { Button, Form, Modal } from "react-bootstrap";

import { login } from "@/api/authApi";

interface LoginModalProps {
  show: boolean;

  onClose: () => void;

  onLoginSuccess: (userId: number, nickname: string) => void;
}

export default function LoginModal({
  show,
  onClose,
  onLoginSuccess,
}: LoginModalProps) {
  const [nickname, setNickname] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!nickname || !password) {
      alert("Please enter your nickname and password.");
      return;
    }

    try {
      setLoading(true);

      const user = await login({
        nickname,
        password,
      });

      onLoginSuccess(user.id, user.nickname);

      setNickname("");
      setPassword("");

      onClose();
    } catch (error) {
      if (error instanceof Error) {
        alert(error.message);
      } else {
        alert("Login failed.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show={show} onHide={onClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Login</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Form>
          <Form.Group className="mb-3">
            <Form.Label>Nickname</Form.Label>

            <Form.Control
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
            />
          </Form.Group>

          <Form.Group>
            <Form.Label>Password</Form.Label>

            <Form.Control
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </Form.Group>
        </Form>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>
          Cancel
        </Button>

        <Button onClick={handleLogin} disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
