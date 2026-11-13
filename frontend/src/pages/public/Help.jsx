import { ArrowRight, BookOpen, Mail, Search } from "lucide-react";
import { Link } from "react-router-dom";
import { contactEmail } from "../../utils/siteIntegrations";
import "../../styles/InfoPages.css";

function Help() {
  return (
    <main className="info-page">
      <header className="info-page-header">
        <span className="info-page-eyebrow">TECHJOURNAL SUPPORT</span>
        <h1>How can we help?</h1>
        <p>
          Find your way around the articles, discover a topic, or get in touch
          with the TechJournal team.
        </p>
      </header>

      <section className="help-options" aria-label="Help topics">
        <article className="help-option">
          <Search size={22} aria-hidden="true" />
          <h2>Find an article</h2>
          <p>
            Search by keyword, or browse articles by category and publication
            date.
          </p>
          <Link to="/blogs" className="info-page-link">
            Browse and search <ArrowRight size={16} />
          </Link>
        </article>

        <article className="help-option">
          <BookOpen size={22} aria-hidden="true" />
          <h2>Reading and sharing</h2>
          <p>
            Article pages include reading time, related stories, and options to
            share an article.
          </p>
          <Link to="/blogs?sort=trending" className="info-page-link">
            Explore trending stories <ArrowRight size={16} />
          </Link>
        </article>

        <article className="help-option">
          <Mail size={22} aria-hidden="true" />
          <h2>{contactEmail ? "Contact us" : "More help"}</h2>
          <p>
            {contactEmail
              ? "Send the team a message and we’ll be happy to help."
              : "Browse the latest articles while you explore TechJournal."}
          </p>
          {contactEmail ? (
            <a
              href={`mailto:${contactEmail}`}
              className="info-page-link"
            >
              Email TechJournal <ArrowRight size={16} />
            </a>
          ) : (
            <Link to="/blogs" className="info-page-link">
              Browse articles <ArrowRight size={16} />
            </Link>
          )}
        </article>
      </section>

      <div className="info-page-bottom-link">
        <Link to="/" className="info-page-link">
          Back to home <ArrowRight size={16} />
        </Link>
      </div>
    </main>
  );
}

export default Help;
