import React, { useState, useMemo } from "react";
import { assets, facilityIcons } from "../assets/assets";
import { useSearchParams } from "react-router-dom";
import StarRating from "../components/StarRating";
import { useAppContext } from "../context/AppContext";
import toast from "react-hot-toast";

const AllRooms = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { rooms, navigate, currency, axios } = useAppContext();

  const [searchQuery, setSearchQuery] = useState(searchParams.get("destination") || "");
  const [smartResults, setSmartResults] = useState(null);
  const [interpretation, setInterpretation] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  const destinationFilter = searchParams.get("destination");

  const displayRooms = useMemo(() => {
    if (smartResults !== null) return smartResults;

    return rooms.filter((room) => {
      if (!destinationFilter) return true;
      return room.hotel?.city?.toLowerCase().includes(destinationFilter.toLowerCase());
    });
  }, [rooms, smartResults, destinationFilter]);

  const handleSmartSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return toast.error("Type what you're looking for");

    setIsSearching(true);
    setSmartResults(null);
    setInterpretation("");

    try {
      const { data } = await axios.post("/api/ai/smart-search", { query: searchQuery.trim() });

      if (data.success) {
        setSmartResults(data.rooms || []);
        setInterpretation(data.interpretation || "");
        setSearchParams({});
        if (!data.rooms?.length) toast.error("No rooms matched your search");
      } else {
        toast.error(data.message);
      }
    } catch {
      toast.error("Smart search unavailable");
    } finally {
      setIsSearching(false);
    }
  };

  const clearSearch = () => {
    setSearchQuery("");
    setSmartResults(null);
    setInterpretation("");
    setSearchParams({});
  };

  return (
    <div className="pt-24 md:pt-32 px-4 md:px-16 lg:px-24 xl:px-32 pb-16">
      {/* Header + AI Smart Search */}
      <div className="max-w-4xl mb-8">
        <h1 className="font-playfair text-3xl md:text-4xl">Hotel Rooms</h1>
        <p className="text-sm md:text-base text-gray-500 mt-2">
          Use AI Smart Search — just describe what you want instead of filters.
        </p>

        <form onSubmit={handleSmartSearch} className="mt-5 flex flex-col sm:flex-row gap-2">
          <div className="flex-1 relative">
            <img src={assets.searchIcon} alt="" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-40" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder='Try "cheap family room with pool in Dubai" or "luxury suite under $500"'
              className="w-full border border-gray-300 rounded-xl pl-10 pr-4 py-3 text-sm outline-none focus:border-blue-400"
            />
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={isSearching}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl text-sm font-medium disabled:opacity-60 whitespace-nowrap"
            >
              {isSearching ? "Searching…" : "AI Search"}
            </button>
            {(smartResults !== null || destinationFilter) && (
              <button
                type="button"
                onClick={clearSearch}
                className="border border-gray-300 px-4 py-3 rounded-xl text-sm hover:bg-gray-50"
              >
                Clear
              </button>
            )}
          </div>
        </form>

        {interpretation && (
          <p className="mt-3 text-sm text-blue-600 bg-blue-50 rounded-lg px-4 py-2">
            AI understood: {interpretation}
          </p>
        )}

        {destinationFilter && smartResults === null && (
          <p className="mt-3 text-sm text-gray-500">
            Showing results for: <strong>{destinationFilter}</strong>
          </p>
        )}
      </div>

      {/* Results */}
      <div className="max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-x-8">
        {displayRooms.length === 0 && (
          <p className="text-gray-500 py-12 text-center">No rooms found. Try a different search.</p>
        )}

        {displayRooms.map((room) => (
          <div
            key={room._id}
            className="flex flex-col sm:flex-row items-start py-6 gap-4 border-b border-gray-200 last:border-0"
          >
            <img
              onClick={() => { navigate(`/rooms/${room._id}`); window.scrollTo(0, 0); }}
              src={room.images[0]}
              alt=""
              className="w-full sm:w-44 lg:w-48 h-40 rounded-xl shadow-sm object-cover cursor-pointer shrink-0"
            />
            <div className="flex-1 flex flex-col gap-1.5 min-w-0">
              <p className="text-gray-500 text-sm">{room.hotel?.city}</p>
              <p
                onClick={() => { navigate(`/rooms/${room._id}`); window.scrollTo(0, 0); }}
                className="text-gray-800 text-xl md:text-2xl font-playfair cursor-pointer hover:text-blue-600"
              >
                {room.hotel?.name}
              </p>
              <div className="flex items-center gap-1">
                <StarRating rating={4} />
                <span className="text-sm text-gray-500 ml-1">{room.roomType}</span>
              </div>
              <div className="flex items-center gap-1 text-gray-500 text-sm">
                <img src={assets.locationIcon} alt="" className="w-4 h-4 shrink-0" />
                <span className="truncate">{room.hotel?.address}</span>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {room.amenities.slice(0, 4).map((item, index) => (
                  <div key={index} className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-gray-50 text-xs">
                    <img src={facilityIcons[item]} alt="" className="w-4 h-4" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
              <p className="text-lg font-semibold text-gray-800 mt-2">
                {currency}{room.pricePerNight} <span className="text-sm font-normal text-gray-500">/night</span>
              </p>
              <button
                onClick={() => { navigate(`/rooms/${room._id}`); window.scrollTo(0, 0); }}
                className="self-start mt-2 bg-blue-600 text-white text-sm px-5 py-2 rounded-lg hover:bg-blue-700"
              >
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AllRooms;
