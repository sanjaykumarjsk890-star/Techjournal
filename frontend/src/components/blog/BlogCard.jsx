import { Link } from "react-router-dom";
import { Clock, Calendar, ArrowRight } from "lucide-react";
import { formatDate } from "../../utils/formatDate";
import { formatReadingTime } from "../../utils/readingTime";
import {
  DEFAULT_ARTICLE_COVER,
  getImageUrl,
  handleArticleImageError,
} from "../../utils/imageUrl";

function BlogCard({ blog, featured = false }) {
  if (!blog) return null;

  const cover = blog.coverImage || blog.image;
  const categoryName = blog.category?.name || "Technology";
  const authorName = blog.author?.name || "TechJournal Team";
  const dateFormatted = formatDate(blog.publishedAt || blog.createdAt);
  const readingTimeText = formatReadingTime(blog.readingTime);

  return (
    <article className={`tech-blog-card ${featured ? "featured" : ""}`}>
      <Link to={`/blogs/${blog.slug}`} className="tech-blog-card-media" tabIndex={-1}>
        <img
          src={cover ? getImageUrl(cover) : DEFAULT_ARTICLE_COVER}
          alt={blog.title}
          loading="lazy"
          onError={handleArticleImageError}
        />
      </Link>

      <div className="tech-blog-card-body">
        <div className="tech-blog-card-meta-top">
          <Link
            to={`/blogs?category=${encodeURIComponent(blog.category?.slug || "")}`}
            className="tech-blog-badge"
          >
            {categoryName}
          </Link>
          <span className="tech-blog-reading-time">
            <Clock size={13} />
            <span>{readingTimeText}</span>
          </span>
        </div>

        <h3 className="tech-blog-card-title">
          <Link to={`/blogs/${blog.slug}`}>{blog.title}</Link>
        </h3>

        <p className="tech-blog-card-desc">
          {blog.description || blog.excerpt || "Explore this technology insight."}
        </p>

        <div className="tech-blog-card-footer">
          <div className="tech-blog-author-info">
            <span className="tech-blog-author-name">{authorName}</span>
            <span className="tech-blog-date">
              <Calendar size={13} />
              <span>{dateFormatted}</span>
            </span>
          </div>

          <Link
            to={`/blogs/${blog.slug}`}
            className="tech-blog-read-more"
            aria-label={`Read ${blog.title}`}
          >
            <span>Read</span>
            <ArrowRight size={15} />
          </Link>
        </div>
      </div>
    </article>
  );
}

export default BlogCard;
