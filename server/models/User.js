import mongoose from "mongoose";

// ----- USER MODEL -----
// Each user is stored with their Clerk ID as the primary key.
// The 'recentSearchedCities' field keeps track of the last 3 cities searched.

const userSchema = new mongoose.Schema({
    _id: { type: String, required: true },          // Clerk user ID (e.g. "user_abc123")
    name: { type: String, required: true },
    email: { type: String, required: true },
    image: { type: String, required: true },
    role: { type: String, enum: ["user", "hotelOwner"], default: "user" },
    recentSearchedCities: [{ type: String }],       // BUG FIX: was "recentSearchCities" (missing 'd')
}, { timestamps: true });

const User = mongoose.model("User", userSchema);

export default User;
