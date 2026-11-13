
const express = require("express");
const router = express.Router();

const {
  getAllBlogs,
  getFeaturedBlogs,
  getTrendingBlogs,
  getBlogBySlug,
} = require("../controllers/blogController");

router.get("/", getAllBlogs);
router.get("/featured", getFeaturedBlogs);
router.get("/trending", getTrendingBlogs);
router.get("/:slug", getBlogBySlug);

module.exports = router;
