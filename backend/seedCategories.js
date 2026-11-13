require("dotenv").config();
const mongoose = require("mongoose");
const Category = require("./models/Category");

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

const seedCategories = async () => {
  try {
    const { MONGO_URI } = process.env;

    if (!MONGO_URI) {
      throw new Error("MONGO_URI is missing in .env");
    }

    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB Atlas...");

    let createdCount = 0;

    for (const cat of DEFAULT_CATEGORIES) {
      const exists = await Category.findOne({
        $or: [{ slug: cat.slug }, { name: cat.name }],
      });
      if (!exists) {
        await Category.create(cat);
        console.log(`+ Created category: ${cat.name}`);
        createdCount++;
      } else {
        console.log(`- Category already exists: ${cat.name}`);
      }
    }

    console.log(`\nSeed completed! Added ${createdCount} new categories.`);
  } catch (error) {
    console.error("Seeding failed:", error.message);
    process.exitCode = 1;
  } finally {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
  }
};

seedCategories();
