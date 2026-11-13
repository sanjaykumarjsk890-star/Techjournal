import { useEffect, useState } from "react";
import { Edit, Plus, Trash2, UsersRound } from "lucide-react";
import adminService from "../../services/adminService";
import AdminLayout from "../../components/admin/AdminLayout";
import Loader from "../../components/common/Loader";
import EmptyState from "../../components/common/EmptyState";
import "../../styles/Dashboard.css";

function ManageAuthors() {
  const [authors, setAuthors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingAuthor, setEditingAuthor] = useState(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const loadAuthors = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await adminService.getAuthors();
      setAuthors((data.authors || []).filter((author) => author.role === "author"));
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load authors.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAuthors();
  }, []);

  const openModal = (author = null) => {
    setEditingAuthor(author);
    setName(author?.name || "");
    setEmail(author?.email || "");
    setPassword("");
    setError("");
    setModalOpen(true);
  };

  const saveAuthor = async (event) => {
    event.preventDefault();
    setError("");

    try {
      setSaving(true);
      if (editingAuthor) {
        await adminService.updateAuthor(editingAuthor._id, { name, email });
      } else {
        await adminService.createAuthor({ name, email, password });
      }
      setModalOpen(false);
      await loadAuthors();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to save author.");
    } finally {
      setSaving(false);
    }
  };

  const removeAuthor = async (author) => {
    if (!window.confirm(`Delete author "${author.name}"?`)) return;

    try {
      setError("");
      await adminService.deleteAuthor(author._id);
      await loadAuthors();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to delete author.");
    }
  };

  return (
    <AdminLayout title="Manage Authors">
      <div className="manage-categories-container">
        <div className="manage-header-row">
          <div>
            <h2>Authors</h2>
            <p>Create and update the authors shown on published articles.</p>
          </div>
          <button
            type="button"
            className="dash-btn primary"
            onClick={() => openModal()}
          >
            <Plus size={16} />
            <span>Add Author</span>
          </button>
        </div>

        {error && <div className="admin-alert-error" role="alert">{error}</div>}

        {loading ? (
          <Loader message="Loading authors..." />
        ) : authors.length === 0 ? (
          <EmptyState
            title="No authors added"
            message="Add an author profile to assign articles to a named writer."
            actionText="Add Author"
            onAction={() => openModal()}
            icon={UsersRound}
          />
        ) : (
          <div className="dashboard-section-panel table-panel">
            <div className="admin-table-responsive">
              <table className="admin-custom-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Created</th>
                    <th className="th-actions">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {authors.map((author) => (
                    <tr key={author._id}>
                      <td><strong>{author.name}</strong></td>
                      <td>{author.email}</td>
                      <td>{new Date(author.createdAt).toLocaleDateString()}</td>
                      <td className="td-actions">
                        <div className="action-buttons-group">
                          <button
                            type="button"
                            className="action-icon-btn edit"
                            title={`Edit ${author.name}`}
                            aria-label={`Edit ${author.name}`}
                            onClick={() => openModal(author)}
                          >
                            <Edit size={15} />
                          </button>
                          <button
                            type="button"
                            className="action-icon-btn delete"
                            title={`Delete ${author.name}`}
                            aria-label={`Delete ${author.name}`}
                            onClick={() => removeAuthor(author)}
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

        {modalOpen && (
          <div className="admin-modal-overlay">
            <div className="admin-modal-card">
              <h3>{editingAuthor ? "Edit Author" : "Add Author"}</h3>
              <p>
                {editingAuthor
                  ? "Update the author profile details."
                  : "Create an author login with a temporary password of at least 12 characters."}
              </p>
              {error && <div className="admin-alert-error" role="alert">{error}</div>}
              <form className="modal-category-form" onSubmit={saveAuthor}>
                <div className="form-group">
                  <label className="editor-label" htmlFor="author-name">Name</label>
                  <input
                    id="author-name"
                    className="editor-input"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="editor-label" htmlFor="author-email">Email</label>
                  <input
                    id="author-email"
                    type="email"
                    className="editor-input"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    required
                  />
                </div>
                {!editingAuthor && (
                  <div className="form-group">
                    <label className="editor-label" htmlFor="author-password">
                      Temporary Password
                    </label>
                    <input
                      id="author-password"
                      type="password"
                      className="editor-input"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      minLength={12}
                      autoComplete="new-password"
                      required
                    />
                  </div>
                )}
                <div className="admin-modal-actions">
                  <button
                    type="button"
                    className="dash-btn neutral"
                    onClick={() => setModalOpen(false)}
                    disabled={saving}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="dash-btn primary"
                    disabled={saving}
                  >
                    {saving ? "Saving..." : editingAuthor ? "Save Changes" : "Create Author"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

export default ManageAuthors;
