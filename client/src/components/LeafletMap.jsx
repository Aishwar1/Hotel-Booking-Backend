import React, { useEffect, useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const LeafletMap = ({ hotel }) => {
  const position = useMemo(() => {
    if (hotel?.latitude && hotel?.longitude) {
      return [hotel.latitude, hotel.longitude];
    }
    return null;
  }, [hotel]);

  const [resolvedPosition, setResolvedPosition] = React.useState(position);

  useEffect(() => {
    if (position) {
      setResolvedPosition(position);
      return;
    }

    if (!hotel?.address) return;

    const query = encodeURIComponent(`${hotel.address}, ${hotel.city || ""}`);
    fetch(`https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1`, {
      headers: { "User-Agent": "QuickStay-HotelBooking/1.0" },
    })
      .then((r) => r.json())
      .then((data) => {
        if (data?.[0]) {
          setResolvedPosition([parseFloat(data[0].lat), parseFloat(data[0].lon)]);
        }
      })
      .catch(() => {});
  }, [hotel, position]);

  if (!hotel) return null;

  if (!resolvedPosition) {
    return (
      <div className="w-full h-64 md:h-80 my-8 rounded-xl overflow-hidden border bg-gray-100 flex items-center justify-center text-gray-500 text-sm">
        Loading map…
      </div>
    );
  }

  return (
    <div className="w-full h-64 md:h-80 my-8 rounded-xl overflow-hidden border shadow-sm z-0">
      <MapContainer
        center={resolvedPosition}
        zoom={15}
        scrollWheelZoom={false}
        className="h-full w-full"
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={resolvedPosition}>
          <Popup>
            <strong>{hotel.name}</strong>
            <br />
            {hotel.address}
            {hotel.city ? `, ${hotel.city}` : ""}
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
};

export default LeafletMap;
