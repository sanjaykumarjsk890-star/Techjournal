const Category = require("../models/Category");
const Blog = require("../models/Blog");

const DEFAULT_CATEGORIES = [
  {
    name: "Software Development",
    slug: "software-development",
    description: "Best practices, architecture, clean code, and engineering methodologies.",
  },
  {
    name: "Artificial Intelligence & Machine Learning",
    slug: "artificial-intelligence-machine-learning",
    description: "Artificial intelligence, deep learning, LLMs, and neural networks.",
  },
  {
    name: "Web and Mobile App Development",
    slug: "web-and-mobile-app-development",
    description: "Frontend frameworks, responsive design, cross-platform and native mobile apps.",
  },
  {
    name: "Technology & Innovation",
    slug: "technology-innovation",
    description: "Emerging tech breakthroughs, hardware trends, and future horizons.",
  },
  {
    name: "Cybersecurity",
    slug: "cybersecurity",
    description: "InfoSec, threat detection, ethical hacking, and digital privacy.",
  },
  {
    name: "Cloud Computing",
    slug: "cloud-computing",
    description: "Cloud infrastructure, DevOps, serverless, and distributed systems.",
  },
  {
    name: "Industry Insights",
    slug: "industry-insights",
    description: "Tech business perspectives, market analysis, and career growth.",
  },
];

const getCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ name: 1 }).lean();

    res.status(200).json({
      success: true,
      count: categories.length,
      categories,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Unable to fetch categories",
      error: error.message,
    });
  }
};

const createCategory = async (req, res) => {
  try {
    const { name, slug, description } = req.body;

    if (!name || !slug) {
      return res.status(400).json({
        success: false,
        message: "Category name and slug are required",
      });
    }

    const category = await Category.create({
      name: name.trim(),
      slug: slug.trim().toLowerCase(),
      description: description ? description.trim() : "",
    });

    res.status(201).json({
      success: true,
      message: "Category created successfully",
      category,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Category name or slug already exists",
      });
    }

    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const updateCategory = async (req, res) => {
  try {
    const { name, slug, description } = req.body;

    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    if (name !== undefined) category.name = name.trim();
    if (slug !== undefined) category.slug = slug.trim().toLowerCase();
    if (description !== undefined) category.description = description.trim();

    await category.save();

    res.status(200).json({
      success: true,
      message: "Category updated successfully",
      category,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Category name or slug already exists",
      });
    }

    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    const blogExists = await Blog.exists({
      category: category._id,
    });

    if (blogExists) {
      return res.status(409).json({
        success: false,
        message: "Cannot delete category because published or draft articles are linked to it",
      });
    }

    await category.deleteOne();

    res.status(200).json({
      success: true,
      message: "Category deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Unable to delete category",
      error: error.message,
    });
  }
};

const seedDefaultCategories = async (req, res) => {
  try {
    const results = [];
    for (const item of DEFAULT_CATEGORIES) {
      const exists = await Category.findOne({
        $or: [{ slug: item.slug }, { name: item.name }],
      });
      if (!exists) {
        const created = await Category.create(item);
        results.push(created);
      }
    }

    res.status(200).json({
      success: true,
      message: `Seeded ${results.length} new categories`,
      seededCount: results.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to seed default categories",
      error: error.message,
    });
  }
};

module.exports = {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  seedDefaultCategories,
};
