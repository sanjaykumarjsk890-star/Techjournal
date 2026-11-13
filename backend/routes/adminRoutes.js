const express = require("express");
const router = express.Router();

const {
  getDashboardStats,
  getAdminBlogs,
  getAdminBlogById,
  createBlog,
  updateBlog,
  deleteBlog,
} = require("../controllers/adminController");
const {
  listAuthors,
  createAuthor,
  updateAuthor,
  deleteAuthor,
} = require("../controllers/authorController");
const { uploadArticleImage } = require("../controllers/mediaController");

const { protect } = require("../middleware/authMiddleware");
const { admin } = require("../middleware/adminMiddleware");
const upload = require("../middleware/uploadMiddleware");

// All admin routes require authentication and admin role
router.use(protect, admin);

router.get("/dashboard", getDashboardStats);
router.get("/authors", listAuthors);
router.post("/authors", createAuthor);
router.put("/authors/:id", updateAuthor);
router.delete("/authors/:id", deleteAuthor);
router.post("/images", upload.single("image"), uploadArticleImage);
router.get("/blogs", getAdminBlogs);
router.get("/blogs/:id", getAdminBlogById);

router.post("/blogs", upload.single("coverImage"), createBlog);
router.put("/blogs/:id", upload.single("coverImage"), updateBlog);
router.delete("/blogs/:id", deleteBlog);

module.exports = router;
