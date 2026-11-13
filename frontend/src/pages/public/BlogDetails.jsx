import { useEffect, useState, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Calendar,
  Clock,
  Eye,
  ArrowLeft,
  Copy,
  Check,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  ListFilter,
  Tag,
} from "lucide-react";
import blogService from "../../services/blogService";
import Loader from "../../components/common/Loader";
import EmptyState from "../../components/common/EmptyState";
import { formatDate } from "../../utils/formatDate";
import { formatReadingTime } from "../../utils/readingTime";
import {
  DEFAULT_ARTICLE_COVER,
  getImageUrl,
  handleArticleImageError,
} from "../../utils/imageUrl";
import "../../styles/BlogDetails.css";
import { sanitizeHtml } from "../../utils/sanitizeHtml";
import { renderMarkdownTables } from "../../utils/markdownTables";
import {
  setPageMetadata,
  trackPageView,
} from "../../utils/siteIntegrations";

// Social SVG Icons
const XTwitterIcon = ({ size = 15 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const LinkedinIcon = ({ size = 15 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9h2.8v8.37h-2.8v-8.37M7.86 6.78a1.62 1.62 0 0 0-1.63 1.62c0 .9.73 1.63 1.63 1.63.9 0 1.63-.73 1.63-1.63 0-.9-.73-1.62-1.63-1.62z" />
  </svg>
);

const FacebookIcon = ({ size = 15 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c5.05-.5 9-4.76 9-9.95z" />
  </svg>
);

function BlogDetails() {
  const { slug } = useParams();
  const [blog, setBlog] = useState(null);
  const [relatedBlogs, setRelatedBlogs] = useState([]);
  const [navigation, setNavigation] = useState({
    previousBlog: null,
    nextBlog: null,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        setLoading(true);
        setError("");
        const data = await blogService.getBlogBySlug(slug);

        if (data.success && data.blog) {
          setBlog(data.blog);
          setRelatedBlogs(data.relatedBlogs || []);
          setNavigation(
            data.navigation || { previousBlog: null, nextBlog: null }
          );

          const pageTitle =
            data.blog.seo?.title || `${data.blog.title} | TechJournal`;
          const metaDescription =
            data.blog.seo?.description ||
            data.blog.description ||
            "Read technology articles on TechJournal.";
          setPageMetadata({
            title: pageTitle,
            description: metaDescription,
            url: window.location.href,
            image: data.blog.coverImage
              ? getImageUrl(data.blog.coverImage)
              : `${window.location.origin}${DEFAULT_ARTICLE_COVER}`,
            type: "article",
          });
          trackPageView(`${window.location.pathname}${window.location.search}`);
        } else {
          setError("Article not found.");
          setPageMetadata({
            title: "Article not found | TechJournal",
            description: "The requested article could not be found.",
            url: window.location.href,
            image: `${window.location.origin}${DEFAULT_ARTICLE_COVER}`,
          });
          trackPageView(`${window.location.pathname}${window.location.search}`);
        }
      } catch (err) {
        setError(
          err.response?.data?.message ||
          "Unable to load this article. It may be in draft mode or removed."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchBlog();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [slug]);

  // SEO: Schema.org BlogPosting Structured Data Markup
  useEffect(() => {
    if (!blog) return;

    const schemaId = "techjournal-json-ld";
    let scriptTag = document.getElementById(schemaId);
    if (!scriptTag) {
      scriptTag = document.createElement("script");
      scriptTag.id = schemaId;
      scriptTag.type = "application/ld+json";
      document.head.appendChild(scriptTag);
    }

    const structuredData = {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      mainEntityOfPage: {
        "@type": "WebPage",
        "@id": window.location.href,
      },
      headline: blog.seo?.title || blog.title,
      description: blog.seo?.description || blog.description,
      image: blog.coverImage ? getImageUrl(blog.coverImage) : undefined,
      author: {
        "@type": "Person",
        name: blog.author?.name || "TechJournal Team",
      },
      publisher: {
        "@type": "Organization",
        name: "TechJournal",
        logo: {
          "@type": "ImageObject",
          url: `${window.location.origin}/favicon.svg`,
        },
      },
      datePublished: blog.publishedAt || blog.createdAt,
      dateModified: blog.updatedAt || blog.publishedAt || blog.createdAt,
    };

    scriptTag.textContent = JSON.stringify(structuredData);

    return () => {
      const el = document.getElementById(schemaId);
      if (el) el.remove();
    };
  }, [blog]);

  // Extract Table of Contents and formatted HTML from content
  const articleContent = blog?.content || "";
  const { tableOfContents, formattedHtml } = useMemo(() => {
    if (!articleContent) return { tableOfContents: [], formattedHtml: "" };

    const toc = [];
    let headingIndex = 0;

    const makeId = (text) =>
      text
        .toLowerCase()
        .replace(/[^\w\s-]/g, "")
        .replace(/\s+/g, "-");

    let processed = renderMarkdownTables(articleContent);

    // Replace Markdown headers with anchored HTML headers
    processed = processed.replace(
      /^(#{2,3})\s+(.+)$/gm,
      (match, hashes, text) => {
        headingIndex++;
        const level = hashes.length;
        const id = `heading-${headingIndex}-${makeId(text)}`;
        toc.push({ id, text: text.trim(), level });
        return `<h${level} id="${id}" class="article-anchor-heading">${text.trim()}</h${level}>`;
      }
    );

    // If no markdown headers were matched, check if HTML headings <h2> or <h3> exist
    if (toc.length === 0) {
      processed = processed.replace(
        /<h([23])([^>]*)>(.*?)<\/h\1>/gi,
        (match, level, attrs, text) => {
          headingIndex++;
          const cleanText = text.replace(/<[^>]+>/g, "").trim();
          const id = `heading-${headingIndex}-${makeId(cleanText)}`;
          toc.push({ id, text: cleanText, level: parseInt(level, 10) });
          return `<h${level} id="${id}" class="article-anchor-heading" ${attrs}>${text}</h${level}>`;
        }
      );
    }

    // Video Embeds: Convert YouTube watch links to responsive responsive iframe
    processed = processed.replace(
      /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})(?:\S*)?/g,
      '<div class="article-video-wrapper"><iframe src="https://www.youtube.com/embed/$1" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div>'
    );

    // Markdown Images: ![alt](url)
    processed = processed.replace(
      /!\[([^\]]*)\]\(([^)]+)\)/g,
      '<figure class="article-inline-figure"><img src="$2" alt="$1" class="article-inline-image" /><figcaption>$1</figcaption></figure>'
    );

    // Process remaining Markdown conventions
    processed = processed
      .replace(
        /```(\w+)?\n([\s\S]*?)```/g,
        '<div class="code-block-wrapper"><pre><code>$2</code></pre></div>'
      )
      .replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>')
      .replace(/^>\s+(.+)$/gm, '<blockquote class="article-quote">$1</blockquote>')
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.*?)\*/g, "<em>$1</em>")
      .replace(
        /\[([^\]]+)\]\(([^)]+)\)/g,
        '<a href="$2" target="_blank" rel="noopener noreferrer" class="article-link">$1</a>'
      )
      .replace(/^\s*-\s+(.+)$/gm, '<li class="article-list-item">$1</li>')
      .replace(
        /(<li class="article-list-item">[\s\S]*?<\/li>)/g,
        '<ul class="article-unordered-list">$1</ul>'
      )
      .replace(/\n{2,}/g, "</p><p>");

    if (!processed.trim().startsWith("<")) {
      processed = `<p>${processed}</p>`;
    }

    return {
      tableOfContents: toc,
      formattedHtml: sanitizeHtml(processed),
    };
  }, [articleContent]);

  const currentUrl = typeof window !== "undefined" ? window.location.href : "";

  const handleCopyLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(currentUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const shareOnTwitter = () => {
    const text = encodeURIComponent(blog?.title || "TechJournal Article");
    window.open(
      `https://twitter.com/intent/tweet?url=${encodeURIComponent(
        currentUrl
      )}&text=${text}`,
      "_blank",
      "width=600,height=400"
    );
  };

  const shareOnLinkedIn = () => {
    window.open(
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
        currentUrl
      )}`,
      "_blank",
      "width=600,height=500"
    );
  };

  const shareOnFacebook = () => {
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
        currentUrl
      )}`,
      "_blank",
      "width=600,height=450"
    );
  };

  if (loading) {
    return (
      <main className="blog-details-page">
        <Loader message="Loading article..." />
      </main>
    );
  }

  if (error || !blog) {
    return (
      <main className="blog-details-page">
        <div className="blog-details-error-wrap">
          <EmptyState
            title="Article Not Found"
            message={error || "The article you are looking for does not exist."}
            actionText="Back to All Articles"
            onAction={() => (window.location.href = "/blogs")}
          />
        </div>
      </main>
    );
  }

  return (
    <article className="blog-details-page">
      {/* Top back navigation */}
      <div className="article-top-nav">
        <Link to="/blogs" className="back-to-blogs-link">
          <ArrowLeft size={16} />
          <span>All Articles</span>
        </Link>
        <span className="breadcrumb-separator">/</span>
        <Link
          to={`/blogs?category=${encodeURIComponent(blog.category?.slug || "")}`}
          className="breadcrumb-category"
        >
          {blog.category?.name || "Technology"}
        </Link>
      </div>

      {/* Article Header & Metadata */}
      <header className="article-header">
        <div className="article-category-badge-wrap">
          <Link
            to={`/blogs?category=${encodeURIComponent(
              blog.category?.slug || ""
            )}`}
            className="article-category-badge"
          >
            {blog.category?.name || "Technology"}
          </Link>
        </div>

        <h1 className="article-main-title">{blog.title}</h1>

        <p className="article-lead-description">{blog.description}</p>

        {/* Author & Publication Details Bar */}
        <div className="article-byline-bar">
          <div className="author-card-snippet">
            <div className="author-avatar-badge">
              <BookOpen size={20} />
            </div>
            <div className="author-details">
              <span className="author-name">
                {blog.author?.name || "TechJournal Editorial"}
              </span>
              <span className="article-date-and-read">
                <Calendar size={13} />
                <span>{formatDate(blog.publishedAt || blog.createdAt)}</span>
                <span className="bullet-sep">•</span>
                <Clock size={13} />
                <span>{formatReadingTime(blog.readingTime)}</span>
                {typeof blog.views === "number" && (
                  <>
                    <span className="bullet-sep">•</span>
                    <Eye size={13} />
                    <span>{blog.views.toLocaleString()} views</span>
                  </>
                )}
              </span>
            </div>
          </div>

          {/* Social Share Group */}
          <div className="social-share-group">
            <span className="share-label">Share:</span>
            <button
              type="button"
              className="share-btn twitter"
              onClick={shareOnTwitter}
              title="Share on X / Twitter"
              aria-label="Share on X"
            >
              <XTwitterIcon size={14} />
            </button>
            <button
              type="button"
              className="share-btn linkedin"
              onClick={shareOnLinkedIn}
              title="Share on LinkedIn"
              aria-label="Share on LinkedIn"
            >
              <LinkedinIcon size={15} />
            </button>
            <button
              type="button"
              className="share-btn facebook"
              onClick={shareOnFacebook}
              title="Share on Facebook"
              aria-label="Share on Facebook"
            >
              <FacebookIcon size={15} />
            </button>
            <button
              type="button"
              className={`share-btn copy ${copied ? "copied" : ""}`}
              onClick={handleCopyLink}
              title="Copy link to clipboard"
              aria-label="Copy link"
            >
              {copied ? <Check size={15} /> : <Copy size={15} />}
            </button>
          </div>
        </div>
      </header>

      {/* Featured Cover Image */}
      <div className="article-cover-figure">
        <img
          src={
            blog.coverImage
              ? getImageUrl(blog.coverImage)
              : DEFAULT_ARTICLE_COVER
          }
          alt={blog.title}
          className="article-hero-image"
          onError={handleArticleImageError}
        />
      </div>

      {/* Article Body Layout: Sidebar TOC + Main Content */}
      <div className="article-body-layout">
        {/* Table of Contents Sticky Sidebar */}
        {tableOfContents.length > 0 && (
          <aside className="article-toc-sidebar">
            <div className="toc-sticky-box">
              <div className="toc-title-row">
                <ListFilter size={16} />
                <h3>Table of Contents</h3>
              </div>
              <nav className="toc-links-list">
                {tableOfContents.map((item) => (
                  <a
                    key={item.id}
                    href={`#${item.id}`}
                    className={`toc-link level-${item.level}`}
                    onClick={(e) => {
                      e.preventDefault();
                      const el = document.getElementById(item.id);
                      if (el) {
                        el.scrollIntoView({
                          behavior: "smooth",
                          block: "start",
                        });
                      }
                    }}
                  >
                    {item.text}
                  </a>
                ))}
              </nav>
            </div>
          </aside>
        )}

        {/* Main Formatted Article Content */}
        <section className="article-prose-container">
          <div
            className="article-prose-content"
            dangerouslySetInnerHTML={{ __html: formattedHtml }}
          />

          {/* Tags Footer */}
          {Array.isArray(blog.tags) && blog.tags.length > 0 && (
            <div className="article-tags-row">
              <span className="tags-label">
                <Tag size={15} /> Tags:
              </span>
              <div className="tags-cloud">
                {blog.tags.map((tag, i) => (
                  <Link
                    key={i}
                    to={`/blogs?search=${encodeURIComponent(tag)}`}
                    className="tag-pill"
                  >
                    #{tag}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Previous / Next Article Navigation Bar */}
          <nav className="article-prev-next-nav" aria-label="Article navigation">
            {navigation.previousBlog ? (
              <Link
                to={`/blogs/${navigation.previousBlog.slug}`}
                className="prev-next-card prev"
              >
                <div className="direction-label">
                  <ChevronLeft size={16} />
                  <span>Previous Article</span>
                </div>
                <strong className="prev-next-title">
                  {navigation.previousBlog.title}
                </strong>
              </Link>
            ) : (
              <div className="prev-next-card empty" />
            )}

            {navigation.nextBlog ? (
              <Link
                to={`/blogs/${navigation.nextBlog.slug}`}
                className="prev-next-card next"
              >
                <div className="direction-label">
                  <span>Next Article</span>
                  <ChevronRight size={16} />
                </div>
                <strong className="prev-next-title">
                  {navigation.nextBlog.title}
                </strong>
              </Link>
            ) : (
              <div className="prev-next-card empty" />
            )}
          </nav>
        </section>
      </div>

      {/* Related Articles Section */}
      {relatedBlogs.length > 0 && (
        <section className="related-articles-section">
          <div className="related-header-row">
            <h2>Related Articles</h2>
            <Link
              to={`/blogs?category=${encodeURIComponent(
                blog.category?.slug || ""
              )}`}
              className="related-view-all"
            >
              More in {blog.category?.name || "Technology"} &rarr;
            </Link>
          </div>

          <div className="related-articles-grid">
            {relatedBlogs.map((rel) => (
              <article key={rel._id} className="related-article-card">
                <Link
                  to={`/blogs/${rel.slug}`}
                  className="related-media-wrap"
                >
                  <img
                    src={
                      rel.coverImage
                        ? getImageUrl(rel.coverImage)
                        : DEFAULT_ARTICLE_COVER
                    }
                    alt={rel.title}
                    loading="lazy"
                    onError={handleArticleImageError}
                  />
                </Link>
                <div className="related-card-content">
                  <span className="related-meta">
                    {formatDate(rel.publishedAt)} •{" "}
                    {formatReadingTime(rel.readingTime)}
                  </span>
                  <h3>
                    <Link to={`/blogs/${rel.slug}`}>{rel.title}</Link>
                  </h3>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}
    </article>
  );
}

export default BlogDetails;
