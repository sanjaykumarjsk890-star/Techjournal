const Blog = require("../models/Blog");
const Category = require("../models/Category");
const User = require("../models/User");
const calculateReadingTime = require("../utils/readingTime");
const { normalizeImagePath } = require("../utils/imagePath");

const parseField = (value, fallback) => {
  if (value === undefined) return fallback;
  if (typeof value !== "string") return value;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
};

const parseBoolean = (value) => {
  return value === true || value === "true" || value === 1 || value === "1";
};

const escapeRegex = (value) => {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

/**
 * GET: Admin Dashboard Statistics
 */
const getDashboardStats = async (req, res) => {
  try {
    const [
      totalArticles,
      publishedArticles,
      draftArticles,
      scheduledArticles,
      totalCategories,
      recentArticles,
      viewsAggregation,
    ] = await Promise.all([
      Blog.countDocuments(),
      Blog.countDocuments({ status: "published" }),
      Blog.countDocuments({ status: "draft" }),
      Blog.countDocuments({ status: "scheduled" }),
      Category.countDocuments(),
      Blog.find()
        .populate("category", "name slug")
        .populate("author", "name email")
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),
      Blog.aggregate([
        {
          $group: {
            _id: null,
            totalViews: { $sum: "$views" },
          },
        },
      ]),
    ]);

    const totalViews = viewsAggregation[0]?.totalViews || 0;

    res.status(200).json({
      success: true,
      stats: {
        totalArticles,
        publishedArticles,
        draftArticles,
        scheduledArticles,
        totalCategories,
        totalViews,
      },
      recentArticles,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Unable to fetch dashboard statistics",
      error: error.message,
    });
  }
};

/**
 * GET: Admin Blogs with search, filter, and pagination
 */
const getAdminBlogs = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 10));
    const skip = (page - 1) * limit;

    const filter = {};

    if (req.query.status && req.query.status !== "all") {
      filter.status = req.query.status;
    }

    if (req.query.category) {
      filter.category = req.query.category;
    }

    if (req.query.search) {
      const search = escapeRegex(req.query.search.trim());
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    const [blogs, total] = await Promise.all([
      Blog.find(filter)
        .populate("category", "name slug")
        .populate("author", "name email")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),

      Blog.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      blogs,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Unable to fetch blogs",
      error: error.message,
    });
  }
};

/**
 * GET: Single Blog by ID for Admin Edit
 */
const getAdminBlogById = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id)
      .populate("category", "name slug")
      .populate("author", "name email");

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog not found",
      });
    }

    res.status(200).json({
      success: true,
      blog,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Unable to fetch blog",
      error: error.message,
    });
  }
};

/**
 * CREATE: New blog
 */
const createBlog = async (req, res) => {
  try {
    const {
      title,
      slug,
      description,
      content,
      category,
      status = "draft",
      scheduledAt,
      coverImage: directCoverImage,
      author: selectedAuthor,
    } = req.body;

    if (
      !title?.trim() ||
      !slug?.trim() ||
      !description?.trim() ||
      !content?.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Title, slug, description and content are required",
      });
    }

    if (!["draft", "published", "scheduled"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid blog status",
      });
    }

    const cleanSlug = slug.trim().toLowerCase();
    const existingBlog = await Blog.findOne({ slug: cleanSlug });

    if (existingBlog) {
      return res.status(409).json({
        success: false,
        message: "Blog slug already exists. Please choose a unique slug.",
      });
    }

    if (category) {
      const categoryExists = await Category.findById(category);
      if (!categoryExists) {
        return res.status(400).json({
          success: false,
          message: "Invalid category selected",
        });
      }
    }

    if (!selectedAuthor) {
      return res.status(400).json({
        success: false,
        message: "Please select an author for this article",
      });
    }

    const authorId = selectedAuthor;
    const authorExists = await User.exists({
      _id: authorId,
      role: { $in: ["admin", "author"] },
    });
    if (!authorExists) {
      return res.status(400).json({
        success: false,
        message: "Invalid author selected",
      });
    }

    let scheduleDate = null;
    if (status === "scheduled") {
      scheduleDate = new Date(scheduledAt);
      if (
        !scheduledAt ||
        isNaN(scheduleDate.getTime()) ||
        scheduleDate <= new Date()
      ) {
        return res.status(400).json({
          success: false,
          message: "Please provide a valid future schedule date and time",
        });
      }
    }

    const tags = parseField(req.body.tags, []);
    const seo = parseField(req.body.seo, {});

    if (!Array.isArray(tags)) {
      return res.status(400).json({
        success: false,
        message: "Tags must be an array",
      });
    }

    const finalCoverImage = req.file
      ? normalizeImagePath(req.file)
      : (directCoverImage || "").trim();

    const readingTime = calculateReadingTime(content);

    const blog = await Blog.create({
      title: title.trim(),
      slug: cleanSlug,
      description: description.trim(),
      content,
      category: category || undefined,
      author: authorId,
      coverImage: finalCoverImage,
      tags,
      status,
      scheduledAt: scheduleDate,
      publishedAt: status === "published" ? new Date() : null,
      featured: parseBoolean(req.body.featured),
      readingTime,
      seo,
    });

    res.status(201).json({
      success: true,
      message: "Blog created successfully",
      blog,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * UPDATE: Existing blog
 */
const updateBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog not found",
      });
    }

    const allowedFields = ["title", "slug", "description", "content"];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        blog[field] = req.body[field].trim();
      }
    });

    if (req.body.slug) {
      blog.slug = req.body.slug.trim().toLowerCase();

      const duplicate = await Blog.findOne({
        slug: blog.slug,
        _id: { $ne: blog._id },
      });

      if (duplicate) {
        return res.status(409).json({
          success: false,
          message: "This slug is already in use by another article",
        });
      }
    }

    if (req.body.category !== undefined) {
      if (req.body.category) {
        const categoryExists = await Category.findById(req.body.category);
        if (!categoryExists) {
          return res.status(400).json({
            success: false,
            message: "Invalid category selected",
          });
        }
      }
      blog.category = req.body.category || null;
    }

    if (req.body.author !== undefined) {
      if (!req.body.author) {
        return res.status(400).json({
          success: false,
          message: "Please select an author for this article",
        });
      }

      const authorId = req.body.author;
      const authorExists = await User.exists({
        _id: authorId,
        role: { $in: ["admin", "author"] },
      });
      if (!authorExists) {
        return res.status(400).json({
          success: false,
          message: "Invalid author selected",
        });
      }
      blog.author = authorId;
    }

    if (req.body.tags !== undefined) {
      const tags = parseField(req.body.tags, []);
      if (!Array.isArray(tags)) {
        return res.status(400).json({
          success: false,
          message: "Tags must be an array",
        });
      }
      blog.tags = tags;
    }

    if (req.body.seo !== undefined) {
      blog.seo = parseField(req.body.seo, {});
    }

    if (req.body.featured !== undefined) {
      blog.featured = parseBoolean(req.body.featured);
    }

    if (req.file) {
      blog.coverImage = normalizeImagePath(req.file);
    } else if (req.body.coverImage !== undefined) {
      blog.coverImage = req.body.coverImage.trim();
    }

    if (req.body.content) {
      blog.readingTime = calculateReadingTime(blog.content);
    }

    if (req.body.status !== undefined) {
      const status = req.body.status;

      if (!["draft", "published", "scheduled"].includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Invalid blog status",
        });
      }

      if (status === "scheduled") {
        const date = new Date(req.body.scheduledAt);

        if (
          !req.body.scheduledAt ||
          isNaN(date.getTime()) ||
          date <= new Date()
        ) {
          return res.status(400).json({
            success: false,
            message: "Please provide a valid future schedule date and time",
          });
        }

        blog.scheduledAt = date;
        blog.publishedAt = null;
      } else if (status === "published") {
        blog.publishedAt = blog.publishedAt || new Date();
        blog.scheduledAt = null;
      } else {
        blog.publishedAt = null;
        blog.scheduledAt = null;
      }

      blog.status = status;
    }

    await blog.save();

    res.status(200).json({
      success: true,
      message: "Blog updated successfully",
      blog,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * DELETE: Blog by ID
 */
const deleteBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog not found",
      });
    }

    await blog.deleteOne();

    res.status(200).json({
      success: true,
      message: "Blog deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Unable to delete blog",
      error: error.message,
    });
  }
};

module.exports = {
  getDashboardStats,
  getAdminBlogs,
  getAdminBlogById,
  createBlog,
  updateBlog,
  deleteBlog,
};
