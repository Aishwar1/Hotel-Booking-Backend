import { clerkClient } from "@clerk/express";
import User from "../models/User.js";

export const protect = async (req, res, next) => {
  try {
    console.log("========== AUTH ==========");
    console.log("Auth:", req.auth);

    const userId = req.auth?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    let user = await User.findById(userId);

    if (!user) {
      console.log("User not found in MongoDB. Creating...");

      const clerk = await clerkClient();

      const clerkUser = await clerk.users.getUser(userId);

      user = await User.create({
        _id: clerkUser.id,
        name:
          `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim() ||
          "User",
        email:
          clerkUser.emailAddresses[0]?.emailAddress || "",
        image: clerkUser.imageUrl || "",
      });

      console.log("User created successfully.");
    }

    req.user = user;

    next();
  } catch (error) {
    console.error("Protect middleware:", error);

    res.status(401).json({
      success: false,
      message: error.message,
    });
  }
};