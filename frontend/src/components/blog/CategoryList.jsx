import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";

function CategoryList({
  categories = [],
  activeCategory = "",
  onSelectCategory,
  asLinks = false,
  showAll = true,
}) {
  if (!categories || categories.length === 0) return null;

  return (
    <div className="category-pill-container" role="tablist">
      {showAll && !asLinks && (
        <button
          type="button"
          className={`category-pill ${activeCategory === "" ? "active" : ""}`}
          onClick={() => onSelectCategory && onSelectCategory("")}
          role="tab"
          aria-selected={activeCategory === ""}
        >
          All Topics
        </button>
      )}

      {categories.map((cat) => {
        const isSelected =
          activeCategory === cat._id || activeCategory === cat.slug;

        if (asLinks) {
          return (
            <Link
              key={cat._id}
              to={`/blogs?category=${encodeURIComponent(cat.slug)}`}
              className="category-pill category-link"
            >
              <span>{cat.name}</span>
              <ArrowUpRight size={14} className="cat-arrow" />
            </Link>
          );
        }

        return (
          <button
            type="button"
            key={cat._id}
            className={`category-pill ${isSelected ? "active" : ""}`}
            onClick={() =>
              onSelectCategory &&
              onSelectCategory(isSelected ? "" : cat._id || cat.slug)
            }
            role="tab"
            aria-selected={isSelected}
          >
            {cat.name}
          </button>
        );
      })}
    </div>
  );
}

export default CategoryList;
