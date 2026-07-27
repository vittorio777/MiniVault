import { Button, Modal, Spinner } from "react-bootstrap";

interface DeleteCollectibleModalProps {
  show: boolean;
  isDeleting: boolean;
  collectibleTitle: string;
  onClose: () => void;
  onDelete: () => void;
}

export default function DeleteCollectibleModal({
  show,
  isDeleting,
  collectibleTitle,
  onClose,
  onDelete,
}: DeleteCollectibleModalProps) {
  return (
    <Modal show={show} onHide={onClose} centered>
      <Modal.Header closeButton={!isDeleting}>
        <Modal.Title>Delete collectible</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        Are you sure you want to delete <strong>{collectibleTitle}</strong>?
      </Modal.Body>

      <Modal.Footer>
        <Button
          type="button"
          variant="outline-secondary"
          disabled={isDeleting}
          onClick={onClose}
        >
          Cancel
        </Button>

        <Button
          type="button"
          variant="danger"
          disabled={isDeleting}
          onClick={onDelete}
        >
          {isDeleting && (
            <Spinner animation="border" size="sm" className="me-2" />
          )}
          Delete
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
