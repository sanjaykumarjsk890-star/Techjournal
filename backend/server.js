const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const connectDB = require("./config/db");
const startScheduledPublisher = require("./jobs/scheduledPublisher");
const Blog = require("./models/Blog");
const Category = require("./models/Category");

const { notFound, errorHandler } = require("./middleware/errorMiddleware");

const app = express();

app.use(cors());
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));

// Serve uploaded assets
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get("/", (req, res) => {
  res.send("TechJournal – Technology Blog API is Running!");
});

// SEO: robots.txt
app.get("/robots.txt", (req, res) => {
  const host = req.get("host") || "localhost:5000";
  const protocol = req.protocol || "http";
  const robots = [
    "User-agent: *",
    "Allow: /",
    "Disallow: /admin",
    "Disallow: /api",
    `Sitemap: ${protocol}://${host}/sitemap.xml`,
  ].join("\n");

  res.header("Content-Type", "text/plain");
  res.send(robots);
});

// SEO: dynamic sitemap.xml
app.get("/sitemap.xml", async (req, res) => {
  try {
    const host = req.get("host") || "localhost:5000";
    const protocol = req.protocol || "http";
    const baseUrl = `${protocol}://${host}`;

    const [blogs, categories] = await Promise.all([
      Blog.find({ status: "published" }).select("slug updatedAt").lean(),
      Category.find().select("slug updatedAt").lean(),
    ]);

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

    // Static pages
    xml += `  <url>\n    <loc>${baseUrl}/</loc>\n    <changefreq>daily</changefreq>\n    <priority>1.0</priority>\n  </url>\n`;
    xml += `  <url>\n    <loc>${baseUrl}/blogs</loc>\n    <changefreq>daily</changefreq>\n    <priority>0.9</priority>\n  </url>\n`;

    // Categories
    categories.forEach((cat) => {
      const date = cat.updatedAt ? new Date(cat.updatedAt).toISOString() : new Date().toISOString();
      xml += `  <url>\n    <loc>${baseUrl}/blogs?category=${encodeURIComponent(cat.slug)}</loc>\n    <lastmod>${date}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.7</priority>\n  </url>\n`;
    });

    // Blog articles
    blogs.forEach((b) => {
      const date = b.updatedAt ? new Date(b.updatedAt).toISOString() : new Date().toISOString();
      xml += `  <url>\n    <loc>${baseUrl}/blogs/${b.slug}</loc>\n    <lastmod>${date}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.8</priority>\n  </url>\n`;
    });

    xml += `</urlset>`;

    res.header("Content-Type", "application/xml");
    res.send(xml);
  } catch (error) {
    res.status(500).send("Error generating sitemap");
  }
});

// Application API Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/blogs", require("./routes/blogRoutes"));
app.use("/api/categories", require("./routes/categoryRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();

    startScheduledPublisher();

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Server startup failed:", error.message);
    process.exit(1);
  }
};

startServer();
