import User from "../models/User.js";
import { Webhook } from "svix";

// ============================================================
// CLERK WEBHOOKS
// ============================================================
// Clerk fires these events when a user signs up, updates their
// profile, or deletes their account. We mirror those changes
// into our own MongoDB User collection.
//
// IMPORTANT — body parsing:
//   This route uses express.raw() (see server.js), so req.body
//   is a Buffer containing the original request bytes.
//   We pass that Buffer directly to whook.verify() so Svix can
//   check the HMAC against the unmodified bytes.
//   Only after verification do we JSON.parse() it to read data.
//
// BUG FIX: previously used 'username' field when creating/updating
//   users, but User model has a 'name' field — fixed below.
// ============================================================

const clerkWebhooks = async (req, res) => {
    try {
        const whook = new Webhook(process.env.CLERK_WEBHOOK_SECRET);

        // Svix verification headers
        const headers = {
            "svix-id":        req.headers["svix-id"],
            "svix-timestamp": req.headers["svix-timestamp"],
            "svix-signature": req.headers["svix-signature"],
        };

        // req.body is a raw Buffer from express.raw() — pass it directly
        // so Svix verifies against the original bytes, not re-serialised JSON.
        await whook.verify(req.body, headers);

        // Now safe to parse
        const { data, type } = JSON.parse(req.body);

        switch (type) {

            // ---- New user signs up ----
            case "user.created": {
                const userData = {
                    _id:   data.id,
                    email: data.email_addresses[0].email_address,
                    name:  (data.first_name + " " + data.last_name).trim(), // FIX: was 'username'
                    image: data.image_url,
                };
                await User.create(userData);
                break;
            }

            // ---- User updates their profile ----
            case "user.updated": {
                const userData = {
                    email: data.email_addresses[0].email_address,
                    name:  (data.first_name + " " + data.last_name).trim(), // FIX: was 'username'
                    image: data.image_url,
                };
                await User.findByIdAndUpdate(data.id, userData);
                break;
            }

            // ---- User deletes their account ----
            case "user.deleted": {
                await User.findByIdAndDelete(data.id);
                break;
            }

            default:
                break;
        }

        res.json({ success: true, message: "Webhook received" });

    } catch (error) {
        console.error("Clerk webhook error:", error.message);
        res.status(400).json({ success: false, message: error.message });
    }
};

export default clerkWebhooks;
