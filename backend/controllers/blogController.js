const Blog = require("../models/Blog");
const Category = require("../models/Category");
const mongoose = require("mongoose");

const getAllBlogs = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 10));

    const filter = { status: "published" };
    const search = (req.query.search || "").trim();

    if (search) {
      const safeSearch = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const searchRegex = new RegExp(safeSearch, "i");

      filter.$or = [
        { title: searchRegex },
        { description: searchRegex },
        { content: searchRegex },
        { tags: searchRegex },
      ];
    }

    const category = (req.query.category || "").trim();

    if (category) {
      let categoryDocument = null;

      if (mongoose.Types.ObjectId.isValid(category)) {
        categoryDocument = await Category.findById(category);
      }

      if (!categoryDocument) {
        categoryDocument = await Category.findOne({ slug: category });
      }

      if (!categoryDocument) {
        return res.status(200).json({
          success: true,
          count: 0,
          totalBlogs: 0,
          totalPages: 0,
          currentPage: page,
          blogs: [],
        });
      }

      filter.category = categoryDocument._id;
    }

    // Determine sorting order
    const sort = req.query.sort;
    let sortOption = { publishedAt: -1, createdAt: -1 };

    if (sort === "trending" || sort === "popular") {
      sortOption = { views: -1, publishedAt: -1 };
    } else if (sort === "oldest") {
      sortOption = { publishedAt: 1, createdAt: 1 };
    }

    const totalBlogs = await Blog.countDocuments(filter);

    const blogs = await Blog.find(filter)
      .populate("category", "name slug")
      .populate("author", "name")
      .sort(sortOption)
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    res.status(200).json({
      success: true,
      count: blogs.length,
      totalBlogs,
      totalPages: Math.ceil(totalBlogs / limit),
      currentPage: page,
      blogs,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Unable to fetch blogs",
      error: error.message,
    });
  }
};

const getFeaturedBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find({
      status: "published",
      featured: true,
    })
      .populate("category", "name slug")
      .populate("author", "name")
      .sort({ publishedAt: -1 })
      .limit(5)
      .lean();

    res.status(200).json({
      success: true,
      count: blogs.length,
      blogs,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Unable to fetch featured blogs",
      error: error.message,
    });
  }
};

const getTrendingBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find({
      status: "published",
    })
      .populate("category", "name slug")
      .populate("author", "name")
      .sort({ views: -1, publishedAt: -1 })
      .limit(5)
      .lean();

    res.status(200).json({
      success: true,
      count: blogs.length,
      blogs,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Unable to fetch trending blogs",
      error: error.message,
    });
  }
};

const getBlogBySlug = async (req, res) => {
  try {
    const blog = await Blog.findOneAndUpdate(
      {
        slug: req.params.slug,
        status: "published",
      },
      {
        $inc: { views: 1 },
      },
      {
        new: true,
        runValidators: true,
      }
    )
      .populate("category", "name slug")
      .populate("author", "name");

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog not found",
      });
    }

    // Related blogs from the same category
    const relatedFilter = {
      _id: { $ne: blog._id },
      status: "published",
    };

    if (blog.category?._id) {
      relatedFilter.category = blog.category._id;
    }

    const relatedBlogs = await Blog.find(relatedFilter)
      .select("title slug description coverImage publishedAt readingTime")
      .populate("category", "name slug")
      .populate("author", "name")
      .sort({ publishedAt: -1 })
      .limit(4)
      .lean();

    // Previous published blog
    const previousBlog = await Blog.findOne({
      status: "published",
      publishedAt: { $lt: blog.publishedAt },
    })
      .select("title slug coverImage")
      .sort({ publishedAt: -1 })
      .lean();

    // Next published blog
    const nextBlog = await Blog.findOne({
      status: "published",
      publishedAt: { $gt: blog.publishedAt },
    })
      .select("title slug coverImage")
      .sort({ publishedAt: 1 })
      .lean();

    res.status(200).json({
      success: true,
      blog,
      relatedBlogs,
      navigation: {
        previousBlog,
        nextBlog,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Unable to fetch blog",
      error: error.message,
    });
  }
};

module.exports = {
  getAllBlogs,
  getFeaturedBlogs,
  getTrendingBlogs,
  getBlogBySlug,
};
