import "./CategoryMenu.css";

interface CategoryMenuProps {
  categories: string[];
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
}

function formatCategoryLabel(category: string): string {
  if (category.trim().toLowerCase() === "all") {
    return "All";
  }

  return category
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

export default function CategoryMenu({
  categories,
  selectedCategory,
  onCategoryChange,
}: CategoryMenuProps) {
  const menuItems = ["all", ...categories];

  return (
    <nav aria-label="Collectible categories" className="category-menu">
      {menuItems.map((category) => {
        const isSelected = selectedCategory === category;
        const label = formatCategoryLabel(category);

        return (
          <button
            key={category}
            type="button"
            aria-pressed={isSelected}
            onClick={() => onCategoryChange(category)}
            className={`category-menu__item ${
              isSelected ? "category-menu__item--selected" : ""
            }`}
          >
            <span
              aria-hidden="true"
              className={`category-menu__indicator ${
                isSelected ? "category-menu__indicator--selected" : ""
              }`}
            />

            <span className="category-menu__label">{label}</span>
          </button>
        );
      })}
    </nav>
  );
}
