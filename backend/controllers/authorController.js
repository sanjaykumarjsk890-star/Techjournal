const bcrypt = require("bcryptjs");
const Blog = require("../models/Blog");
const User = require("../models/User");

const listAuthors = async (req, res) => {
  try {
    const authors = await User.find({ role: { $in: ["admin", "author"] } })
      .select("name email role createdAt")
      .sort({ name: 1 })
      .lean();

    res.status(200).json({ success: true, authors });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Unable to fetch authors",
      error: error.message,
    });
  }
};

const createAuthor = async (req, res) => {
  try {
    const name = req.body.name?.trim();
    const email = req.body.email?.trim().toLowerCase();
    const password = req.body.password;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email, and a temporary password are required",
      });
    }

    if (password.length < 12) {
      return res.status(400).json({
        success: false,
        message: "Temporary password must contain at least 12 characters",
      });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists",
      });
    }

    const author = await User.create({
      name,
      email,
      password: await bcrypt.hash(password, 12),
      role: "author",
    });

    res.status(201).json({
      success: true,
      message: "Author created successfully",
      author: {
        _id: author._id,
        name: author.name,
        email: author.email,
        role: author.role,
        createdAt: author.createdAt,
      },
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists",
      });
    }

    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const updateAuthor = async (req, res) => {
  try {
    const author = await User.findOne({
      _id: req.params.id,
      role: "author",
    });

    if (!author) {
      return res.status(404).json({
        success: false,
        message: "Author not found",
      });
    }

    if (req.body.name !== undefined) {
      const name = req.body.name.trim();
      if (!name) {
        return res.status(400).json({
          success: false,
          message: "Author name cannot be empty",
        });
      }
      author.name = name;
    }

    if (req.body.email !== undefined) {
      const email = req.body.email.trim().toLowerCase();
      if (!email) {
        return res.status(400).json({
          success: false,
          message: "Author email cannot be empty",
        });
      }
      author.email = email;
    }

    await author.save();

    res.status(200).json({
      success: true,
      message: "Author updated successfully",
      author: {
        _id: author._id,
        name: author.name,
        email: author.email,
        role: author.role,
        createdAt: author.createdAt,
      },
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists",
      });
    }

    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const deleteAuthor = async (req, res) => {
  try {
    const author = await User.findOne({
      _id: req.params.id,
      role: "author",
    });

    if (!author) {
      return res.status(404).json({
        success: false,
        message: "Author not found",
      });
    }

    if (await Blog.exists({ author: author._id })) {
      return res.status(409).json({
        success: false,
        message: "This author has articles. Reassign them before deleting the author.",
      });
    }

    await author.deleteOne();
    res.status(200).json({
      success: true,
      message: "Author deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Unable to delete author",
      error: error.message,
    });
  }
};

module.exports = {
  listAuthors,
  createAuthor,
  updateAuthor,
  deleteAuthor,
};
