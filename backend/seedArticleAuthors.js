require("dotenv").config();
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const Blog = require("./models/Blog");
const User = require("./models/User");

const ARTICLE_AUTHORS = {
  "introduction-to-artificial-intelligence": {
    name: "Kavin Kumar",
    email: "aarav.iyer@authors.techjournal.example",
  },
  "building-resilient-microservices-event-driven-architecture": {
    name: "Chandru K",
    email: "meera.nair@authors.techjournal.example",
  },
  "understanding-large-language-models-transformers-inference": {
    name: "Ramachandran H",
    email: "kavya.raman@authors.techjournal.example",
  },
  "zero-trust-security-architecture-cloud-native": {
    name: "Punitha R",
    email: "divya.menon@authors.techjournal.example",
  },
  "optimizing-web-performance-modern-css-core-web-vitals": {
    name: "Merlin P",
    email: "karthik.rao@authors.techjournal.example",
  },
  "serverless-kubernetes-scaling-workloads-cloud": {
    name: "Gunanithi G",
    email: "rohan.krishnan@authors.techjournal.example",
  },
  "engineering-culture-driver-software-quality": {
    name: "Sanjay A",
    email: "ananya.pillai@authors.techjournal.example",
  },
  "quantum-computing-preparing-post-rsa-cryptography": {
    name: "Sabeetha R",
    email: "vikram.narayanan@authors.techjournal.example",
  },
  "practical-api-versioning-without-breaking-clients": {
    name: "Rabin T",
    email: "priya.srinivasan@authors.techjournal.example",
  },
  "database-indexes-measured-approach-faster-queries": {
    name: "Anbu M",
    email: "arjun.thomas@authors.techjournal.example",
  },
  "evaluating-retrieval-augmented-generation-systems": {
    name: "Aathi U",
    email: "nisha.subramanian@authors.techjournal.example",
  },
  "observability-distributed-applications-opentelemetry": {
    name: "Kannagavalli R",
    email: "dev.rajan@authors.techjournal.example",
  },
  "cloud-cost-optimization-without-sacrificing-reliability": {
    name: "Latha C",
    email: "tara.mukherjee@authors.techjournal.example",
  },
  "accessible-web-forms-small-details-big-difference": {
    name: "PriyaRam J",
    email: "neha.kapoor@authors.techjournal.example",
  },
  "safer-continuous-delivery-small-reversible-releases": {
    name: "Karpagam F",
    email: "siddharth.menon@authors.techjournal.example",
  },
  "designing-offline-first-mobile-app-experiences": {
    name: "Saraarjun k",
    email: "ishita.das@authors.techjournal.example",
  },
  "privacy-by-design-collect-less-protect-more": {
    name: "Farthima V",
    email: "ritu.varma@authors.techjournal.example",
  },
  "caching-strategies-faster-responses-without-stale-surprises": {
    name: "Yureka P",
    email: "sanjana.krishnan@authors.techjournal.example",
  },
  "comparative-analysis-rust-vs-go-apis-draft": {
    name: "Hari Venkatesh",
    email: "hari.venkatesh@authors.techjournal.example",
  },
  "next-decade-humanoid-robotics-spatial-computing": {
    name: "Sahana Nambiar",
    email: "sahana.nambiar@authors.techjournal.example",
  },
};

const ensureAuthor = async ({ name, email }) => {
  let author = await User.findOne({ email });

  if (!author) {
    const password = crypto.randomBytes(48).toString("hex");
    author = await User.create({
      name,
      email,
      password: await bcrypt.hash(password, 12),
      role: "author",
    });
    return { author, created: true };
  }

  if (author.name !== name || author.role !== "author") {
    author.name = name;
    author.role = "author";
    await author.save();
  }

  return { author, created: false };
};

const seedArticleAuthors = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is missing in .env");
    }

    await mongoose.connect(process.env.MONGO_URI);
    const blogs = await Blog.find().select("slug author").sort({ slug: 1 });
    const unmappedSlugs = blogs
      .filter((blog) => !ARTICLE_AUTHORS[blog.slug])
      .map((blog) => blog.slug);

    if (unmappedSlugs.length > 0) {
      throw new Error(
        `Add an author profile for every article before running this migration: ${unmappedSlugs.join(", ")}`
      );
    }

    const authorsBySlug = new Map();
    let createdAuthors = 0;
    for (const blog of blogs) {
      const { author, created } = await ensureAuthor(
        ARTICLE_AUTHORS[blog.slug]
      );
      authorsBySlug.set(blog.slug, author);
      if (created) createdAuthors += 1;
    }

    let updatedArticles = 0;
    for (const blog of blogs) {
      const author = authorsBySlug.get(blog.slug);
      if (blog.author?.equals(author._id)) continue;

      await Blog.updateOne({ _id: blog._id }, { $set: { author: author._id } });
      updatedArticles += 1;
    }

    console.log(
      `Author assignment complete: ${updatedArticles} articles updated, ${createdAuthors} author profiles created, ${blogs.length} unique bylines.`
    );
  } catch (error) {
    console.error("Author assignment failed:", error.message);
    process.exitCode = 1;
  } finally {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
  }
};

seedArticleAuthors();
