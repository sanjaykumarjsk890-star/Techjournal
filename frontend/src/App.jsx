import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import AppRoutes from "./routes/AppRoutes";
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
import {
  initializeSiteIntegrations,
  setPageMetadata,
  trackPageView,
} from "./utils/siteIntegrations";
import "./styles/global.css";

function App() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith("/admin");
  const isArticleRoute = /^\/blogs\/[^/]+$/.test(location.pathname);

  useEffect(() => {
    initializeSiteIntegrations();
  }, []);

  useEffect(() => {
    if (!isArticleRoute) {
      const title =
        location.pathname === "/blogs"
          ? "Technology Articles | TechJournal"
          : "TechJournal – Technology Blog & Engineering Insights";
      const description =
        "Discover technology articles, software engineering insights, tutorials, cloud architecture, and industry trends on TechJournal.";
      setPageMetadata({
        title,
        description,
        url: `${window.location.origin}${location.pathname}`,
        image: `${window.location.origin}/images/article-cover-default.svg`,
      });
    }
    if (!isArticleRoute) {
      trackPageView(`${location.pathname}${location.search}`);
    }
  }, [isArticleRoute, location.pathname, location.search]);

  return (
    <div className={`app-shell ${isAdminRoute ? "admin-theme" : "public-theme"}`}>
      {!isAdminRoute && <Navbar />}
      <div className="app-main-content">
        <AppRoutes />
      </div>
      {!isAdminRoute && <Footer />}
    </div>
  );
}

export default App;
