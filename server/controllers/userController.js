// ============================================================
// USER CONTROLLER
// ============================================================
// Handles reading and updating user data from MongoDB.
//
// BUG FIX: was reading 'recentSearchedCities' from req.user but
// the User model field is also 'recentSearchedCities' (after model fix).
// ============================================================

// GET /api/user/
export const getUserData = async (req, res) => {
    try {
        const role = req.user.role;
        const recentSearchedCities = req.user.recentSearchedCities || [];   // FIX: consistent field name
        res.json({ success: true, role, recentSearchedCities });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// POST /api/user/store-recent-search
// Keeps a rolling list of the last 3 cities the user searched for.
export const storeRecentSearchedCities = async (req, res) => {
    try {
        const { recentSearchedCity } = req.body;
        const user = req.user;

        if (!user.recentSearchedCities) {
            user.recentSearchedCities = [];
        }

        if (user.recentSearchedCities.length >= 3) {
            user.recentSearchedCities.shift();   // Remove oldest city
        }
        user.recentSearchedCities.push(recentSearchedCity);

        await user.save();
        res.json({ success: true, message: "City saved" });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};
