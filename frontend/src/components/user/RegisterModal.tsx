import { useState } from "react";
import { Button, Form, Modal } from "react-bootstrap";

import { register, type UserResponse } from "@/api/authApi";

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

  const handleRegister = async (): Promise<void> => {
    if (!nickname.trim() || !email.trim() || !password) {
      alert("Please complete all fields.");
      return;
    }

    try {
      setLoading(true);

      const response = await register({
        nickname: nickname.trim(),
        email: email.trim(),
        password,
      });

      onRegisterSuccess(response.user);

      setNickname("");
      setEmail("");
      setPassword("");

      onClose();
    } catch (error) {
      if (error instanceof Error) {
        alert(error.message);
      } else {
        alert("Registration failed.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show={show} onHide={onClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Register</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Form>
          <Form.Group className="mb-3">
            <Form.Label>Nickname</Form.Label>

            <Form.Control
              type="text"
              autoComplete="username"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  void handleRegister();
                }
              }}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Email</Form.Label>

            <Form.Control
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  void handleRegister();
                }
              }}
            />
          </Form.Group>

          <Form.Group>
            <Form.Label>Password</Form.Label>

            <Form.Control
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  void handleRegister();
                }
              }}
            />
          </Form.Group>
        </Form>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={onClose} disabled={loading}>
          Cancel
        </Button>

        <Button onClick={() => void handleRegister()} disabled={loading}>
          {loading ? "Registering..." : "Register"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
