import { Link } from "react-router-dom";
import {
  BookOpen,
  CircleHelp,
  Code2,
  Search,
  TrendingUp,
  X,
} from "lucide-react";
import BrandMark from "../common/BrandMark";
import { contactEmail, socialLinks } from "../../utils/siteIntegrations";
import "../../styles/Footer.css";

const footerActions = [
  { to: "/blogs", label: "Browse articles", Icon: BookOpen },
  { to: "/blogs?sort=trending", label: "Trending articles", Icon: TrendingUp },
  { to: "/blogs", label: "Search articles", Icon: Search },
];

const socialUrlByLabel = new Map([
  ["github", "https://github.com/"],
  ["linkedin", "https://www.linkedin.com/"],
  ["x", "https://x.com/"],
  ...socialLinks.map(({ label, url }) => [label.toLowerCase(), url]),
]);

const footerSocialProfiles = [
  { label: "GitHub", url: socialUrlByLabel.get("github"), Icon: Code2 },
  { label: "LinkedIn", url: socialUrlByLabel.get("linkedin"), monogram: "in" },
  { label: "X / Twitter", url: socialUrlByLabel.get("x"), Icon: X },
];

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-main">
        <div className="footer-about">
          <Link to="/" className="footer-main-brand">
            <BrandMark size={34} />
            <span>TechJournal</span>
          </Link>
          <p className="footer-company-details">
            Technology, software development, and industry insights from TechJournal.
          </p>
          <nav className="footer-social-links" aria-label="Social media">
            {footerSocialProfiles.map(({ label, url, Icon, monogram }) => {
              const content = Icon ? (
                <Icon size={19} strokeWidth={2} aria-hidden="true" />
              ) : (
                <span className="footer-social-monogram" aria-hidden="true">
                  {monogram}
                </span>
              );

              return (
                <a
                  key={label}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  title={label}
                >
                  {content}
                </a>
              );
            })}
          </nav>
        </div>

        <div className="footer-link-column">
          <span className="footer-column-label">Explore</span>
          <nav className="footer-actions" aria-label="Quick links">
            {footerActions.map(({ to, label, Icon }) => (
              <Link key={label} to={to} className="footer-action">
                <Icon size={16} strokeWidth={1.8} />
                <span>{label}</span>
              </Link>
            ))}
            <Link to="/help" className="footer-action">
              <CircleHelp size={16} strokeWidth={1.8} />
              <span>Help</span>
            </Link>
          </nav>
        </div>

        <div className="footer-link-column">
          <span className="footer-column-label">TechJournal</span>
          <nav className="footer-links" aria-label="Site navigation">
            <Link to="/">Home</Link>
            <Link to="/blogs">All Articles</Link>
            <Link to="/blogs?sort=trending">Trending</Link>
            <Link to="/about">About</Link>
            {contactEmail && <a href={`mailto:${contactEmail}`}>Contact Us</a>}
          </nav>
        </div>

      </div>

      <div className="footer-bottom">
        <p>© {new Date().getFullYear()}, TechJournal. All rights reserved.</p>
      </div>
    </footer>
  );
}

export default Footer;
