import React, { useEffect, useState } from "react";
import { useAppContext } from "../context/AppContext";

const HotelNotifications = () => {
  const { axios, navigate } = useAppContext();
  const [featured, setFeatured] = useState([]);
  const [current, setCurrent] = useState(0);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    axios.get("/api/ai/featured").then(({ data }) => {
      if (data.success) setFeatured(data.featured || []);
    }).catch(() => {});
  }, [axios]);

  useEffect(() => {
    if (featured.length <= 1) return;
    const timer = setInterval(() => {
      setCurrent((c) => (c + 1) % featured.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [featured.length]);

  if (dismissed || !featured.length) return null;

  const hotel = featured[current];

  return (
    <div className="fixed top-20 md:top-24 left-3 right-3 md:left-auto md:right-6 md:w-80 z-40 animate-in">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl shadow-xl overflow-hidden">
        <div className="flex">
          <img
            src={hotel.images?.[0]}
            alt=""
            className="w-20 h-20 md:w-24 md:h-24 object-cover shrink-0"
          />
          <div className="flex-1 p-3 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <p className="text-[10px] uppercase tracking-wider text-blue-200 font-medium">Featured Deal</p>
              <button
                onClick={() => setDismissed(true)}
                className="text-white/70 hover:text-white text-xs leading-none"
                aria-label="Dismiss"
              >
                ✕
              </button>
            </div>
            <p className="font-semibold text-sm truncate">{hotel.hotel?.name}</p>
            <p className="text-xs text-blue-100 truncate">{hotel.hotel?.city} · ${hotel.pricePerNight}/night</p>
            <button
              onClick={() => { navigate(`/rooms/${hotel._id}`); window.scrollTo(0, 0); }}
              className="mt-2 text-xs bg-white text-blue-600 px-3 py-1 rounded-full font-medium hover:bg-blue-50"
            >
              View Deal →
            </button>
          </div>
        </div>
        {featured.length > 1 && (
          <div className="flex justify-center gap-1 pb-2">
            {featured.map((_, i) => (
              <span
                key={i}
                className={`w-1.5 h-1.5 rounded-full ${i === current ? "bg-white" : "bg-white/40"}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HotelNotifications;
