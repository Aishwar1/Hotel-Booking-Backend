/**
 * Geocode an address using OpenStreetMap Nominatim (free, no API key).
 * Returns { latitude, longitude } or null if geocoding fails.
 */
export const geocodeAddress = async (address, city) => {
  const query = encodeURIComponent(`${address}, ${city}`);
  const url = `https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1`;

  try {
    const response = await fetch(url, {
      headers: { "User-Agent": "QuickStay-HotelBooking/1.0" },
    });
    const data = await response.json();

    if (data?.[0]?.lat && data?.[0]?.lon) {
      return {
        latitude: parseFloat(data[0].lat),
        longitude: parseFloat(data[0].lon),
      };
    }
  } catch (err) {
    console.error("Geocoding error:", err.message);
  }

  return null;
};
