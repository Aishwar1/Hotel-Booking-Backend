import { clerkClient } from "@clerk/express";
import User from "../models/User.js";

export const protect = async (req, res, next) => {
  try {
    console.log("========== AUTH DEBUG ==========");
    console.log("Authorization:", req.headers.authorization);
    console.log("req.auth:", req.auth);

    const userId = req.auth?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    let user = await User.findById(userId);

    if (!user) {
      console.log("User not found in MongoDB.");
      console.log("Fetching user from Clerk...");

      const clerkUser = await clerkClient.users.getUser(userId);

      user = await User.create({
        _id: clerkUser.id,
        name:
          `${clerkUser.firstName ?? ""} ${clerkUser.lastName ?? ""}`.trim() ||
          "User",
        email: clerkUser.emailAddresses?.[0]?.emailAddress ?? "",
        image: clerkUser.imageUrl ?? "",
        role: "user",
        recentSearchedCities: [],
      });

      console.log("MongoDB user created.");
    }

    req.user = user;

    next();
  } catch (err) {
    console.error("========== AUTH ERROR ==========");
    console.error(err);

    return res.status(401).json({
      success: false,
      message: err.message,
    });
  }
};