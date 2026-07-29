import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";

import DeleteCollectibleModal from "./DeleteCollectibleModal";

describe("DeleteCollectibleModal", () => {
  const onClose = vi.fn();
  const onDelete = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  function renderModal({
    show = true,
    isDeleting = false,
  }: {
    show?: boolean;
    isDeleting?: boolean;
  } = {}) {
    return render(
      <DeleteCollectibleModal
        show={show}
        isDeleting={isDeleting}
        collectibleTitle="Robot Figure"
        onClose={onClose}
        onDelete={onDelete}
      />,
    );
  }

  it("renders the delete confirmation message", () => {
    renderModal();

    expect(
      screen.getByRole("heading", {
        name: "Delete collectible",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        "This action cannot be undone. Are you sure you want to delete it?",
      ),
    ).toBeInTheDocument();
  });

  it("calls onDelete when the Delete button is clicked", () => {
    renderModal();

    fireEvent.click(
      screen.getByRole("button", {
        name: "Delete",
      }),
    );

    expect(onDelete).toHaveBeenCalledTimes(1);
    expect(onClose).not.toHaveBeenCalled();
  });

  it("calls onClose when the Cancel button is clicked", () => {
    renderModal();

    fireEvent.click(
      screen.getByRole("button", {
        name: "Cancel",
      }),
    );

    expect(onClose).toHaveBeenCalledTimes(1);
    expect(onDelete).not.toHaveBeenCalled();
  });

  it("calls onClose when the close button is clicked", () => {
    renderModal();

    fireEvent.click(
      screen.getByRole("button", {
        name: "Close",
      }),
    );

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("calls onDelete when Enter is pressed", () => {
    renderModal();

    fireEvent.keyDown(window, {
      key: "Enter",
      code: "Enter",
    });

    expect(onDelete).toHaveBeenCalledTimes(1);
  });

  it("does not call onDelete on Enter when the modal is hidden", () => {
    renderModal({
      show: false,
    });

    fireEvent.keyDown(window, {
      key: "Enter",
      code: "Enter",
    });

    expect(onDelete).not.toHaveBeenCalled();
  });

  it("disables actions while deleting", () => {
    renderModal({
      isDeleting: true,
    });

    expect(
      screen.getByRole("button", {
        name: "Close",
      }),
    ).toBeDisabled();

    expect(
      screen.getByRole("button", {
        name: "Cancel",
      }),
    ).toBeDisabled();

    expect(
      screen.getByRole("button", {
        name: "Deleting...",
      }),
    ).toBeDisabled();
  });

  it("does not call onDelete on Enter while deleting", () => {
    renderModal({
      isDeleting: true,
    });

    fireEvent.keyDown(window, {
      key: "Enter",
      code: "Enter",
    });

    expect(onDelete).not.toHaveBeenCalled();
  });
});
