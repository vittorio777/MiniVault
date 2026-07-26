interface CategoryMenuProps {
  categories: string[];
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
}

export default function CategoryMenu({
  categories,
  selectedCategory,
  onCategoryChange,
}: CategoryMenuProps) {
  return (
    <div>
      <button
        type="button"
        onClick={() => onCategoryChange("all")}
        disabled={selectedCategory === "all"}
      >
        All
      </button>

      {categories.map((category) => (
        <button
          key={category}
          type="button"
          onClick={() => onCategoryChange(category)}
          disabled={selectedCategory === category}
        >
          {category}
        </button>
      ))}
    </div>
  );
}
