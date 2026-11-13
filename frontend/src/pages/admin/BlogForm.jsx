import { useEffect, useState, useRef } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  Upload,
  Calendar,
  Save,
  Eye,
  CheckCircle,
  Clock,
  Sparkles,
  Code,
  Heading1,
  Heading2,
  Bold,
  Italic,
  List,
  Quote,
  Table as TableIcon,
  Link as LinkIcon,
  FileText,
  Image as ImageIcon,
} from "lucide-react";
import adminService from "../../services/adminService";
import categoryService from "../../services/categoryService";
import AdminLayout from "../../components/admin/AdminLayout";
import Loader from "../../components/common/Loader";
import { getImageUrl } from "../../utils/imageUrl";
import { sanitizeHtml } from "../../utils/sanitizeHtml";
import { renderMarkdownTables } from "../../utils/markdownTables";
import "../../styles/Dashboard.css";

function BlogForm() {
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const contentImageInputRef = useRef(null);
  const contentTextareaRef = useRef(null);

  // Categories list
  const [categories, setCategories] = useState([]);
  const [authors, setAuthors] = useState([]);
  const [loading, setLoading] = useState(isEditMode);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [previewMode, setPreviewMode] = useState(false);
  const [uploadingContentImage, setUploadingContentImage] = useState(false);

  // Form Fields
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [isSlugManual, setIsSlugManual] = useState(false);
  const [description, setDescription] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("");
  const [author, setAuthor] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [status, setStatus] = useState("draft");
  const [scheduledAt, setScheduledAt] = useState("");
  const [featured, setFeatured] = useState(false);
  const [seoTitle, setSeoTitle] = useState("");
  const [seoDescription, setSeoDescription] = useState("");

  // Image Upload State
  const [coverFile, setCoverFile] = useState(null);
  const [coverPreview, setCoverPreview] = useState("");
  const [existingCoverUrl, setExistingCoverUrl] = useState("");

  // Auto-generate slug from title
  const generateSlug = (text) => {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");
  };

  const handleTitleChange = (val) => {
    setTitle(val);
    if (!isSlugManual && !isEditMode) {
      setSlug(generateSlug(val));
    }
  };

  // Load Categories & Blog details if editing
  useEffect(() => {
    const init = async () => {
      try {
        const [catData, authorData] = await Promise.all([
          categoryService.getCategories(),
          adminService.getAuthors(),
        ]);
        setCategories(catData.categories || []);
        setAuthors(authorData.authors || []);
        setAuthor("");

        if (isEditMode) {
          const blogData = await adminService.getAdminBlogById(id);
          if (blogData.success && blogData.blog) {
            const b = blogData.blog;
            setTitle(b.title || "");
            setSlug(b.slug || "");
            setIsSlugManual(true);
            setDescription(b.description || "");
            setContent(b.content || "");
            setCategory(b.category?._id || b.category || "");
            setAuthor(b.author?._id || b.author || "");
            setTagsInput(Array.isArray(b.tags) ? b.tags.join(", ") : "");
            setStatus(b.status || "draft");
            setFeatured(Boolean(b.featured));
            setExistingCoverUrl(b.coverImage || "");

            if (b.scheduledAt) {
              const d = new Date(b.scheduledAt);
              const localISO = new Date(
                d.getTime() - d.getTimezoneOffset() * 60000
              )
                .toISOString()
                .slice(0, 16);
              setScheduledAt(localISO);
            }

            if (b.seo) {
              setSeoTitle(b.seo.title || "");
              setSeoDescription(b.seo.description || "");
            }
          }
        }
      } catch (err) {
        setError(
          err.response?.data?.message || "Failed to load required article data."
        );
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [id, isEditMode]);

  // Handle Cover Image selection
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.match(/^image\/(jpeg|jpg|png|webp)$/)) {
        alert("Please upload a valid JPG, PNG, or WEBP image file.");
        return;
      }
      setCoverFile(file);
      setCoverPreview(URL.createObjectURL(file));
    }
  };

  const handleContentImageChange = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    const textarea = contentTextareaRef.current;
    const insertAt = textarea?.selectionStart ?? content.length;

    try {
      setUploadingContentImage(true);
      setError("");
      const result = await adminService.uploadArticleImage(file);
      const altText = file.name.replace(/\.[^.]+$/, "").replace(/[[\]]/g, "");
      const markdown = `![${altText}](${result.imageUrl})`;
      setContent((current) =>
        `${current.slice(0, insertAt)}${markdown}${current.slice(insertAt)}`
      );
      requestAnimationFrame(() => {
        contentTextareaRef.current?.focus();
        contentTextareaRef.current?.setSelectionRange(
          insertAt + markdown.length,
          insertAt + markdown.length
        );
      });
    } catch (err) {
      setError(err.response?.data?.message || "Unable to upload article image.");
    } finally {
      setUploadingContentImage(false);
    }
  };

  // Helper to insert formatting into content textarea
  const insertFormatting = (prefix, suffix = "", defaultText = "") => {
    const textarea = contentTextareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end) || defaultText;
    const replacement = `${prefix}${selectedText}${suffix}`;

    const newContent =
      content.substring(0, start) + replacement + content.substring(end);
    setContent(newContent);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + prefix.length,
        start + prefix.length + selectedText.length
      );
    }, 50);
  };

  // Form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!title.trim()) {
      setError("Article title is required.");
      return;
    }

    if (!slug.trim()) {
      setError("Slug is required.");
      return;
    }

    if (!description.trim()) {
      setError("Short description/excerpt is required.");
      return;
    }

    if (!content.trim()) {
      setError("Article content cannot be empty.");
      return;
    }

    if (status === "scheduled") {
      if (!scheduledAt) {
        setError("Please pick a publication date and time for scheduled status.");
        return;
      }
      const schedDate = new Date(scheduledAt);
      if (schedDate <= new Date()) {
        setError("Scheduled publication time must be in the future.");
        return;
      }
    }

    try {
      setSubmitting(true);

      const formData = new FormData();
      formData.append("title", title.trim());
      formData.append("slug", slug.trim().toLowerCase());
      formData.append("description", description.trim());
      formData.append("content", content);
      formData.append("status", status);
      formData.append("featured", featured);
      formData.append("author", author);

      if (category) {
        formData.append("category", category);
      }

      if (status === "scheduled" && scheduledAt) {
        formData.append("scheduledAt", new Date(scheduledAt).toISOString());
      }

      const tagsArray = tagsInput
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
      formData.append("tags", JSON.stringify(tagsArray));

      formData.append(
        "seo",
        JSON.stringify({
          title: seoTitle.trim() || title.trim(),
          description: seoDescription.trim() || description.trim(),
        })
      );

      if (coverFile) {
        formData.append("coverImage", coverFile);
      } else if (existingCoverUrl) {
        formData.append("coverImage", existingCoverUrl);
      }

      if (isEditMode) {
        await adminService.updateBlog(id, formData);
      } else {
        await adminService.createBlog(formData);
      }

      navigate("/admin/blogs");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to save article. Please verify inputs."
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout title={isEditMode ? "Edit Article" : "Create Article"}>
        <Loader message="Loading article editor..." />
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title={isEditMode ? "Edit Article" : "Create New Article"}>
      <form onSubmit={handleSubmit} className="blog-editor-form">
        <div className="editor-top-nav">
          <Link to="/admin/blogs" className="editor-back-link">
            <ArrowLeft size={16} />
            <span>Back to Articles</span>
          </Link>

          <div className="editor-top-actions">
            <button
              type="button"
              className={`dash-btn neutral ${previewMode ? "active" : ""}`}
              onClick={() => setPreviewMode(!previewMode)}
            >
              <Eye size={16} />
              <span>{previewMode ? "Edit Mode" : "Preview"}</span>
            </button>

            <button
              type="submit"
              disabled={submitting}
              className="dash-btn primary"
            >
              <Save size={16} />
              <span>
                {submitting
                  ? "Saving..."
                  : isEditMode
                  ? "Update Article"
                  : "Save Article"}
              </span>
            </button>
          </div>
        </div>

        {error && <div className="admin-alert-error">{error}</div>}

        <div className="editor-two-column-layout">
          <div className="editor-main-column">
            <div className="editor-card">
              <label className="editor-label">
                Article Title <span className="req">*</span>
              </label>
              <input
                type="text"
                className="editor-input title-input"
                placeholder="e.g., The Architecture of Modern Distributed Systems"
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                required
              />

              <div className="slug-input-row">
                <span className="slug-prefix">URL Slug: /blogs/</span>
                <input
                  type="text"
                  className="editor-input slug-input"
                  placeholder="article-slug"
                  value={slug}
                  onChange={(e) => {
                    setIsSlugManual(true);
                    setSlug(generateSlug(e.target.value));
                  }}
                  required
                />
              </div>
            </div>

            <div className="editor-card">
              <label className="editor-label">
                Short Description / Excerpt <span className="req">*</span>
              </label>
              <textarea
                className="editor-textarea excerpt-textarea"
                rows={3}
                placeholder="A compelling 1-2 sentence overview for cards and search engines..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>

            <div className="editor-card content-card">
              <div className="content-toolbar-header">
                <span className="editor-label">
                  Article Content <span className="req">*</span>
                </span>

                <div className="editor-toolbar-buttons">
                  <button
                    type="button"
                    title="Heading 2"
                    onClick={() => insertFormatting("## ", "\n", "Section Title")}
                  >
                    <Heading1 size={15} />
                  </button>
                  <button
                    type="button"
                    title="Heading 3"
                    onClick={() => insertFormatting("### ", "\n", "Sub-section")}
                  >
                    <Heading2 size={15} />
                  </button>
                  <button
                    type="button"
                    title="Bold"
                    onClick={() => insertFormatting("**", "**", "bold text")}
                  >
                    <Bold size={15} />
                  </button>
                  <button
                    type="button"
                    title="Italic"
                    onClick={() => insertFormatting("*", "*", "italic text")}
                  >
                    <Italic size={15} />
                  </button>
                  <button
                    type="button"
                    title="Bullet List"
                    onClick={() => insertFormatting("- ", "\n", "List item")}
                  >
                    <List size={15} />
                  </button>
                  <button
                    type="button"
                    title="Quote"
                    onClick={() => insertFormatting("> ", "\n", "Quote text")}
                  >
                    <Quote size={15} />
                  </button>
                  <button
                    type="button"
                    title="Code Snippet"
                    onClick={() =>
                      insertFormatting("```javascript\n", "\n```", "// Code snippet")
                    }
                  >
                    <Code size={15} />
                  </button>
                  <button
                    type="button"
                    title="Link"
                    onClick={() =>
                      insertFormatting("[Link text](", ")", "https://example.com")
                    }
                  >
                    <LinkIcon size={15} />
                  </button>
                  <button
                    type="button"
                    title="Upload image into article"
                    aria-label="Upload image into article"
                    disabled={previewMode || uploadingContentImage}
                    onClick={() => contentImageInputRef.current?.click()}
                  >
                    <ImageIcon size={15} />
                  </button>
                  <button
                    type="button"
                    title="Table"
                    onClick={() =>
                      insertFormatting(
                        "\n| Column 1 | Column 2 |\n| --- | --- |\n| Data A | Data B |\n",
                        ""
                      )
                    }
                  >
                    <TableIcon size={15} />
                  </button>
                </div>
              </div>

              {previewMode ? (
                <div className="article-preview-pane">
                  <div className="preview-notice">
                    Article Preview (Formatting preview)
                  </div>
                  <div
                    className="article-rendered-body"
                    dangerouslySetInnerHTML={{
                      __html: sanitizeHtml(renderSimpleMarkdown(content)),
                    }}
                  />
                </div>
              ) : (
                <>
                  <input
                    ref={contentImageInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    hidden
                    onChange={handleContentImageChange}
                  />
                  <textarea
                    ref={contentTextareaRef}
                    className="editor-textarea main-content-textarea"
                    rows={16}
                    placeholder="Write rich article content using Markdown or HTML (headings, paragraphs, images, tables, links, and code blocks)..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    required
                  />
                </>
              )}
            </div>

            <div className="editor-card">
              <h3 className="card-subtitle">
                <Sparkles size={16} /> SEO & Open Graph Settings
              </h3>
              <p className="card-caption">
                Optimize how this article appears in Google search and social
                sharing previews.
              </p>

              <div className="form-group">
                <label className="editor-label">SEO Title</label>
                <input
                  type="text"
                  className="editor-input"
                  placeholder="Defaults to article title if empty"
                  value={seoTitle}
                  onChange={(e) => setSeoTitle(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="editor-label">SEO Meta Description</label>
                <textarea
                  className="editor-textarea"
                  rows={2}
                  placeholder="Defaults to short excerpt if empty"
                  value={seoDescription}
                  onChange={(e) => setSeoDescription(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="editor-side-column">
            <div className="editor-card">
              <h3 className="card-subtitle">Publishing Workflow</h3>

              <div className="workflow-radio-group">
                <label
                  className={`workflow-radio-option ${
                    status === "draft" ? "selected" : ""
                  }`}
                >
                  <input
                    type="radio"
                    name="status"
                    value="draft"
                    checked={status === "draft"}
                    onChange={() => setStatus("draft")}
                  />
                  <div>
                    <div className="option-title">
                      <FileText size={15} /> Draft
                    </div>
                    <span className="option-desc">
                      Save privately without publishing publicly.
                    </span>
                  </div>
                </label>

                <label
                  className={`workflow-radio-option ${
                    status === "published" ? "selected" : ""
                  }`}
                >
                  <input
                    type="radio"
                    name="status"
                    value="published"
                    checked={status === "published"}
                    onChange={() => setStatus("published")}
                  />
                  <div>
                    <div className="option-title">
                      <CheckCircle size={15} /> Published
                    </div>
                    <span className="option-desc">
                      Immediately available for readers.
                    </span>
                  </div>
                </label>

                <label
                  className={`workflow-radio-option ${
                    status === "scheduled" ? "selected" : ""
                  }`}
                >
                  <input
                    type="radio"
                    name="status"
                    value="scheduled"
                    checked={status === "scheduled"}
                    onChange={() => setStatus("scheduled")}
                  />
                  <div>
                    <div className="option-title">
                      <Clock size={15} /> Scheduled
                    </div>
                    <span className="option-desc">
                      Auto-publish at a specific future date and time.
                    </span>
                  </div>
                </label>
              </div>

              {status === "scheduled" && (
                <div className="scheduled-picker-box">
                  <label className="editor-label">
                    <Calendar size={14} /> Schedule Date & Time{" "}
                    <span className="req">*</span>
                  </label>
                  <input
                    type="datetime-local"
                    className="editor-input"
                    value={scheduledAt}
                    onChange={(e) => setScheduledAt(e.target.value)}
                    required={status === "scheduled"}
                  />
                  <small className="help-text">
                    Background publisher will publish this article automatically.
                  </small>
                </div>
              )}

              <hr className="editor-divider" />

              <label className="featured-toggle-label">
                <input
                  type="checkbox"
                  checked={featured}
                  onChange={(e) => setFeatured(e.target.checked)}
                />
                <span>Feature on Homepage (Editor&apos;s Pick)</span>
              </label>
            </div>

            <div className="editor-card">
              <h3 className="card-subtitle">Organization</h3>

              <div className="form-group">
                <label className="editor-label">Category</label>
                <select
                  className="editor-select"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option value="">Select Category...</option>
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat._id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="editor-label" htmlFor="article-author">
                  Author
                </label>
                <select
                  id="article-author"
                  className="editor-select"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  required
                >
                  <option value="" disabled>
                    Select an author
                  </option>
                  {authors
                    .filter((item) => item.role === "author")
                    .map((item) => (
                      <option key={item._id} value={item._id}>
                        {item.name}
                      </option>
                    ))}
                </select>
              </div>

              <div className="form-group">
                <label className="editor-label">Tags (comma-separated)</label>
                <input
                  type="text"
                  className="editor-input"
                  placeholder="e.g., nodejs, microservices, cloud"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                />
              </div>
            </div>

            <div className="editor-card">
              <h3 className="card-subtitle">Featured Cover Image</h3>

              <div className="cover-upload-area">
                {coverPreview || existingCoverUrl ? (
                  <div className="cover-preview-wrapper">
                    <img
                      src={coverPreview || getImageUrl(existingCoverUrl)}
                      alt="Cover Preview"
                      className="cover-img-preview"
                    />
                    <button
                      type="button"
                      className="change-image-btn"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      Change Image
                    </button>
                  </div>
                ) : (
                  <div
                    className="cover-dropzone"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload size={32} className="upload-icon" />
                    <strong>Upload Cover Image</strong>
                    <span>Supports JPG, PNG, WEBP up to 5MB</span>
                  </div>
                )}

                <input
                  type="file"
                  ref={fileInputRef}
                  style={{ display: "none" }}
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleImageChange}
                />
              </div>
            </div>
          </div>
        </div>
      </form>
    </AdminLayout>
  );
}

function renderSimpleMarkdown(md) {
  if (!md) return "<p><em>No content written yet.</em></p>";

  const html = renderMarkdownTables(md)
    .replace(/^### (.*$)/gim, "<h3>$1</h3>")
    .replace(/^## (.*$)/gim, "<h2>$1</h2>")
    .replace(/^# (.*$)/gim, "<h1>$1</h1>")
    .replace(/^> (.*$)/gim, "<blockquote>$1</blockquote>")
    .replace(
      /```(\w+)?\n([\s\S]*?)```/g,
      "<pre><code>$2</code></pre>"
    )
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>')
    .replace(/^- (.*$)/gim, "<li>$1</li>")
    .replace(/\n\n+/g, "</p><p>");

  return `<p>${html}</p>`;
}

export default BlogForm;
