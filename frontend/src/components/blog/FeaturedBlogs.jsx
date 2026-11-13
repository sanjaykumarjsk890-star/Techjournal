import { Link } from "react-router-dom";
import { ArrowRight, Clock, Calendar } from "lucide-react";
import { formatDate } from "../../utils/formatDate";
import { formatReadingTime } from "../../utils/readingTime";
import {
  DEFAULT_ARTICLE_COVER,
  getImageUrl,
  handleArticleImageError,
} from "../../utils/imageUrl";

function FeaturedBlogs({ blogs = [] }) {
  if (!blogs || blogs.length === 0) return null;

  const [leadBlog, ...secondaryBlogs] = blogs;

  return (
    <section className="featured-section-wrap">
      <div className="section-header-row">
        <div>
          <h2 className="section-title">Featured Stories</h2>
          <p className="section-subtitle">
            Handpicked technology insights and analysis from our editors.
          </p>
        </div>

        <Link to="/blogs" className="section-link-more">
          View all articles <ArrowRight size={16} />
        </Link>
      </div>

      <div className="featured-showcase-grid">
        {/* Primary Lead Feature */}
        {leadBlog && (
          <article className="featured-lead-card">
            <Link
              to={`/blogs/${leadBlog.slug}`}
              className="featured-lead-media"
            >
              <img
                src={
                  leadBlog.coverImage
                    ? getImageUrl(leadBlog.coverImage)
                    : DEFAULT_ARTICLE_COVER
                }
                alt={leadBlog.title}
                loading="lazy"
                onError={handleArticleImageError}
              />
              <span className="featured-tag">Featured</span>
            </Link>

            <div className="featured-lead-content">
              <div className="featured-meta-row">
                <span className="featured-category">
                  {leadBlog.category?.name || "Technology"}
                </span>
                <span className="featured-reading-time">
                  <Clock size={13} /> {formatReadingTime(leadBlog.readingTime)}
                </span>
              </div>

              <h3 className="featured-lead-title">
                <Link to={`/blogs/${leadBlog.slug}`}>{leadBlog.title}</Link>
              </h3>

              <p className="featured-lead-excerpt">{leadBlog.description}</p>

              <div className="featured-author-row">
                <div className="featured-author-info">
                  <strong>{leadBlog.author?.name || "Editorial Team"}</strong>
                  <span>
                    <Calendar size={13} /> {formatDate(leadBlog.publishedAt)}
                  </span>
                </div>

                <Link
                  to={`/blogs/${leadBlog.slug}`}
                  className="featured-read-btn"
                >
                  Read Story <ArrowRight size={15} />
                </Link>
              </div>
            </div>
          </article>
        )}

        {/* Secondary Stacked Features */}
        {secondaryBlogs.length > 0 && (
          <div className="featured-secondary-stack">
            {secondaryBlogs.slice(0, 3).map((blog) => (
              <article key={blog._id} className="featured-secondary-card">
                <Link
                  to={`/blogs/${blog.slug}`}
                  className="featured-secondary-media"
                >
                  <img
                    src={
                      blog.coverImage
                        ? getImageUrl(blog.coverImage)
                        : DEFAULT_ARTICLE_COVER
                    }
                    alt={blog.title}
                    loading="lazy"
                    onError={handleArticleImageError}
                  />
                </Link>

                <div className="featured-secondary-body">
                  <span className="featured-secondary-cat">
                    {blog.category?.name || "Technology"}
                  </span>
                  <h4>
                    <Link to={`/blogs/${blog.slug}`}>{blog.title}</Link>
                  </h4>
                  <div className="featured-secondary-meta">
                    <span>{formatDate(blog.publishedAt)}</span>
                    <span>•</span>
                    <span>{formatReadingTime(blog.readingTime)}</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default FeaturedBlogs;
