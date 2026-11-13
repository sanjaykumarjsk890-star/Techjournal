import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, FolderTree, Search } from "lucide-react";
import api from "../../services/api";
import BlogCard from "../../components/blog/BlogCard";
import FeaturedBlogs from "../../components/blog/FeaturedBlogs";
import TrendingBlogs from "../../components/blog/TrendingBlogs";
import CategoryList from "../../components/blog/CategoryList";
import Loader from "../../components/common/Loader";
import {
  DEFAULT_ARTICLE_COVER,
  getImageUrl,
  handleArticleImageError,
} from "../../utils/imageUrl";
import "../../styles/Home.css";

function Home() {
  const navigate = useNavigate();
  const [featured, setFeatured] = useState([]);
  const [latestBlogs, setLatestBlogs] = useState([]);
  const [trending, setTrending] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        setLoading(true);
        setError("");

        const results = await Promise.allSettled([
          api.get("/blogs/featured"),
          api.get("/blogs?limit=6&page=1"),
          api.get("/blogs/trending"),
          api.get("/categories"),
        ]);

        const [featuredResult, blogsResult, trendingResult, categoriesResult] =
          results;

        if (featuredResult.status === "fulfilled") {
          setFeatured(featuredResult.value.data.blogs || []);
        }

        if (blogsResult.status === "fulfilled") {
          setLatestBlogs(blogsResult.value.data.blogs || []);
        }

        if (trendingResult.status === "fulfilled") {
          setTrending(trendingResult.value.data.blogs || []);
        }

        if (categoriesResult.status === "fulfilled") {
          setCategories(categoriesResult.value.data.categories || []);
        }

        if (results.every((result) => result.status === "rejected")) {
          setError(
            "Unable to connect to the TechJournal API. Ensure the backend server is running."
          );
        }
      } catch {
        setError("Something went wrong while loading articles.");
      } finally {
        setLoading(false);
      }
    };

    fetchHomeData();
  }, []);

  return (
    <main className="home-page-wrap">
      {error && (
        <div className="home-container">
          <div className="home-error-banner">{error}</div>
        </div>
      )}

      {loading ? (
        <div className="home-container">
          <Loader message="Loading latest stories..." />
        </div>
      ) : (
        <div className="home-container">
          <section className="home-intro">
            <div className="home-intro-copy">
              <span className="home-intro-kicker">Ideas for what comes next</span>
              <h1>Technology, thoughtfully explored.</h1>
              <p>
                A modern space for clear thinking on software, emerging
                technology, and the ideas shaping our world.
              </p>
              <form
                className="home-search"
                onSubmit={(event) => {
                  event.preventDefault();
                  const query = search.trim();
                  navigate(query ? `/blogs?search=${encodeURIComponent(query)}` : "/blogs");
                }}
                role="search"
              >
                <Search size={18} aria-hidden="true" />
                <input
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search articles and topics"
                  aria-label="Search articles and topics"
                />
                <button type="submit" aria-label="Search articles">
                  <ArrowRight size={17} />
                </button>
              </form>
              <Link to="/blogs" className="home-intro-link">
                Explore all articles <ArrowRight size={15} />
              </Link>
            </div>
            <Link
              to={featured[0] ? `/blogs/${featured[0].slug}` : "/blogs"}
              className="home-intro-visual"
              aria-label={
                featured[0]
                  ? `Read featured article: ${featured[0].title}`
                  : "Explore TechJournal articles"
              }
            >
              <img
                src={
                  featured[0]?.coverImage || featured[0]?.image
                    ? getImageUrl(featured[0].coverImage || featured[0].image)
                    : DEFAULT_ARTICLE_COVER
                }
                alt={featured[0]?.title || "Technology and ideas"}
                onError={handleArticleImageError}
              />
              <span className="home-visual-caption">
                <span>Curiosity, in focus</span>
                <ArrowRight size={18} />
              </span>
            </Link>
          </section>

          {/* Featured lead story */}
          {featured.length > 0 && <FeaturedBlogs blogs={featured} />}

          {categories.length > 0 && (
            <section className="home-categories-section">
              <div className="home-cat-header">
                <span className="cat-eyebrow">
                  <FolderTree size={14} /> TOPICS &amp; DOMAINS
                </span>
                <h2>Browse by Technology Domain</h2>
              </div>
              <CategoryList categories={categories} asLinks={true} />
            </section>
          )}

          {/* Latest Articles Grid */}
          <section className="home-latest-section">
            <div className="section-header-row">
              <div>
                <span className="section-eyebrow">RECENT DISPATCHES</span>
                <h2 className="section-title">Latest Articles</h2>
                <p className="section-subtitle">
                  Fresh analysis and technical guides published this week.
                </p>
              </div>

              <Link to="/blogs" className="section-link-more">
                Browse all {latestBlogs.length > 0 ? "articles" : ""} &rarr;
              </Link>
            </div>

            {latestBlogs.length > 0 ? (
              <div className="home-articles-grid">
                {latestBlogs.map((blog) => (
                  <BlogCard key={blog._id} blog={blog} />
                ))}
              </div>
            ) : (
              <p className="home-empty-msg">No articles published yet.</p>
            )}
          </section>

          {/* Trending Section */}
          {trending.length > 0 && <TrendingBlogs blogs={trending} />}

          {/* Call to Action */}
          <section className="home-cta-banner">
            <div className="cta-banner-content">
              <span className="cta-kicker">STAY CURIOUS &amp; INFORMED</span>
              <h2>Never stop exploring technology.</h2>
              <p>
                Join thousands of software engineers, architects, and technology
                leaders reading TechJournal weekly.
              </p>
              <Link to="/blogs" className="btn-brand-primary">
                Start Reading Articles <ArrowRight size={17} />
              </Link>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}

export default Home;
