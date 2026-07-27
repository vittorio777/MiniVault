import { Button, Form, Modal, Spinner } from "react-bootstrap";

interface EditCollectibleModalProps {
  show: boolean;
  isUpdating: boolean;
  title: string;
  category: string;
  description: string;
  onClose: () => void;
  onSave: () => void;
  onTitleChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
}

export default function EditCollectibleModal({
  show,
  isUpdating,
  title,
  category,
  description,
  onClose,
  onSave,
  onTitleChange,
  onCategoryChange,
  onDescriptionChange,
}: EditCollectibleModalProps) {
  return (
    <Modal show={show} onHide={onClose} centered>
      <Modal.Header closeButton={!isUpdating}>
        <Modal.Title>Edit collectible</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Form>
          <Form.Group className="mb-3">
            <Form.Label>Title</Form.Label>

            <Form.Control
              type="text"
              value={title}
              disabled={isUpdating}
              onChange={(event) => onTitleChange(event.target.value)}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Category</Form.Label>

            <Form.Control
              type="text"
              value={category}
              disabled={isUpdating}
              onChange={(event) => onCategoryChange(event.target.value)}
            />
          </Form.Group>

          <Form.Group>
            <Form.Label>Description</Form.Label>

            <Form.Control
              as="textarea"
              rows={4}
              value={description}
              disabled={isUpdating}
              onChange={(event) => onDescriptionChange(event.target.value)}
            />
          </Form.Group>
        </Form>
      </Modal.Body>

      <Modal.Footer>
        <Button
          type="button"
          variant="outline-secondary"
          disabled={isUpdating}
          onClick={onClose}
        >
          Cancel
        </Button>

        <Button
          type="button"
          variant="primary"
          disabled={isUpdating}
          onClick={onSave}
        >
          {isUpdating && (
            <Spinner animation="border" size="sm" className="me-2" />
          )}
          Save
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
