import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Lock, Mail, Eye, EyeOff, ShieldCheck, ArrowLeft } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import BrandMark from "../../components/common/BrandMark";

function Login() {
  const { login, loading } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const user = await login(email.trim(), password);

      if (user.role !== "admin") {
        setError("This account does not have administrator access.");
        return;
      }

      navigate("/admin");
    } catch {
      setError("Unable to sign in. Check your email and password, then try again.");
    }
  };

  return (
    <div className="login-page-wrap">
      <div className="login-card-container">
        <div className="login-card-header">
          <Link to="/" className="login-logo-link">
            <BrandMark size={30} className="login-brand-mark" />
            <span>TechJournal</span>
          </Link>
          <h2>Admin Sign In</h2>
          <p>Welcome back. Sign in to manage TechJournal.</p>
        </div>

        {error && (
          <div className="login-error-alert" role="alert">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="login-form-body">
          <div className="login-form-field">
            <label htmlFor="login-email">Email address</label>
            <div className="login-input-group">
              <Mail size={17} className="input-icon" />
              <input
                id="login-email"
                type="email"
                placeholder="admin@techjournal.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>
          </div>

          <div className="login-form-field">
            <label htmlFor="login-password">Password</label>
            <div className="login-input-group">
              <Lock size={17} className="input-icon" />
              <input
                id="login-password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                className="toggle-password-btn"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="login-submit-btn"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div className="login-card-footer">
          <Link to="/" className="back-to-site-link">
            <ArrowLeft size={14} /> Back to TechJournal
          </Link>
          <span className="secure-badge">
            <ShieldCheck size={14} /> Admin access
          </span>
        </div>
      </div>
    </div>
  );
}

export default Login;
