import { Link, useNavigate } from "react-router-dom";
import { LogOut, ExternalLink, Shield } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

function AdminHeader({ title = "TechJournal CMS" }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="admin-header-bar">
      <div className="admin-header-left">
        <h1 className="admin-header-title">{title}</h1>
      </div>

      <div className="admin-header-right">
        <Link
          to="/"
          target="_blank"
          rel="noopener noreferrer"
          className="admin-header-btn outline-btn"
          title="Open public website in new tab"
        >
          <ExternalLink size={15} />
          <span>View Site</span>
        </Link>

        {user && (
          <div className="admin-profile-pill">
            <div className="admin-profile-avatar">
              <Shield size={16} />
            </div>
            <div className="admin-profile-info">
              <span className="admin-profile-name">{user.name || "Administrator"}</span>
              <span className="admin-profile-role">Admin</span>
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={handleLogout}
          className="admin-header-btn logout-btn"
          title="Sign out of Admin CMS"
        >
          <LogOut size={16} />
          <span>Logout</span>
        </button>
      </div>
    </header>
  );
}

export default AdminHeader;
