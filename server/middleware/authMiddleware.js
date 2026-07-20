import { clerkClient } from "@clerk/express";
import User from "../models/User.js";

// ── protect ──────────────────────────────────────────────────────────────────
// Applied to any route that requires an authenticated user.
//
// Flow:
//  1. clerkMiddleware() (mounted in server.js) verifies the JWT and populates
//     req.auth.userId with the Clerk user ID.
//  2. We look up the matching MongoDB User document using that ID.
//     The User model stores the Clerk ID as _id (type String), so findById
//     works directly — no separate clerkId field needed.
//  3. If the user is authenticated in Clerk but absent from MongoDB
//     (e.g. the Clerk webhook hasn't fired yet or the URL was wrong),
//     we call the Clerk API to fetch the profile and create the record
//     on the fly. This prevents a permanent 401 loop for legitimate users.
// ─────────────────────────────────────────────────────────────────────────────
export const protect = async (req, res, next) => {
    try {
        // Bail out early if Clerk didn't populate auth (unauthenticated request)
        const userId = req.auth?.userId;
        if (!userId) {
            return res.status(401).json({ success: false, message: "Not authenticated" });
        }

        let user = await User.findById(userId);

        // ── Auto-sync: user authenticated in Clerk but not in MongoDB yet ──
        // This happens when the Clerk webhook URL is misconfigured or the user
        // signed up before the webhook was pointing to this server.
        if (!user) {
            try {
                const clerkUser = await clerkClient.users.getUser(userId);
                user = await User.create({
                    _id:   clerkUser.id,
                    email: clerkUser.emailAddresses[0]?.emailAddress ?? "",
                    name:  `${clerkUser.firstName ?? ""} ${clerkUser.lastName ?? ""}`.trim() || "User",
                    image: clerkUser.imageUrl ?? "",
                });
            } catch (syncErr) {
                console.error("Auto-sync failed:", syncErr.message);
                return res.status(401).json({
                    success: false,
                    message: "User account not found. Please try signing out and in again.",
                });
            }
        }

        req.user = user;
        next();
    } catch (err) {
        console.error("protect middleware error:", err.message);
        res.status(500).json({ success: false, message: "Authentication error" });
    }
};
