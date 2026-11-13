import { Link } from "react-router-dom";
import { TrendingUp, ArrowUpRight, Eye } from "lucide-react";

function TrendingBlogs({ blogs = [] }) {
  if (!blogs || blogs.length === 0) return null;

  return (
    <section className="trending-section-wrap">
      <div className="section-header-row">
        <div>
          <span className="section-eyebrow">
            <TrendingUp size={15} /> MOST READ
          </span>
          <h2 className="section-title">Trending Articles</h2>
          <p className="section-subtitle">
            What the technology community is reading right now.
          </p>
        </div>
      </div>

      <div className="trending-grid-layout">
        {blogs.slice(0, 5).map((blog, index) => (
          <article key={blog._id} className="trending-item-row">
            <span className="trending-rank-num">
              {String(index + 1).padStart(2, "0")}
            </span>

            <div className="trending-item-detail">
              <span className="trending-item-cat">
                {blog.category?.name || "Technology"}
              </span>
              <h3 className="trending-item-heading">
                <Link to={`/blogs/${blog.slug}`}>{blog.title}</Link>
              </h3>
              <div className="trending-item-meta">
                <span>{blog.author?.name || "TechJournal"}</span>
                {typeof blog.views === "number" && (
                  <span className="trending-views">
                    <Eye size={12} /> {blog.views.toLocaleString()} views
                  </span>
                )}
              </div>
            </div>

            <Link
              to={`/blogs/${blog.slug}`}
              className="trending-item-action"
              aria-label={`Open article ${blog.title}`}
            >
              <ArrowUpRight size={18} />
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}

export default TrendingBlogs;
