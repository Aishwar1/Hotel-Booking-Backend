/**
 * Geocode an address using Google Geocoding API.
 * Returns { latitude, longitude } or null if geocoding fails or API key is missing.
 */
export const geocodeAddress = async (address, city) => {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) return null;

  const query = encodeURIComponent(`${address}, ${city}`);
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${query}&key=${apiKey}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.status === "OK" && data.results?.[0]?.geometry?.location) {
      const { lat, lng } = data.results[0].geometry.location;
      return { latitude: lat, longitude: lng };
    }
  } catch (err) {
    console.error("Geocoding error:", err.message);
  }

  return null;
};
