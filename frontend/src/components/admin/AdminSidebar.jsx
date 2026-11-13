import { NavLink, Link } from "react-router-dom";
import {
  LayoutDashboard,
  FileText,
  PenSquare,
  FolderTree,
  Globe,
  UsersRound,
} from "lucide-react";

function AdminSidebar() {
  return (
    <aside className="admin-sidebar-pane">
      <div className="admin-sidebar-brand">
        <Link to="/admin" className="admin-brand-link">
          <div className="admin-brand-text">
            <strong>TechJournal</strong>
          </div>
        </Link>
      </div>

      <nav className="admin-sidebar-menu">
        <div className="admin-menu-group-label">OVERVIEW</div>
        <NavLink
          to="/admin"
          end
          className={({ isActive }) =>
            `admin-menu-link ${isActive ? "active" : ""}`
          }
        >
          <LayoutDashboard size={18} />
          <span>Dashboard</span>
        </NavLink>

        <div className="admin-menu-group-label">CONTENT MANAGEMENT</div>
        <NavLink
          to="/admin/blogs"
          end
          className={({ isActive }) =>
            `admin-menu-link ${isActive ? "active" : ""}`
          }
        >
          <FileText size={18} />
          <span>Manage Articles</span>
        </NavLink>

        <NavLink
          to="/admin/blogs/new"
          className={({ isActive }) =>
            `admin-menu-link ${isActive ? "active" : ""}`
          }
        >
          <PenSquare size={18} />
          <span>Create Article</span>
        </NavLink>

        <NavLink
          to="/admin/categories"
          className={({ isActive }) =>
            `admin-menu-link ${isActive ? "active" : ""}`
          }
        >
          <FolderTree size={18} />
          <span>Categories</span>
        </NavLink>

        <NavLink
          to="/admin/authors"
          className={({ isActive }) =>
            `admin-menu-link ${isActive ? "active" : ""}`
          }
        >
          <UsersRound size={18} />
          <span>Authors</span>
        </NavLink>
      </nav>

      <div className="admin-sidebar-footer">
        <Link to="/" className="admin-return-link">
          <Globe size={16} />
          <span>Back to Main Blog</span>
        </Link>
      </div>
    </aside>
  );
}

export default AdminSidebar;
