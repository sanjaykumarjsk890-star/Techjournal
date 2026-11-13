import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { SlidersHorizontal, Sparkles } from "lucide-react";
import blogService from "../../services/blogService";
import categoryService from "../../services/categoryService";
import BlogCard from "../../components/blog/BlogCard";
import CategoryList from "../../components/blog/CategoryList";
import SearchBar from "../../components/common/SearchBar";
import Pagination from "../../components/common/Pagination";
import Loader from "../../components/common/Loader";
import EmptyState from "../../components/common/EmptyState";
import "../../styles/Blogs.css";

function Blogs() {
  const [searchParams, setSearchParams] = useSearchParams();

  // URL state
  const search = searchParams.get("search") || "";
  const category = searchParams.get("category") || "";
  const sort = searchParams.get("sort") || "latest";
  const page = parseInt(searchParams.get("page"), 10) || 1;

  // Local input state for typing
  const [searchInput, setSearchInput] = useState(search);
  const [blogs, setBlogs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalBlogs, setTotalBlogs] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setSearchInput(search);
  }, [search]);

  // Load categories once
  useEffect(() => {
    const fetchCats = async () => {
      try {
        const data = await categoryService.getCategories();
        setCategories(data.categories || []);
      } catch (err) {
        console.error("Failed to fetch categories:", err);
      }
    };
    fetchCats();
  }, []);

  const fetchArticles = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const params = {
        page,
        limit: 9,
      };

      if (search.trim()) params.search = search.trim();
      if (category.trim()) params.category = category.trim();
      if (sort.trim()) params.sort = sort.trim();

      const data = await blogService.getAllBlogs(params);

      if (data.success) {
        setBlogs(data.blogs || []);
        setTotalPages(data.totalPages || 1);
        setTotalBlogs(data.totalBlogs || 0);
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to load articles. Please check your connection."
      );
    } finally {
      setLoading(false);
    }
  }, [page, search, category, sort]);

  // Fetch blogs whenever search, category, sort, or page changes
  useEffect(() => {
    fetchArticles();
  }, [fetchArticles]);

  const updateURLParams = (newParams) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(newParams).forEach(([key, val]) => {
      if (val) {
        next.set(key, val);
      } else {
        next.delete(key);
      }
    });
    setSearchParams(next);
  };

  // Debounce search typing into URL
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput !== search) {
        updateURLParams({ search: searchInput, page: "1" });
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [searchInput]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSearchChange = (val) => {
    setSearchInput(val);
  };

  const handleCategorySelect = (catSlugOrId) => {
    updateURLParams({ category: catSlugOrId, page: "1" });
  };

  const handleSortChange = (newSort) => {
    updateURLParams({ sort: newSort, page: "1" });
  };

  const handlePageChange = (newPage) => {
    updateURLParams({ page: String(newPage) });
    window.scrollTo({ top: 300, behavior: "smooth" });
  };

  const handleResetFilters = () => {
    setSearchInput("");
    setSearchParams({});
  };

  return (
    <main className="blogs-listing-page">
      {/* Header Banner */}
      <section className="blogs-header-banner">
        <div className="blogs-header-content">
          <span className="blogs-eyebrow">
            <Sparkles size={14} /> TECHJOURNAL LIBRARY
          </span>
          <h1>Technology Insights &amp; Articles</h1>
          <p>
            Explore perspectives on artificial intelligence, cloud computing,
            software architecture, cybersecurity, and modern engineering.
          </p>
        </div>
      </section>

      {/* Filter and Search Bar Section */}
      <section className="blogs-filter-section">
        <div className="blogs-filter-row">
          <SearchBar
            value={searchInput}
            onChange={handleSearchChange}
            onClear={() => handleSearchChange("")}
            placeholder="Search articles by title, keywords, or topics..."
            className="blogs-search-input-wrap"
          />

          <div className="blogs-sort-dropdown-wrap">
            <SlidersHorizontal size={16} className="sort-icon" />
            <select
              value={sort}
              onChange={(e) => handleSortChange(e.target.value)}
              className="blogs-sort-select"
              aria-label="Sort articles"
            >
              <option value="latest">Sort: Newest First</option>
              <option value="trending">Sort: Most Popular</option>
              <option value="oldest">Sort: Oldest First</option>
            </select>
          </div>
        </div>

        {/* Category Pills Bar */}
        <div className="blogs-category-pills-bar">
          <CategoryList
            categories={categories}
            activeCategory={category}
            onSelectCategory={handleCategorySelect}
            showAll={true}
          />
        </div>
      </section>

      {/* Active filters feedback */}
      {(search || category || sort !== "latest") && (
        <div className="active-filter-indicators">
          <span className="results-count">
            Found <strong>{totalBlogs}</strong> article
            {totalBlogs === 1 ? "" : "s"}
          </span>
          <button
            type="button"
            className="reset-filters-btn"
            onClick={handleResetFilters}
          >
            Clear all filters
          </button>
        </div>
      )}

      {error && <div className="blogs-alert-error">{error}</div>}

      {/* Articles Grid / Loading / Empty */}
      {loading ? (
        <Loader message="Loading technology articles..." />
      ) : blogs.length === 0 ? (
        <EmptyState
          title="No articles match your criteria"
          message="Try different search terms or clear your active category filters to browse all articles."
          actionText="Show All Articles"
          onAction={handleResetFilters}
        />
      ) : (
        <>
          <section className="blogs-cards-grid">
            {blogs.map((blog) => (
              <BlogCard key={blog._id} blog={blog} />
            ))}
          </section>

          {/* Pagination */}
          <div className="blogs-pagination-wrap">
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        </>
      )}
    </main>
  );
}

export default Blogs;
