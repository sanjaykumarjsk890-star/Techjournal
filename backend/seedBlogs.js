require("dotenv").config();
const mongoose = require("mongoose");
const Blog = require("./models/Blog");
const Category = require("./models/Category");
const User = require("./models/User");
const calculateReadingTime = require("./utils/readingTime");

const SAMPLE_ARTICLES = [
  {
    title: "Building Resilient Microservices with Event-Driven Architecture",
    slug: "building-resilient-microservices-event-driven-architecture",
    categorySlug: "software-development",
    description: "Explore how asynchronous event messaging with Apache Kafka and RabbitMQ prevents cascading failures in distributed cloud systems.",
    content: `## The Challenge of Direct Synchronous Calls

In modern distributed microservices architectures, synchronous HTTP REST or gRPC calls between services create tight temporal coupling. When Service A depends directly on Service B, and Service B experiences latency or downtime, failures quickly cascade through the entire cluster.

> "A distributed system is one in which the failure of a computer you didn't even know existed can render your own computer unusable." — Leslie Lamport

## Embracing Event-Driven Architecture (EDA)

By decoupling producers from consumers using an event broker, services emit domain events without caring who consumes them or when.

### Key Benefits

- **Temporal Decoupling**: Consumers can process messages at their own rate.
- **Fault Isolation**: If a consumer crashes, events buffer safely on the message bus.
- **Horizontal Scalability**: Add worker consumers dynamically to handle traffic spikes.

\`\`\`javascript
// Example Producer using Node.js event emitter pattern
const emitUserRegisteredEvent = async (eventBroker, userData) => {
  const eventPayload = {
    eventType: "USER_REGISTERED",
    timestamp: new Date().toISOString(),
    data: {
      userId: userData.id,
      email: userData.email,
      tier: userData.subscriptionTier,
    },
  };

  await eventBroker.publish("user.events", eventPayload);
  console.log(\`[EventPublished] \${eventPayload.eventType} for \${userData.id}\`);
};
\`\`\`

## Architecture Comparison

| Dimension | Synchronous REST | Event-Driven Broker |
| --- | --- | --- |
| Coupling | High (Point-to-point) | Low (Broker decoupled) |
| Latency | Cumulative per hop | Asynchronous / Instant Ack |
| Backpressure | Hard to manage | Built into consumer offsets |
| Resiliency | Vulnerable to outages | Highly resilient |

## Summary & Best Practices

When transitioning to event-driven microservices, always ensure your message consumers are idempotent, implement dead-letter queues (DLQ) for poisoned messages, and use distributed tracing (OpenTelemetry) to trace event flows across boundaries.`,
    coverImage: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1200&auto=format&fit=crop&q=80",
    tags: ["microservices", "architecture", "kafka", "nodejs", "cloud"],
    featured: true,
    status: "published",
    views: 1240,
  },
  {
    title: "Understanding Large Language Models: From Transformers to Real-Time Inference",
    slug: "understanding-large-language-models-transformers-inference",
    categorySlug: "artificial-intelligence-machine-learning",
    description: "A deep dive into attention mechanisms, quantization techniques, and how modern generative AI engines achieve low-latency responses.",
    content: `## The Foundation of Modern Generative AI

The breakthrough behind today's generative artificial intelligence began with the 2017 paper *"Attention Is All You Need"*, which replaced recurrent networks with the Transformer architecture.

## How Self-Attention Works

Self-attention allows an AI model to weigh the importance of different words in a sentence regardless of their physical distance:

\`\`\`python
import numpy as np

def scaled_dot_product_attention(query, key, value):
    matmul_qk = np.matmul(query, key.T)
    depth = query.shape[-1]
    scaled_logits = matmul_qk / np.sqrt(depth)
    
    # Softmax normalization
    attention_weights = np.exp(scaled_logits) / np.sum(np.exp(scaled_logits), axis=-1, keepdims=True)
    output = np.matmul(attention_weights, value)
    return output, attention_weights
\`\`\`

## Quantization and High-Throughput Inference

Running billion-parameter neural networks in production demands rigorous memory optimization. Techniques like **FP16**, **INT8**, and **INT4 quantization** (e.g., AWQ and GPTQ) allow teams to run massive models on single GPUs with minimal accuracy degradation.

> Quantization reduces memory bandwidth pressure, allowing memory-bound autoregressive decoding to execute dramatically faster.

## Looking Forward

As edge AI chips advance, local inference on laptops and mobile devices will become the standard, enabling privacy-first intelligence without continuous cloud dependency.`,
    coverImage: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1200&auto=format&fit=crop&q=80",
    tags: ["ai", "machine-learning", "transformers", "llm", "deeplearning"],
    featured: true,
    status: "published",
    views: 2890,
  },
  {
    title: "Zero-Trust Security Architecture for Cloud-Native Applications",
    slug: "zero-trust-security-architecture-cloud-native",
    categorySlug: "cybersecurity",
    description: "Why perimeter security is obsolete and how to enforce strict identity verification, mTLS, and least-privilege access in production.",
    content: `## The Death of the Perimeter

Traditional enterprise security relied on the 'castle and moat' approach: everything inside the corporate VPN was trusted, and everything outside was untrusted. Modern cloud-native environments and remote teams completely dismantle this boundary.

## Core Tenets of Zero-Trust

Zero Trust operates under a single governing rule: **Never Trust, Always Verify**.

- **Explicit Verification**: Authenticate and authorize based on all available data points (identity, device posture, location).
- **Least Privilege Access**: Restrict user and machine permissions using Just-in-Time (JIT) and Just-Enough-Access (JEA).
- **Assume Breach**: Minimize blast radius by segmenting networks, encrypting traffic end-to-end, and collecting comprehensive audit logs.

\`\`\`bash
# Enforcing mutual TLS (mTLS) with Istio Service Mesh
kubectl apply -f - <<EOF
apiVersion: security.istio.io/v1beta1
kind: PeerAuthentication
metadata:
  name: default
  namespace: production
spec:
  mtls:
    mode: STRICT
EOF
\`\`\`

## Continuous Auditing and Automation

Security is no longer a checklist evaluated quarterly. In a continuous deployment pipeline, static application security testing (SAST) and container vulnerability scanning must run before any artifact lands in your Kubernetes cluster.`,
    coverImage: "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=1200&auto=format&fit=crop&q=80",
    tags: ["cybersecurity", "zerotrust", "infosec", "cloud", "devsecops"],
    featured: false,
    status: "published",
    views: 1850,
  },
  {
    title: "Optimizing Web Performance with Modern CSS and Next-Gen Core Web Vitals",
    slug: "optimizing-web-performance-modern-css-core-web-vitals",
    categorySlug: "web-and-mobile-app-development",
    description: "Practical strategies to ace Interaction to Next Paint (INP), reduce Cumulative Layout Shift (CLS), and streamline frontend rendering pipelines.",
    content: `## Why Performance is User Experience

Every 100ms delay in page interaction reduces customer satisfaction and search engine rankings. With Google's latest metric, **Interaction to Next Paint (INP)** replacing FID, optimizing frontend rendering is more critical than ever.

## Eliminating Layout Shifts

Layout shifts happen when elements load asynchronously and push content around without reserved dimensions.

\`\`\`css
/* Always reserve space for responsive aspect ratios */
.hero-thumbnail {
  width: 100%;
  aspect-ratio: 16 / 9;
  object-fit: cover;
  background-color: #f1f5f9;
}
\`\`\`

## Minimizing Main Thread Blocking

- Avoid long-running JavaScript loops during user interaction.
- Defer non-critical scripts and analytics.
- Use CSS transitions instead of JavaScript animations for hardware-accelerated rendering.`,
    coverImage: "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=1200&auto=format&fit=crop&q=80",
    tags: ["webdev", "frontend", "css", "performance", "javascript"],
    featured: false,
    status: "published",
    views: 940,
  },
  {
    title: "Serverless Kubernetes: Scaling Workloads on Cloud-Native Infrastructure",
    slug: "serverless-kubernetes-scaling-workloads-cloud",
    categorySlug: "cloud-computing",
    description: "Combining container flexibility with serverless economics using Knative, AWS Fargate, and Google Cloud Run.",
    content: `## Containers vs. Serverless: A False Dichotomy

For years, developers debated whether to deploy on raw Kubernetes clusters or serverless functions like AWS Lambda. Today, modern cloud platforms combine the best of both worlds: containerized flexibility with zero-node serverless management.

## Rapid Zero-to-N Scaling

With serverless containers, your applications scale to zero when idle—eliminating compute costs entirely—and burst to hundreds of container instances within seconds when traffic arrives.`,
    coverImage: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&auto=format&fit=crop&q=80",
    tags: ["cloud", "kubernetes", "serverless", "devops", "aws"],
    featured: false,
    status: "published",
    views: 1120,
  },
  {
    title: "Engineering Culture: The Hidden Driver of Software Quality",
    slug: "engineering-culture-driver-software-quality",
    categorySlug: "industry-insights",
    description: "Why psychological safety, blameless post-mortems, and engineering velocity matter far more than rigid agile ceremonies.",
    content: `## Beyond Agile Frameworks

Great engineering teams aren't built on Jira points or two-week sprint rituals. High-performing engineering organizations cultivate autonomy, deep focus time, and blameless retrospectives where failure is treated as a learning opportunity.

## Key Principles of High-Performing Teams

1. **Psychological Safety**: Engineers can ask questions, admit mistakes, and propose bold architectures without fear.
2. **Small Batches**: Deploying small changes frequently reduces deployment risk to near zero.
3. **Continuous Feedback**: Fast automated test suites give developers instant feedback.`,
    coverImage: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200&auto=format&fit=crop&q=80",
    tags: ["leadership", "culture", "engineering", "agile", "careers"],
    featured: false,
    status: "published",
    views: 780,
  },
  {
    title: "Quantum Computing: Preparing for the Post-RSA Cryptography Era",
    slug: "quantum-computing-preparing-post-rsa-cryptography",
    categorySlug: "technology-innovation",
    description: "An overview of NIST-approved post-quantum cryptographic standards and how enterprises can audit their encryption keys today.",
    content: `## The Quantum Threat to Public-Key Encryption

Quantum algorithms like Shor's algorithm threaten to break asymmetric public-key cryptography (RSA and Elliptic Curves) in minutes once fault-tolerant quantum computers arrive.

Organizations must begin adopting post-quantum lattice-based encryption algorithms to protect sensitive long-term data from 'harvest now, decrypt later' attacks.`,
    coverImage: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=1200&auto=format&fit=crop&q=80",
    tags: ["quantum", "cryptography", "futuretech", "security", "innovation"],
    featured: false,
    status: "published",
    views: 650,
  },
  {
    title: "Practical API Versioning Without Breaking Existing Clients",
    slug: "practical-api-versioning-without-breaking-clients",
    categorySlug: "software-development",
    description: "A practical guide to evolving APIs with clear compatibility rules, consumer feedback, and a safe deprecation process.",
    content: `## Why API Changes Need a Migration Plan

An API is a contract shared by independently deployed systems. Renaming a field or changing its meaning can break clients that are not owned by the same team, even when the change looks small in the server code.

## Prefer Additive Changes

Start with backward-compatible additions: introduce a new optional field, keep the old field working, and give consumers time to migrate. Version the contract when a change cannot be made compatible. A version should describe a stable contract, not every internal release.

## A Safe Deprecation Checklist

- Measure which clients still use the old contract.
- Publish a migration guide with examples and a clear removal date.
- Communicate the timeline through release notes and response headers.
- Remove the old version only after usage has fallen to an agreed threshold.

Contract tests and an API schema in CI can catch accidental changes before deployment. Combined with usage metrics, they turn versioning from guesswork into an observable migration process.`,
    coverImage: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1200&auto=format&fit=crop&q=80",
    tags: ["api", "backend", "versioning", "software-design"],
    featured: false,
    status: "published",
    views: 530,
  },
  {
    title: "Database Indexes: A Measured Approach to Faster Queries",
    slug: "database-indexes-measured-approach-faster-queries",
    categorySlug: "software-development",
    description: "Learn how to use query plans, workload patterns, and careful index design to improve database response times without adding unnecessary write cost.",
    content: `## Start with the Query, Not the Index

Indexes can reduce the amount of data a database must scan, but each index also consumes storage and adds work to inserts, updates, and deletes. The right design begins with the queries that matter to users.

## Read the Execution Plan

Inspect representative queries with the database's explain tools. Look for large collection scans, expensive sorts, and filters that discard most rows. Check both the estimated plan and real latency under realistic data volume; a small development dataset can hide production bottlenecks.

## Build Indexes Around Access Patterns

For a query that filters by status and sorts by publication time, a compound index can often support both operations. Field order matters: equality filters generally belong before range and sort fields, but the actual workload should determine the final order.

Track index usage after release and remove indexes that do not justify their cost. Load-test writes as well as reads, and deploy large index changes with a rollback plan. Query latency, database CPU, and write throughput together provide a more useful picture than index count alone.`,
    coverImage: "https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=1200&auto=format&fit=crop&q=80",
    tags: ["database", "performance", "indexes", "backend"],
    featured: false,
    status: "published",
    views: 680,
  },
  {
    title: "Evaluating Retrieval-Augmented Generation Systems",
    slug: "evaluating-retrieval-augmented-generation-systems",
    categorySlug: "artificial-intelligence-machine-learning",
    description: "Measure retrieval quality, grounded answers, and end-to-end usefulness when building question-answering systems over private knowledge.",
    content: `## A Good Answer Starts with Useful Evidence

Retrieval-augmented generation (RAG) combines search with a language model. A fluent response is not enough: the system must retrieve relevant material and use it faithfully.

## Evaluate Retrieval and Generation Separately

Build a small, representative evaluation set from real user questions. For retrieval, measure whether the supporting passages appear near the top of the results. For generation, review whether claims are supported by those passages, whether citations point to the right source, and whether the system abstains when evidence is missing.

## Test the Whole User Journey

Record latency, retrieval failures, empty results, and user corrections. Compare changes to chunking, ranking, prompts, and models against the same fixed examples. Human review remains important for ambiguous questions and high-impact domains.

Treat source documents as data, not instructions. Retrieval content can contain misleading text, so system behavior should be controlled by trusted application logic rather than by instructions found in a document. Keep access controls in the retrieval layer so users only receive material they are allowed to see.`,
    coverImage: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1200&auto=format&fit=crop&q=80",
    tags: ["ai", "rag", "evaluation", "llm"],
    featured: true,
    status: "published",
    views: 1420,
  },
  {
    title: "Observability for Distributed Applications with OpenTelemetry",
    slug: "observability-distributed-applications-opentelemetry",
    categorySlug: "cloud-computing",
    description: "Connect traces, metrics, and logs to find the cause of slow or failing requests across service boundaries.",
    content: `## From System Signals to User Impact

Monitoring tells a team that a threshold was crossed. Observability helps explain why. Distributed applications need a consistent way to connect a user's request to work performed by multiple services, databases, and queues.

## Use Traces, Metrics, and Logs Together

Distributed traces show the path and duration of a request. Metrics summarize behavior over time, such as request rate, error rate, and latency percentiles. Structured logs provide details for a specific event. OpenTelemetry offers common instrumentation and data formats so teams can change collection backends without rewriting every service.

## Keep Telemetry Useful and Safe

Propagate trace context across service and messaging boundaries, and use consistent service names and deployment attributes. Sample high-volume traces thoughtfully while retaining enough error and slow-request data for diagnosis.

Avoid putting credentials, personal information, or full request bodies into telemetry. Set retention limits, control access, and alert on user-visible symptoms such as elevated error rates or slow responses. A useful dashboard should help an on-call engineer answer what changed, who is affected, and where to investigate next.`,
    coverImage: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&auto=format&fit=crop&q=80",
    tags: ["opentelemetry", "observability", "cloud", "reliability"],
    featured: false,
    status: "published",
    views: 910,
  },
  {
    title: "Cloud Cost Optimization Without Sacrificing Reliability",
    slug: "cloud-cost-optimization-without-sacrificing-reliability",
    categorySlug: "cloud-computing",
    description: "Find practical savings through ownership, rightsizing, and workload-aware scaling while protecting service objectives.",
    content: `## Make Cloud Spend Visible

Cost optimization works best when teams can connect cloud charges to products, environments, and owners. Consistent resource tags and account boundaries make it easier to understand which workloads drive spend and whether that spend supports customer value.

## Optimize the Workload, Not Just the Bill

Review utilization before resizing compute, storage, and managed services. Remove abandoned resources, set budgets for experiments, and schedule non-production environments to stop when they are not needed. For steady workloads, compare commitment discounts with the flexibility they remove.

## Preserve the Reliability Budget

Do not reduce redundancy or capacity based only on average utilization. Model peak demand, recovery requirements, and failure scenarios first. Use service-level objectives to make trade-offs explicit: savings that create frequent outages are not real savings.

Review cost and reliability metrics together after each change. A gradual rollout, load test, and rollback threshold help teams verify that an optimization performs as expected. The best FinOps process is a shared engineering habit, not a one-time clean-up exercise.`,
    coverImage: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&auto=format&fit=crop&q=80",
    tags: ["cloud", "finops", "cost-optimization", "reliability"],
    featured: false,
    status: "published",
    views: 760,
  },
  {
    title: "Accessible Forms: Small Details That Make a Big Difference",
    slug: "accessible-web-forms-small-details-big-difference",
    categorySlug: "web-and-mobile-app-development",
    description: "Improve form completion for everyone with clear labels, helpful errors, keyboard support, and thoughtful focus management.",
    content: `## Make Every Field Understandable

Good forms reduce uncertainty. Give each control a visible label, explain required formats before submission, and group related questions with clear headings. Placeholder text is not a replacement for a label because it disappears as users type.

## Make Errors Actionable

When validation fails, explain what needs to change and how to fix it. Associate the message with the relevant field, preserve valid entries, and move focus to a useful summary or the first invalid control. Do not rely on color alone to communicate an error.

## Test Beyond the Mouse

Complete the form using only a keyboard and check that focus is visible and follows a predictable order. Test labels and error announcements with a screen reader. Native HTML controls are often a more accessible starting point than custom widgets.

Accessible forms benefit users on small screens, people with temporary injuries, and anyone using assistive technology. A short manual check during development can reveal issues that visual review alone misses.`,
    coverImage: "https://images.unsplash.com/photo-1559028006-448665bd7c7f?w=1200&auto=format&fit=crop&q=80",
    tags: ["accessibility", "webdev", "ux", "frontend"],
    featured: false,
    status: "published",
    views: 840,
  },
  {
    title: "Safer Continuous Delivery with Small, Reversible Releases",
    slug: "safer-continuous-delivery-small-reversible-releases",
    categorySlug: "software-development",
    description: "Reduce release risk with automated checks, gradual rollout, feature flags, and a clear recovery strategy.",
    content: `## Smaller Changes Are Easier to Understand

Large releases combine many assumptions and make failures difficult to isolate. Smaller changes reduce the amount of code to investigate and allow teams to learn from production feedback sooner.

## Put Guardrails in the Delivery Pipeline

Run formatting, unit tests, dependency checks, and integration tests before deployment. Deploy the same immutable artifact through environments, and verify configuration separately so a release does not silently change between stages.

## Roll Out and Roll Back Deliberately

Use a canary or gradual rollout for changes with meaningful operational risk. Watch a small set of user-facing signals and define a rollback threshold before deployment begins. Feature flags can separate release from activation, but they need owners and cleanup dates to avoid becoming permanent complexity.

After an incident, record what happened and improve the system rather than focusing on blame. Reliable delivery comes from repeatable automation, observable releases, and a recovery path that the team has practiced.`,
    coverImage: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&auto=format&fit=crop&q=80",
    tags: ["devops", "ci-cd", "deployment", "testing"],
    featured: false,
    status: "published",
    views: 1020,
  },
  {
    title: "Designing Offline-First Experiences for Mobile Apps",
    slug: "designing-offline-first-mobile-app-experiences",
    categorySlug: "web-mobile",
    description: "Plan local data, synchronization, and conflict handling so mobile experiences remain useful on unreliable networks.",
    content: `## Assume Connectivity Will Be Interrupted

Mobile users move between networks, tunnels, and low-signal areas. An offline-first design treats the local device as a useful working environment rather than showing a blank screen whenever a request fails.

## Define the Source of Truth

Store the minimum data needed for core tasks locally, show when information was last synchronized, and queue user changes for later delivery. Make pending, synced, and failed states visible so people understand what has happened.

## Handle Conflicts Explicitly

Two devices may update the same record before reconnecting. Choose a policy based on the data: merge independent fields, preserve a history for collaborative content, or ask users to resolve meaningful conflicts. Blindly applying the last write can erase important work.

Test airplane mode, slow connections, app restarts, and expired sessions. Protect locally stored sensitive information and provide a way to clear it when a user signs out. Reliable offline behavior is a product feature, not just a caching optimization.`,
    coverImage: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9?w=1200&auto=format&fit=crop&q=80",
    tags: ["mobile", "offline-first", "sync", "ux"],
    featured: false,
    status: "published",
    views: 620,
  },
  {
    title: "Privacy by Design: Collect Less, Protect More",
    slug: "privacy-by-design-collect-less-protect-more",
    categorySlug: "cybersecurity",
    description: "Reduce privacy risk by minimizing collected data, setting retention rules, and limiting access throughout the data lifecycle.",
    content: `## Start with the Purpose

Before collecting a data field, identify the product need it serves. If a feature works without a sensitive attribute, do not collect it just in case. Fewer data points reduce the impact of accidental exposure and simplify retention obligations.

## Protect Data at Every Stage

Map how information is collected, processed, stored, shared, and deleted. Apply access controls based on job responsibilities, encrypt sensitive data in transit and at rest, and avoid copying production data into development environments.

## Make Retention and Deletion Real

Define how long each data type is needed and automate deletion where possible. Backups and analytics pipelines should be included in the retention plan, not treated as invisible copies. Provide clear information to users about what the product collects and why.

Review data flows when a new integration or feature is introduced. Privacy is easier to maintain when it is part of design reviews and engineering defaults rather than a last-minute compliance task.`,
    coverImage: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=1200&auto=format&fit=crop&q=80",
    tags: ["privacy", "security", "data-protection", "compliance"],
    featured: false,
    status: "published",
    views: 890,
  },
  {
    title: "Caching Strategies: Faster Responses Without Stale Surprises",
    slug: "caching-strategies-faster-responses-without-stale-surprises",
    categorySlug: "web-and-mobile-app-development",
    description: "Choose cache boundaries, expiration rules, and invalidation signals that improve speed without serving confusing outdated data.",
    content: `## Cache Only What You Understand

Caching can reduce latency and backend load, but it introduces another copy of data that can become stale. Decide what can be cached, who owns invalidation, and what users should see when the cache is unavailable.

## Match the Cache to the Data

Browser caches work well for versioned static assets. A CDN can serve public content close to readers. Application caches can help with frequently requested computed data, while database caches require careful attention to query patterns and write behavior.

## Make Freshness Measurable

Use explicit expiration rules and include cache hit rate, age, and invalidation failures in operational dashboards. For important updates, invalidate by a stable key or version rather than clearing an entire cache without a plan.

Test both warm and cold paths, and ensure the original data source remains protected during a cache outage. A cache should make the system more responsive, not become the only place where important data exists.`,
    coverImage: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1200&auto=format&fit=crop&q=80",
    tags: ["caching", "performance", "webdev", "architecture"],
    featured: false,
    status: "published",
    views: 730,
  },
  // DRAFT ARTICLE (Demonstrating Recommendation 4)
  {
    title: "Draft: Comparative Analysis of Rust vs. Go for High-Throughput APIs",
    slug: "comparative-analysis-rust-vs-go-apis-draft",
    categorySlug: "software-development",
    description: "An unpublished benchmark study comparing memory footprints, latency distributions, and developer velocity between Go and Rust.",
    content: `## Introduction (Work in Progress)

This article is currently saved as a draft. It evaluates garbage collection overhead in Go versus manual memory management via borrow checker in Rust when handling 100,000 requests per second.

[Draft notes: Complete memory profiling graphs and Actix-web vs Gin comparison.]`,
    coverImage: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1200&auto=format&fit=crop&q=80",
    tags: ["rust", "golang", "benchmarks", "apis", "performance"],
    featured: false,
    status: "draft",
    views: 0,
  },
  // SCHEDULED ARTICLE (Demonstrating Recommendation 4)
  {
    title: "Scheduled: The Next Decade in Humanoid Robotics and Spatial Computing",
    slug: "next-decade-humanoid-robotics-spatial-computing",
    categorySlug: "technology-innovation",
    description: "Scheduled to publish automatically: exploring physical AI agents and spatial multimodal sensors.",
    content: `## The Convergence of Physical AI and Spatial Hardware

This article is scheduled for automated publication. It analyzes recent advancements in reinforcement learning for humanoid bipedal locomotion and real-time vision-language-action (VLA) neural architectures.`,
    coverImage: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=1200&auto=format&fit=crop&q=80",
    tags: ["robotics", "spatialcomputing", "future", "ai", "hardware"],
    featured: false,
    status: "scheduled",
    scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
    views: 0,
  },
];

const seedBlogs = async () => {
  try {
    const { MONGO_URI, ADMIN_EMAIL } = process.env;
    if (!MONGO_URI) throw new Error("MONGO_URI is missing in .env");

    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB Atlas...");

    // Find admin user to attribute articles
    let authorUser = await User.findOne({ role: "admin" });
    if (!authorUser && ADMIN_EMAIL) {
      authorUser = await User.findOne({ email: ADMIN_EMAIL.trim().toLowerCase() });
    }
    if (!authorUser) {
      authorUser = await User.findOne();
    }

    if (!authorUser) {
      console.warn("No user found. Please run 'npm run seed:admin' first!");
      process.exit(1);
    }

    let seededCount = 0;

    for (const article of SAMPLE_ARTICLES) {
      const categoryDoc = await Category.findOne({
        slug: article.categorySlug,
      });

      const existingBlog = await Blog.findOne({ slug: article.slug });

      const readingTime = calculateReadingTime(article.content);

      if (!existingBlog) {
        await Blog.create({
          title: article.title,
          slug: article.slug,
          description: article.description,
          content: article.content,
          category: categoryDoc?._id || undefined,
          author: authorUser._id,
          coverImage: article.coverImage,
          tags: article.tags,
          status: article.status,
          scheduledAt: article.scheduledAt || null,
          publishedAt: article.status === "published" ? new Date() : null,
          featured: Boolean(article.featured),
          readingTime,
          views: article.views || 0,
          seo: {
            title: article.title,
            description: article.description,
          },
        });
        console.log(`+ Seeded article [${article.status.toUpperCase()}]: ${article.title}`);
        seededCount++;
      } else {
        console.log(`- Article already exists: ${article.title}`);
      }
    }

    console.log(`\nBlog seeding completed! Added ${seededCount} articles.`);
  } catch (error) {
    console.error("Seeding failed:", error.message);
    process.exitCode = 1;
  } finally {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
  }
};

seedBlogs();
