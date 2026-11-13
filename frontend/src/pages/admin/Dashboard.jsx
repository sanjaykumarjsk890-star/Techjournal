import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  FileText,
  CheckCircle2,
  FileEdit,
  Clock,
  FolderTree,
  Eye,
  Plus,
  ArrowRight,
  ExternalLink,
  Edit,
  Trash2,
} from "lucide-react";
import adminService from "../../services/adminService";
import AdminLayout from "../../components/admin/AdminLayout";
import Loader from "../../components/common/Loader";
import EmptyState from "../../components/common/EmptyState";
import { formatDate, formatDateTime } from "../../utils/formatDate";
import {
  DEFAULT_ARTICLE_COVER,
  getImageUrl,
  handleArticleImageError,
} from "../../utils/imageUrl";
import "../../styles/Dashboard.css";

function Dashboard() {
  const [stats, setStats] = useState({
    totalArticles: 0,
    publishedArticles: 0,
    draftArticles: 0,
    scheduledArticles: 0,
    totalCategories: 0,
    totalViews: 0,
  });
  const [recentArticles, setRecentArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const data = await adminService.getDashboardStats();
      if (data.success) {
        setStats(data.stats || {});
        setRecentArticles(data.recentArticles || []);
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to load dashboard metrics. Ensure backend is running."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    if (mounted) {
      fetchDashboardData();
    }
    return () => {
      mounted = false;
    };
  }, [fetchDashboardData]);

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"?`)) return;

    try {
      await adminService.deleteBlog(id);
      fetchDashboardData();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete article");
    }
  };

  return (
    <AdminLayout title="Dashboard Overview">
      <div className="dashboard-page-container">
        {/* Welcome & Quick Action Header */}
        <div className="dashboard-welcome-banner">
          <div>
            <h2>Editorial Dashboard</h2>
            <p>
              Manage publishing workflows, track readership metrics, and organize
              content across TechJournal.
            </p>
          </div>

          <div className="dashboard-banner-actions">
            <Link to="/admin/blogs/new" className="dash-btn primary">
              <Plus size={16} />
              <span>New Article</span>
            </Link>
            <Link to="/admin/categories" className="dash-btn secondary">
              <FolderTree size={16} />
              <span>Categories</span>
            </Link>
          </div>
        </div>

        {error && <div className="admin-alert-error">{error}</div>}

        {loading ? (
          <Loader message="Loading dashboard metrics..." />
        ) : (
          <>
            {/* Stat Cards Grid */}
            <div className="dashboard-metrics-grid">
              <div className="dashboard-primary-metrics-grid">
                <div className="metric-card total">
                  <div className="metric-icon-wrap">
                    <FileText size={22} />
                  </div>
                  <div className="metric-info">
                    <span className="metric-label">Total Articles</span>
                    <strong className="metric-number">
                      {stats.totalArticles ?? 0}
                    </strong>
                  </div>
                </div>

                <div className="metric-card published">
                  <div className="metric-icon-wrap">
                    <CheckCircle2 size={22} />
                  </div>
                  <div className="metric-info">
                    <span className="metric-label">Published</span>
                    <strong className="metric-number">
                      {stats.publishedArticles ?? 0}
                    </strong>
                  </div>
                </div>

                <div className="metric-card drafts">
                  <div className="metric-icon-wrap">
                    <FileEdit size={22} />
                  </div>
                  <div className="metric-info">
                    <span className="metric-label">Drafts</span>
                    <strong className="metric-number">
                      {stats.draftArticles ?? 0}
                    </strong>
                  </div>
                </div>

                <div className="metric-card scheduled">
                  <div className="metric-icon-wrap">
                    <Clock size={22} />
                  </div>
                  <div className="metric-info">
                    <span className="metric-label">Scheduled</span>
                    <strong className="metric-number">
                      {stats.scheduledArticles ?? 0}
                    </strong>
                  </div>
                </div>
              </div>

              <div className="dashboard-secondary-metrics-grid">
                <div className="metric-card categories">
                  <div className="metric-icon-wrap">
                    <FolderTree size={22} />
                  </div>
                  <div className="metric-info">
                    <span className="metric-label">Categories</span>
                    <strong className="metric-number">
                      {stats.totalCategories ?? 0}
                    </strong>
                  </div>
                </div>

                <div className="metric-card views">
                  <div className="metric-icon-wrap">
                    <Eye size={22} />
                  </div>
                  <div className="metric-info">
                    <span className="metric-label">Total Views</span>
                    <strong className="metric-number">
                      {(stats.totalViews || 0).toLocaleString()}
                    </strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Articles Table Section */}
            <div className="dashboard-section-panel">
              <div className="panel-header-row">
                <div>
                  <h3 className="panel-title">Recent Articles</h3>
                  <p className="panel-subtitle">
                    Latest drafted, scheduled, and published content
                  </p>
                </div>
                <Link to="/admin/blogs" className="panel-header-link">
                  <span>View all articles</span>
                  <ArrowRight size={15} />
                </Link>
              </div>

              {recentArticles.length === 0 ? (
                <EmptyState
                  title="No articles yet"
                  message="Start publishing technology content by creating your first article."
                  actionText="Create Article"
                  onAction={() => (window.location.href = "/admin/blogs/new")}
                />
              ) : (
                <div className="admin-table-responsive">
                  <table className="admin-custom-table">
                    <thead>
                      <tr>
                        <th>Article</th>
                        <th>Category</th>
                        <th>Status</th>
                        <th>Views</th>
                        <th>Date</th>
                        <th className="th-actions">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentArticles.map((article) => (
                        <tr key={article._id}>
                          <td>
                            <div className="article-title-cell">
                              <img
                                src={
                                  article.coverImage
                                    ? getImageUrl(article.coverImage)
                                    : DEFAULT_ARTICLE_COVER
                                }
                                alt=""
                                className="article-cell-thumb"
                                loading="lazy"
                                onError={handleArticleImageError}
                              />
                              <div>
                                <strong className="article-cell-heading">
                                  {article.title}
                                </strong>
                                <span className="article-cell-slug">
                                  /{article.slug}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td>
                            <span className="article-cell-category">
                              {article.category?.name || "General"}
                            </span>
                          </td>
                          <td>
                            <span
                              className={`status-pill status-${article.status}`}
                            >
                              {article.status === "scheduled" && (
                                <Clock size={12} />
                              )}
                              <span>
                                {article.status.charAt(0).toUpperCase() +
                                  article.status.slice(1)}
                              </span>
                            </span>
                          </td>
                          <td>
                            <span className="article-cell-views">
                              <Eye size={13} /> {article.views || 0}
                            </span>
                          </td>
                          <td>
                            <span className="article-cell-date">
                              {article.status === "scheduled"
                                ? formatDateTime(article.scheduledAt)
                                : formatDate(
                                    article.publishedAt || article.createdAt
                                  )}
                            </span>
                          </td>
                          <td className="td-actions">
                            <div className="action-buttons-group">
                              {article.status === "published" && (
                                <Link
                                  to={`/blogs/${article.slug}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="action-icon-btn view"
                                  title="View on public site"
                                >
                                  <ExternalLink size={15} />
                                </Link>
                              )}
                              <Link
                                to={`/admin/blogs/edit/${article._id}`}
                                className="action-icon-btn edit"
                                title="Edit article"
                              >
                                <Edit size={15} />
                              </Link>
                              <button
                                type="button"
                                onClick={() =>
                                  handleDelete(article._id, article.title)
                                }
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
              )}
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
}

export default Dashboard;
