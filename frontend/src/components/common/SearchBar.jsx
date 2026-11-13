import { Search, X } from "lucide-react";

function SearchBar({
  value,
  onChange,
  onClear,
  placeholder = "Search articles by title, keyword, or topic...",
  className = "",
}) {
  return (
    <div className={`common-search-bar ${className}`}>
      <Search className="search-icon" size={18} />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="search-input"
        aria-label="Search"
      />
      {value && onClear && (
        <button
          type="button"
          onClick={onClear}
          className="search-clear-btn"
          aria-label="Clear search"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
}

export default SearchBar;
