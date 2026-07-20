import Hotel from "../models/Hotel.js";
import User from "../models/User.js";

// ============================================================
// Register Hotel
// ============================================================

export const registerHotel = async (req, res) => {
  try {
    console.log("========== REGISTER HOTEL ==========");
    console.log("req.user:", req.user);

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication failed",
      });
    }

    const { name, address, contact, city } = req.body;

    if (!name || !address || !contact || !city) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // Since your User _id is the Clerk ID, this is correct
    const owner = req.user._id;

    const existingHotel = await Hotel.findOne({ owner });

    if (existingHotel) {
      return res.json({
        success: false,
        message: "You already have a hotel registered.",
      });
    }

    const hotel = await Hotel.create({
      name: name.trim(),
      address: address.trim(),
      contact: contact.trim(),
      city: city.trim(),
      owner,
    });

    await User.findByIdAndUpdate(owner, {
      role: "hotelOwner",
    });

    return res.json({
      success: true,
      hotel,
      message: "Hotel registered successfully.",
    });
  } catch (err) {
    console.log("=========== HOTEL ERROR ===========");
    console.log(err);
    console.log("===================================");

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};