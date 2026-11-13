import { useEffect, useState } from "react";
import {
  FolderTree,
  Plus,
  Edit,
  Trash2,
  Sparkles,
  AlertCircle,
  FolderPlus,
} from "lucide-react";
import categoryService from "../../services/categoryService";
import AdminLayout from "../../components/admin/AdminLayout";
import Loader from "../../components/common/Loader";
import EmptyState from "../../components/common/EmptyState";
import "../../styles/Dashboard.css";

function ManageCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Modal / Form state
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [isSlugManual, setIsSlugManual] = useState(false);
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);

  // Delete modal state
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await categoryService.getCategories();
      if (data.success) {
        setCategories(data.categories || []);
      }
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to load category database."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const generateSlug = (text) => {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");
  };

  const handleNameChange = (val) => {
    setName(val);
    if (!isSlugManual && !editingCategory) {
      setSlug(generateSlug(val));
    }
  };

  const openCreateModal = () => {
    setEditingCategory(null);
    setName("");
    setSlug("");
    setIsSlugManual(false);
    setDescription("");
    setError("");
    setShowModal(true);
  };

  const openEditModal = (cat) => {
    setEditingCategory(cat);
    setName(cat.name || "");
    setSlug(cat.slug || "");
    setIsSlugManual(true);
    setDescription(cat.description || "");
    setError("");
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Category name is required");
      return;
    }
    if (!slug.trim()) {
      setError("Slug is required");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const payload = {
        name: name.trim(),
        slug: slug.trim().toLowerCase(),
        description: description.trim(),
      };

      if (editingCategory) {
        await categoryService.updateCategory(editingCategory._id, payload);
        setSuccessMsg("Category updated successfully!");
      } else {
        await categoryService.createCategory(payload);
        setSuccessMsg("Category created successfully!");
      }

      setShowModal(false);
      fetchCategories();
      setTimeout(() => setSuccessMsg(""), 3500);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save category.");
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;

    try {
      setDeleting(true);
      setError("");
      await categoryService.deleteCategory(deleteTarget._id);
      setDeleteTarget(null);
      setSuccessMsg("Category deleted successfully!");
      fetchCategories();
      setTimeout(() => setSuccessMsg(""), 3500);
    } catch (err) {
      alert(
        err.response?.data?.message ||
          "Cannot delete category because articles are linked to it."
      );
    } finally {
      setDeleting(false);
    }
  };

  const handleSeedDefaults = async () => {
    try {
      setLoading(true);
      const data = await categoryService.seedDefaultCategories();
      setSuccessMsg(
        data.message || "Seeded default technology categories successfully!"
      );
      fetchCategories();
      setTimeout(() => setSuccessMsg(""), 4000);
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to seed default categories."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout title="Manage Categories">
      <div className="manage-categories-container">
        {/* Header */}
        <div className="manage-header-row">
          <div>
            <h2>Categories Management</h2>
            <p>
              Create, organize, and edit topics and categories for TechJournal
              articles.
            </p>
          </div>

          <div className="category-header-actions">
            <button
              type="button"
              className="dash-btn neutral"
              onClick={handleSeedDefaults}
              title="Populate mandatory standard tech categories if missing"
            >
              <Sparkles size={16} />
              <span>Seed Default Topics</span>
            </button>

            <button
              type="button"
              className="dash-btn primary"
              onClick={openCreateModal}
            >
              <Plus size={16} />
              <span>Add Category</span>
            </button>
          </div>
        </div>

        {error && <div className="admin-alert-error">{error}</div>}
        {successMsg && <div className="admin-alert-success">{successMsg}</div>}

        {/* Categories List */}
        {loading ? (
          <Loader message="Loading categories..." />
        ) : categories.length === 0 ? (
          <EmptyState
            title="No categories found"
            message="Organize your blog by adding technology categories or click 'Seed Default Topics' below."
            actionText="Seed Standard Topics"
            onAction={handleSeedDefaults}
            icon={FolderPlus}
          />
        ) : (
          <div className="dashboard-section-panel table-panel">
            <div className="admin-table-responsive">
              <table className="admin-custom-table">
                <thead>
                  <tr>
                    <th>Category Name</th>
                    <th>Slug</th>
                    <th>Description</th>
                    <th className="th-actions">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map((cat) => (
                    <tr key={cat._id}>
                      <td>
                        <div className="category-name-cell">
                          <FolderTree size={16} className="cat-icon" />
                          <strong>{cat.name}</strong>
                        </div>
                      </td>
                      <td>
                        <code className="category-slug-badge">
                          {cat.slug}
                        </code>
                      </td>
                      <td>
                        <p className="category-desc-cell">
                          {cat.description || "No description provided."}
                        </p>
                      </td>
                      <td className="td-actions">
                        <div className="action-buttons-group">
                          <button
                            type="button"
                            onClick={() => openEditModal(cat)}
                            className="action-icon-btn edit"
                            title="Edit Category"
                          >
                            <Edit size={15} />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(cat)}
                            className="action-icon-btn delete"
                            title="Delete Category"
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
          </div>
        )}

        {/* Create/Edit Category Modal */}
        {showModal && (
          <div className="admin-modal-overlay">
            <div className="admin-modal-card">
              <h3>
                {editingCategory ? "Edit Category" : "Create New Category"}
              </h3>
              <p>Set the display name, URL-friendly slug, and description.</p>

              <form onSubmit={handleSave} className="modal-category-form">
                <div className="form-group">
                  <label className="editor-label">Category Name</label>
                  <input
                    type="text"
                    className="editor-input"
                    placeholder="e.g. Artificial Intelligence"
                    value={name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="editor-label">URL Slug</label>
                  <input
                    type="text"
                    className="editor-input"
                    placeholder="e.g. artificial-intelligence"
                    value={slug}
                    onChange={(e) => {
                      setIsSlugManual(true);
                      setSlug(generateSlug(e.target.value));
                    }}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="editor-label">Description</label>
                  <textarea
                    className="editor-textarea"
                    rows={3}
                    placeholder="Brief description of this technology topic..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>

                <div className="admin-modal-actions">
                  <button
                    type="button"
                    className="dash-btn neutral"
                    onClick={() => setShowModal(false)}
                    disabled={saving}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="dash-btn primary"
                    disabled={saving}
                  >
                    {saving
                      ? "Saving..."
                      : editingCategory
                      ? "Update Category"
                      : "Create Category"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Modal */}
        {deleteTarget && (
          <div className="admin-modal-overlay">
            <div className="admin-modal-card">
              <div className="admin-modal-icon-warning">
                <AlertCircle size={32} />
              </div>
              <h3>Delete Category</h3>
              <p>
                Are you sure you want to delete category{" "}
                <strong>&ldquo;{deleteTarget.name}&rdquo;</strong>?
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
                  {deleting ? "Deleting..." : "Delete Category"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

export default ManageCategories;
