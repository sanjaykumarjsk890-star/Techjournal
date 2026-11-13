
const cron = require("node-cron");
const Blog = require("../models/Blog");
const startScheduledPublisher = () => {
  cron.schedule("* * * * *", async () => {
    try {
      const result = await Blog.updateMany(
        {
          status: "scheduled",
          scheduledAt: { $lte: new Date() },
        },
        {
          $set: {
            status: "published",
            publishedAt: new Date(),
          },
        }
      );

      if (result.modifiedCount > 0) {
        console.log(
          `${result.modifiedCount} scheduled blog(s) published successfully.`
        );
      }
    } catch (error) {
      console.error("Scheduled publishing failed:", error.message);
    }
  });

  console.log("Scheduled Publisher Started!");
};

module.exports = startScheduledPublisher;
