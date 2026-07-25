import React from "react";

const GoogleMap = ({ hotel }) => {
  if (!hotel) return null;

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  const addressQuery = encodeURIComponent(`${hotel.address}, ${hotel.city}`);

  let mapSrc;
  if (hotel.latitude && hotel.longitude && apiKey) {
    mapSrc = `https://www.google.com/maps/embed/v1/view?key=${apiKey}&center=${hotel.latitude},${hotel.longitude}&zoom=15`;
  } else if (apiKey) {
    mapSrc = `https://www.google.com/maps/embed/v1/place?key=${apiKey}&q=${addressQuery}`;
  } else {
    mapSrc = `https://maps.google.com/maps?q=${addressQuery}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
  }

  return (
    <div className="w-full h-80 my-10 rounded-lg overflow-hidden border shadow-sm">
      <iframe
        title={`Map of ${hotel.name}`}
        src={mapSrc}
        width="100%"
        height="100%"
        style={{ border: 0 }}
        allowFullScreen
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      />
    </div>
  );
};

export default GoogleMap;
