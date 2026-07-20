import { clerkClient } from "@clerk/express";
import User from "../models/User.js";

export const protect = async (req, res, next) => {
  try {
    const auth = await req.auth();

    console.log(auth);

    if (!auth.userId) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated",
      });
    }

    let user = await User.findById(auth.userId);

    if (!user) {
      const clerkUser = await clerkClient.users.getUser(auth.userId);

      user = await User.create({
        _id: clerkUser.id,
        name:
          `${clerkUser.firstName ?? ""} ${clerkUser.lastName ?? ""}`.trim() ||
          "User",
        email: clerkUser.emailAddresses[0]?.emailAddress ?? "",
        image: clerkUser.imageUrl ?? "",
        role: "user",
      });
    }

    req.user = user;

    next();

  } catch (err) {
    console.error(err);

    return res.status(401).json({
      success: false,
      message: err.message,
    });
  }
};