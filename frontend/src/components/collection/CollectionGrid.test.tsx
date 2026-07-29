import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";

import type { Collectible } from "@/types/collectible";

import CollectionGrid from "./CollectionGrid";

vi.mock("./CollectionCard", () => ({
  default: ({
    collectible,
    onClick,
  }: {
    collectible: Collectible;
    onClick: (collectible: Collectible) => void;
  }) => (
    <button type="button" onClick={() => onClick(collectible)}>
      {collectible.title}
    </button>
  ),
}));

describe("CollectionGrid", () => {
  const onCollectibleClick = vi.fn();

  const collectibles = [
    {
      id: 1,
      userId: 10,
      title: "Robot Figure",
      category: "robot",
      description: "A miniature robot",
      originalImageUrl: "/images/robot-original.png",
      generatedImageUrl: "/images/robot-generated.png",
      createdAt: "2026-07-29T10:00:00.000Z",
      updatedAt: "2026-07-29T10:00:00.000Z",
    },
    {
      id: 2,
      userId: 10,
      title: "Cat Figure",
      category: "animal",
      description: "A miniature cat",
      originalImageUrl: "/images/cat-original.png",
      generatedImageUrl: "/images/cat-generated.png",
      createdAt: "2026-07-29T11:00:00.000Z",
      updatedAt: "2026-07-29T11:00:00.000Z",
    },
  ] satisfies Collectible[];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows the empty state when there are no collectibles", () => {
    render(
      <CollectionGrid
        collectibles={[]}
        onCollectibleClick={onCollectibleClick}
      />,
    );

    expect(screen.getByText("Your vault is waiting")).toBeInTheDocument();

    expect(
      screen.getByText(
        "Add your first photo and turn it into a miniature collectible.",
      ),
    ).toBeInTheDocument();
  });

  it("renders all collectibles", () => {
    render(
      <CollectionGrid
        collectibles={collectibles}
        onCollectibleClick={onCollectibleClick}
      />,
    );

    expect(
      screen.getByRole("button", {
        name: "Robot Figure",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", {
        name: "Cat Figure",
      }),
    ).toBeInTheDocument();
  });

  it("calls onCollectibleClick with the clicked collectible", () => {
    render(
      <CollectionGrid
        collectibles={collectibles}
        onCollectibleClick={onCollectibleClick}
      />,
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: "Cat Figure",
      }),
    );

    expect(onCollectibleClick).toHaveBeenCalledTimes(1);
    expect(onCollectibleClick).toHaveBeenCalledWith(collectibles[1]);
  });
});
