import { useState } from "react";
import { Button, Form, Modal } from "react-bootstrap";

import { register } from "@/api/authApi";

interface RegisterModalProps {
  show: boolean;

  onClose: () => void;

  onRegisterSuccess: (userId: number, nickname: string) => void;
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

  const handleRegister = async () => {
    if (!nickname || !email || !password) {
      alert("Please complete all fields.");
      return;
    }

    try {
      setLoading(true);

      const user = await register({
        nickname,
        email,
        password,
      });

      onRegisterSuccess(user.id, user.nickname);

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
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Email</Form.Label>

            <Form.Control
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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

        <Button onClick={handleRegister} disabled={loading}>
          {loading ? "Registering..." : "Register"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
