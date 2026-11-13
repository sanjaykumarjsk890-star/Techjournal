import { useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { Search, Menu, X, Shield, LogOut } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import BrandMark from "../common/BrandMark";
import "../../styles/Navbar.css";

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const isTrendingPage =
    location.pathname === "/blogs" &&
    new URLSearchParams(location.search).get("sort") === "trending";

  const closeMenu = () => setMenuOpen(false);

  const handleLogout = () => {
    logout();
    closeMenu();
    navigate("/");
  };

  return (
    <header className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo" onClick={closeMenu}>
          <BrandMark size={32} className="navbar-brand-icon" />
          <span className="navbar-brand-title">TechJournal</span>
        </Link>

        <button
          className="mobile-menu-btn"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle navigation"
          aria-expanded={menuOpen}
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>

        <nav className={`navbar-links ${menuOpen ? "active" : ""}`}>
          <NavLink
            to="/"
            end
            className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
            onClick={closeMenu}
          >
            Home
          </NavLink>

          <NavLink
            to="/blogs"
            end
            className={({ isActive }) =>
              isActive && !isTrendingPage ? "nav-link active" : "nav-link"
            }
            onClick={closeMenu}
          >
            Articles
          </NavLink>

          <NavLink
            to="/blogs?sort=trending"
            className={() =>
              isTrendingPage ? "nav-link active" : "nav-link"
            }
            onClick={closeMenu}
          >
            Trending
          </NavLink>

          <Link to="/blogs" className="navbar-search" onClick={closeMenu}>
            <Search size={16} />
            <span>Search</span>
          </Link>

          {user && user.role === "admin" ? (
            <div className="navbar-admin-user-group">
              <NavLink to="/admin" className="navbar-admin-pill" onClick={closeMenu}>
                <Shield size={14} />
                <span>Admin CMS</span>
              </NavLink>
              <button
                type="button"
                className="navbar-logout-btn"
                onClick={handleLogout}
                title="Log out"
              >
                <LogOut size={15} />
              </button>
            </div>
          ) : (
            <NavLink to="/login" className="navbar-login" onClick={closeMenu}>
              Admin Login
            </NavLink>
          )}
        </nav>
      </div>
    </header>
  );
}

export default Navbar;
