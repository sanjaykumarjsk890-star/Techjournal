import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  Plus,
  Search,
  Eye,
  Edit,
  Trash2,
  ExternalLink,
  Clock,
  Star,
  AlertCircle,
} from "lucide-react";
import adminService from "../../services/adminService";
import categoryService from "../../services/categoryService";
import AdminLayout from "../../components/admin/AdminLayout";
import Loader from "../../components/common/Loader";
import EmptyState from "../../components/common/EmptyState";
import Pagination from "../../components/common/Pagination";
import { formatDate, formatDateTime } from "../../utils/formatDate";
import {
  DEFAULT_ARTICLE_COVER,
  getImageUrl,
  handleArticleImageError,
} from "../../utils/imageUrl";
import "../../styles/Dashboard.css";

function ManageBlogs() {
  const [blogs, setBlogs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filters & Pagination State
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Delete modal state
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Fetch Categories once
  useEffect(() => {
    const fetchCats = async () => {
      try {
        const data = await categoryService.getCategories();
        setCategories(data.categories || []);
      } catch (err) {
        console.error("Failed to load categories:", err);
      }
    };
    fetchCats();
  }, []);

  const fetchBlogs = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const params = {
        page,
        limit: 10,
      };

      if (search.trim()) params.search = search.trim();
      if (status !== "all") params.status = status;
      if (selectedCategory) params.category = selectedCategory;

      const data = await adminService.getAdminBlogs(params);
      if (data.success) {
        setBlogs(data.blogs || []);
        setTotalPages(data.pagination?.totalPages || 1);
        setTotalCount(data.pagination?.total || 0);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load articles.");
    } finally {
      setLoading(false);
    }
  }, [page, search, status, selectedCategory]);

  // Fetch blogs on filter/page change with debounce for search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchBlogs();
    }, 350);

    return () => clearTimeout(timer);
  }, [fetchBlogs]);

  const confirmDelete = async () => {
    if (!deleteTarget) return;

    try {
      setDeleting(true);
      await adminService.deleteBlog(deleteTarget._id);
      setDeleteTarget(null);
      fetchBlogs();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete article");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <AdminLayout title="Manage Articles">
      <div className="manage-blogs-container">
        <div className="manage-header-row">
          <div>
            <h2>Articles Management</h2>
            <p>
              View, edit, schedule, and filter all published, draft, and upcoming
              articles ({totalCount} total).
            </p>
          </div>

          <Link to="/admin/blogs/new" className="dash-btn primary">
            <Plus size={16} />
            <span>Create New Article</span>
          </Link>
        </div>

        {error && <div className="admin-alert-error">{error}</div>}

        <div className="admin-filter-toolbar">
          <div className="status-tabs-group">
            {[
              { id: "all", label: "All" },
              { id: "published", label: "Published" },
              { id: "draft", label: "Drafts" },
              { id: "scheduled", label: "Scheduled" },
            ].map((tab) => (
              <button
                type="button"
                key={tab.id}
                className={`status-tab-btn ${status === tab.id ? "active" : ""}`}
                onClick={() => {
                  setStatus(tab.id);
                  setPage(1);
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="toolbar-search-filter">
            <div className="admin-search-box">
              <Search size={16} />
              <input
                type="search"
                placeholder="Search by title or excerpt..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
              />
            </div>

            <select
              className="admin-select-dropdown"
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setPage(1);
              }}
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <Loader message="Loading articles..." />
        ) : blogs.length === 0 ? (
          <EmptyState
            title="No articles found"
            message={
              search || status !== "all" || selectedCategory
                ? "No articles match the current filter criteria."
                : "No articles have been created yet."
            }
            actionText="Write New Article"
            onAction={() => (window.location.href = "/admin/blogs/new")}
          />
        ) : (
          <div className="dashboard-section-panel table-panel">
            <div className="admin-table-responsive">
              <table className="admin-custom-table">
                <thead>
                  <tr>
                    <th>Article Details</th>
                    <th>Category</th>
                    <th>Status</th>
                    <th>Featured</th>
                    <th>Views</th>
                    <th>Publish / Schedule Date</th>
                    <th className="th-actions">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {blogs.map((blog) => (
                    <tr key={blog._id}>
                      <td>
                        <div className="article-title-cell">
                          <img
                            src={
                              blog.coverImage
                                ? getImageUrl(blog.coverImage)
                                : DEFAULT_ARTICLE_COVER
                            }
                            alt=""
                            className="article-cell-thumb"
                            loading="lazy"
                            onError={handleArticleImageError}
                          />
                          <div>
                            <strong className="article-cell-heading">
                              {blog.title}
                            </strong>
                            <span className="article-cell-slug">
                              /{blog.slug}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="article-cell-category">
                          {blog.category?.name || "Uncategorized"}
                        </span>
                      </td>
                      <td>
                        <span className={`status-pill status-${blog.status}`}>
                          {blog.status === "scheduled" && <Clock size={12} />}
                          <span>
                            {blog.status.charAt(0).toUpperCase() +
                              blog.status.slice(1)}
                          </span>
                        </span>
                      </td>
                      <td>
                        {blog.featured ? (
                          <span
                            className="featured-indicator active"
                            title="Featured on homepage"
                          >
                            <Star size={14} className="star-fill" />
                            <span>Featured</span>
                          </span>
                        ) : (
                          <span className="featured-indicator neutral">
                            Standard
                          </span>
                        )}
                      </td>
                      <td>
                        <span className="article-cell-views">
                          <Eye size={13} /> {blog.views || 0}
                        </span>
                      </td>
                      <td>
                        <span className="article-cell-date">
                          {blog.status === "scheduled"
                            ? formatDateTime(blog.scheduledAt)
                            : formatDate(blog.publishedAt || blog.createdAt)}
                        </span>
                      </td>
                      <td className="td-actions">
                        <div className="action-buttons-group">
                          {blog.status === "published" && (
                            <Link
                              to={`/blogs/${blog.slug}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="action-icon-btn view"
                              title="View published article"
                            >
                              <ExternalLink size={15} />
                            </Link>
                          )}
                          <Link
                            to={`/admin/blogs/edit/${blog._id}`}
                            className="action-icon-btn edit"
                            title="Edit article"
                          >
                            <Edit size={15} />
                          </Link>
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(blog)}
                            className="action-icon-btn delete"
                            title="Delete article"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="table-pagination-footer">
              <span className="pagination-summary">
                Showing {blogs.length} of {totalCount} articles
              </span>
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={(p) => setPage(p)}
              />
            </div>
          </div>
        )}

        {deleteTarget && (
          <div className="admin-modal-overlay">
            <div className="admin-modal-card">
              <div className="admin-modal-icon-warning">
                <AlertCircle size={32} />
              </div>
              <h3>Delete Article</h3>
              <p>
                Are you sure you want to permanently delete{" "}
                <strong>&ldquo;{deleteTarget.title}&rdquo;</strong>? This action
                cannot be undone.
              </p>
              <div className="admin-modal-actions">
                <button
                  type="button"
                  className="dash-btn neutral"
                  onClick={() => setDeleteTarget(null)}
                  disabled={deleting}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="dash-btn danger"
                  onClick={confirmDelete}
                  disabled={deleting}
                >
                  {deleting ? "Deleting..." : "Delete Permanently"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

export default ManageBlogs;
