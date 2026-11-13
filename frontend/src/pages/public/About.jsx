import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import "../../styles/InfoPages.css";

const focusAreas = [
  "Software development",
  "Artificial intelligence",
  "Web and mobile apps",
  "Technology and innovation",
  "Cybersecurity",
  "Cloud computing",
  "Industry insights",
];

function About() {
  return (
    <main className="info-page about-page">
      <header className="info-page-header">
        <span className="info-page-eyebrow">ABOUT TECHJOURNAL</span>
        <h1>Thoughtful perspectives on technology.</h1>
        <p>
          TechJournal brings together practical knowledge and clear perspectives
          on the tools, ideas, and changes shaping technology.
        </p>
      </header>

      <section className="about-content">
        <div className="about-story">
          <h2>Technology, made easier to explore.</h2>
          <p>
            From software development and cloud computing to artificial
            intelligence and cybersecurity, TechJournal is a place to explore
            the topics that matter to builders, teams, and curious readers.
          </p>
          <p>
            Our articles aim to make complex subjects approachable and useful,
            with guides, ideas, and industry insights in one organised library.
          </p>
          <Link to="/blogs" className="info-page-link">
            Explore the articles <ArrowRight size={16} />
          </Link>
        </div>

        <aside className="about-focus">
          <h2>What we cover</h2>
          <ul>
            {focusAreas.map((area) => (
              <li key={area}>{area}</li>
            ))}
          </ul>
        </aside>
      </section>
    </main>
  );
}

export default About;
