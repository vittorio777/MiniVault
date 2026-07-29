import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";

import CategoryMenu from "./CategoryMenu";

describe("CategoryMenu", () => {
  it("renders All and all categories", () => {
    render(
      <CategoryMenu
        categories={["animal", "movie_collection"]}
        selectedCategory="all"
        onCategoryChange={() => {}}
      />,
    );

    expect(screen.getByText("All")).toBeInTheDocument();
    expect(screen.getByText("Animal")).toBeInTheDocument();
    expect(screen.getByText("Movie Collection")).toBeInTheDocument();
  });

  it("marks the selected category", () => {
    render(
      <CategoryMenu
        categories={["animal", "movie"]}
        selectedCategory="movie"
        onCategoryChange={() => {}}
      />,
    );

    const movieButton = screen.getByRole("button", {
      name: /movie/i,
    });

    expect(movieButton).toHaveAttribute("aria-pressed", "true");

    const animalButton = screen.getByRole("button", {
      name: /animal/i,
    });

    expect(animalButton).toHaveAttribute("aria-pressed", "false");
  });

  it("calls onCategoryChange when clicked", () => {
    const onCategoryChange = vi.fn();

    render(
      <CategoryMenu
        categories={["animal", "movie"]}
        selectedCategory="all"
        onCategoryChange={onCategoryChange}
      />,
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: /animal/i,
      }),
    );

    expect(onCategoryChange).toHaveBeenCalledTimes(1);
    expect(onCategoryChange).toHaveBeenCalledWith("animal");
  });

  it("formats category names correctly", () => {
    render(
      <CategoryMenu
        categories={["movie_collection", "anime-figure", "game_model"]}
        selectedCategory="all"
        onCategoryChange={() => {}}
      />,
    );

    expect(screen.getByText("Movie Collection")).toBeInTheDocument();

    expect(screen.getByText("Anime Figure")).toBeInTheDocument();

    expect(screen.getByText("Game Model")).toBeInTheDocument();
  });
});
