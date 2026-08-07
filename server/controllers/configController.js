import HotelbedsConfig from "../models/HotelbedsConfig.js";

// @desc    Get Hotelbeds Config
// @route   GET /api/config/hotelbeds
// @access  Public (or Protected based on auth setup, using Public for demo)
export const getHotelbedsConfig = async (req, res) => {
  try {
    let config = await HotelbedsConfig.findOne();
    if (!config) {
      // Return defaults if none exists
      return res.json({ success: true, config: null });
    }
    res.json({ success: true, config });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// @desc    Save/Update Hotelbeds Config
// @route   POST /api/config/hotelbeds
// @access  Public (or Protected)
export const saveHotelbedsConfig = async (req, res) => {
  try {
    const data = req.body;
    let config = await HotelbedsConfig.findOne();

    if (config) {
      // Update existing
      config = await HotelbedsConfig.findOneAndUpdate({}, data, { new: true });
    } else {
      // Create new
      config = await HotelbedsConfig.create(data);
    }

    res.json({ success: true, config, message: "Configuration saved successfully" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};
