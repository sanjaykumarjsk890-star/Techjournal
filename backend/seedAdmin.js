require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./models/User");
const createAdmin = async () => {
  try {
    const { ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD, MONGO_URI } = process.env;

    if (!ADMIN_NAME || !ADMIN_EMAIL || !ADMIN_PASSWORD || !MONGO_URI) {
      throw new Error("Admin environment variables are missing");
    }

    if (ADMIN_PASSWORD.length < 12) {
      throw new Error("Admin password must contain at least 12 characters");
    }

    await mongoose.connect(MONGO_URI);

    const email = ADMIN_EMAIL.trim().toLowerCase();
    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 12);

    let adminUser = await User.findOne({ email });

    if (adminUser) {
      adminUser.name = ADMIN_NAME.trim();
      adminUser.role = "admin";
      adminUser.password = hashedPassword;

      await adminUser.save();

      console.log("Admin password updated successfully!");
    } else {
      await User.create({
        name: ADMIN_NAME.trim(),
        email,
        password: hashedPassword,
        role: "admin",
      });

      console.log("Admin account created successfully!");
    }
  } catch (error) {
    console.error("Admin creation failed:", error.message);
    process.exitCode = 1;
  } finally {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
  }
};

createAdmin();
