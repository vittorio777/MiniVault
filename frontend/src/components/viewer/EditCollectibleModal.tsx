import { useEffect, useRef, type FormEvent } from "react";
import { Modal } from "react-bootstrap";

import "./EditCollectibleModal.css";

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
  const titleInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!show) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      titleInputRef.current?.focus();
      titleInputRef.current?.select();
    }, 200);

    return () => window.clearTimeout(timeoutId);
  }, [show]);

  function handleSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();

    if (!isUpdating) {
      onSave();
    }
  }

  return (
    <Modal
      show={show}
      onHide={onClose}
      centered
      backdrop={isUpdating ? "static" : true}
      keyboard={!isUpdating}
      contentClassName="border-0 bg-transparent"
      aria-labelledby="edit-collectible-title"
    >
      <section className="edit-collectible-modal">
        <header className="edit-collectible-modal__header">
          <h2 id="edit-collectible-title" className="edit-collectible-modal__title">
            Edit collectible
          </h2>

          <button
            type="button"
            aria-label="Close"
            disabled={isUpdating}
            className={`edit-collectible-modal__close-button ${
              isUpdating ? "edit-collectible-modal__disabled" : ""
            }`}
            onClick={onClose}
          >
            <CloseIcon />
          </button>
        </header>

        <form onSubmit={handleSubmit}>
          <div className="edit-collectible-modal__fields">
            <label className="edit-collectible-modal__field">
              <span className="edit-collectible-modal__label">Title</span>

              <input
                ref={titleInputRef}
                type="text"
                value={title}
                disabled={isUpdating}
                maxLength={100}
                placeholder="Name your collectible"
                className="edit-collectible-modal__input"
                onChange={(event) => onTitleChange(event.target.value)}
              />

              <span className="edit-collectible-modal__count">{title.length}/100</span>
            </label>

            <label className="edit-collectible-modal__field">
              <span className="edit-collectible-modal__label">Category</span>

              <input
                type="text"
                value={category}
                disabled={isUpdating}
                maxLength={50}
                placeholder="e.g. Person, Vehicle, Building"
                className="edit-collectible-modal__input"
                onChange={(event) => onCategoryChange(event.target.value)}
              />
            </label>

            <label className="edit-collectible-modal__field">
              <span className="edit-collectible-modal__label-row">
                <span className="edit-collectible-modal__label">Description</span>
                <span className="edit-collectible-modal__optional">Optional</span>
              </span>

              <textarea
                value={description}
                disabled={isUpdating}
                maxLength={500}
                rows={5}
                placeholder="Add a short note..."
                className="edit-collectible-modal__input edit-collectible-modal__textarea"
                onChange={(event) => onDescriptionChange(event.target.value)}
              />

              <span className="edit-collectible-modal__count">{description.length}/500</span>
            </label>
          </div>

          <footer className="edit-collectible-modal__footer">
            <button
              type="button"
              disabled={isUpdating}
              className={`edit-collectible-modal__secondary-button ${
                isUpdating ? "edit-collectible-modal__disabled" : ""
              }`}
              onClick={onClose}
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isUpdating}
              className={`edit-collectible-modal__primary-button ${
                isUpdating ? "edit-collectible-modal__disabled" : ""
              }`}
            >
              {isUpdating ? "Saving..." : "Save changes"}
            </button>
          </footer>
        </form>
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

