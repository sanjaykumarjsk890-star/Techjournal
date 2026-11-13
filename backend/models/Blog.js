
const mongoose = require("mongoose");

const blogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    content: {
      type: String,
      required: true,
    },

    coverImage: {
      type: String,
      default: "",
    },

    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
    },

    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    tags: [
      {
        type: String,
        trim: true,
      },
    ],

    status: {
      type: String,
      enum: ["draft", "published", "scheduled"],
      default: "draft",
    },

    scheduledAt: {
      type: Date,
      default: null,
    },

    publishedAt: {
      type: Date,
      default: null,
    },

    featured: {
      type: Boolean,
      default: false,
    },

    seo: {
      title: String,
      description: String,
    },

    readingTime: {
      type: Number,
      default: 1,
    },

  
    views: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);


blogSchema.index({ status: 1, publishedAt: -1 });
blogSchema.index({ status: 1, featured: 1, publishedAt: -1 });
blogSchema.index({ status: 1, views: -1 });
blogSchema.index({ category: 1, status: 1 });

module.exports = mongoose.model("Blog", blogSchema);
