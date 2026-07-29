import { useEffect } from "react";
import { Modal } from "react-bootstrap";

import "./DeleteCollectibleModal.css";

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
  onClose,
  onDelete,
}: DeleteCollectibleModalProps) {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent): void {
      if (event.key === "Enter" && show && !isDeleting) {
        event.preventDefault();
        onDelete();
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [show, isDeleting, onDelete]);

  return (
    <Modal
      show={show}
      onHide={onClose}
      centered
      backdrop={isDeleting ? "static" : true}
      keyboard={!isDeleting}
      contentClassName="border-0 bg-transparent"
      aria-labelledby="delete-collectible-title"
    >
      <section className="delete-collectible-modal">
        <header className="delete-collectible-modal__header">
          <h2 id="delete-collectible-title" className="delete-collectible-modal__title">
            Delete collectible
          </h2>

          <button
            type="button"
            aria-label="Close"
            disabled={isDeleting}
            className={`delete-collectible-modal__close-button ${
              isDeleting ? "delete-collectible-modal__disabled" : ""
            }`}
            onClick={onClose}
          >
            <CloseIcon />
          </button>
        </header>

        <div className="delete-collectible-modal__body">
          <p className="delete-collectible-modal__message">
            This action cannot be undone. Are you sure you want to delete it?
          </p>
        </div>

        <footer className="delete-collectible-modal__footer">
          <button
            type="button"
            disabled={isDeleting}
            className={`delete-collectible-modal__secondary-button ${
              isDeleting ? "delete-collectible-modal__disabled" : ""
            }`}
            onClick={onClose}
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={isDeleting}
            className={`delete-collectible-modal__delete-button ${
              isDeleting ? "delete-collectible-modal__disabled" : ""
            }`}
            onClick={onDelete}
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </button>
        </footer>
      </section>
    </Modal>
  );
}

function CloseIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M7 7L17 17M17 7L7 17"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

