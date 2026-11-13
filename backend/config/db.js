
const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 15000,
      tls: true,
      tlsAllowInvalidCertificates: false,
    });

    console.log("MongoDB Connected Successfully!");
  } catch (error) {
    console.log("MongoDB Connection Failed!");
    console.log("Error Name:", error.name);
    console.log("Error Details:", error.message);

    if (error.reason?.servers) {
      for (const [address, server] of error.reason.servers) {
        console.log("Server:", address);
        console.log(
          "Server Error:",
          server.error?.message || "No detailed error"
        );
      }
    }

    process.exit(1);
  }
};

module.exports = connectDB;
