import React, { useState } from "react";
import { useAppContext } from "../context/AppContext";

// ============================================================
// AI RECOMMENDATIONS COMPONENT  (NEW)
// ============================================================
// Placed on the Home page just above the footer.
//
// How it works:
//  1. User fills in their preferences (city, max budget,
//     desired amenities, guest count, and travel dates).
//  2. On submit, we call POST /api/ai/recommend.
//  3. The backend pre-filters available rooms from MongoDB,
//     then asks the AI to rank the top 3 and explain WHY each
//     is a good match for this specific traveller.
//  4. Cards are shown below the form with an AI score badge
//     and the personalised reason.
// ============================================================

const AMENITY_OPTIONS = [
    "Free WiFi",
    "Free Breakfast",
    "Room Service",
    "Mountain View",
    "Pool Access",
];

const AIRecommendations = () => {
    const { axios, navigate, currency } = useAppContext();

    const [city, setCity] = useState("");
    const [budget, setBudget] = useState("");
    const [guests, setGuests] = useState(1);
    const [checkInDate, setCheckInDate] = useState("");
    const [checkOutDate, setCheckOutDate] = useState("");
    const [selectedAmenities, setSelectedAmenities] = useState([]);

    const [recommendations, setRecommendations] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [searched, setSearched] = useState(false);
    const [message, setMessage] = useState("");

    // Toggle an amenity checkbox
    const toggleAmenity = (amenity) => {
        setSelectedAmenities((prev) =>
            prev.includes(amenity) ? prev.filter((a) => a !== amenity) : [...prev, amenity]
        );
    };

    // Submit handler — calls the AI recommendation endpoint
    const handleRecommend = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setSearched(true);
        setRecommendations([]);
        setMessage("");

        try {
            const { data } = await axios.post("/api/ai/recommend", {
                city,
                budget: budget || 9999,
                amenities: selectedAmenities,
                guests,
                checkInDate,
                checkOutDate,
            });

            if (data.success) {
                setRecommendations(data.recommendations || []);
                setMessage(data.message || "");
            } else {
                setMessage(data.message || "Something went wrong.");
            }
        } catch (error) {
            setMessage("Could not reach the recommendation service. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <section className="px-4 md:px-16 lg:px-24 xl:px-32 py-20 bg-gradient-to-b from-white to-blue-50">

            {/* ---- Section header ---- */}
            <div className="text-center mb-10">
                <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-1.5 rounded-full text-sm font-medium mb-4">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.347.347a4 4 0 01-1.166 1.093L12 21l-1.923-1.661a4 4 0 01-1.166-1.093l-.347-.347z" />
                    </svg>
                    AI-Powered
                </div>
                <h2 className="text-3xl md:text-4xl font-playfair mb-3">
                    Find Your Perfect Room
                </h2>
                <p className="text-gray-500 max-w-xl mx-auto">
                    Tell us your preferences and our AI will recommend the best-matched rooms from our listings, with a personalised explanation for each.
                </p>
            </div>

            {/* ---- Preferences Form ---- */}
            <form
                onSubmit={handleRecommend}
                className="bg-white rounded-2xl shadow-lg p-6 md:p-8 max-w-4xl mx-auto"
            >
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-6">

                    {/* City */}
                    <div className="flex flex-col gap-1">
                        <label className="text-sm font-medium text-gray-700">City / Destination</label>
                        <input
                            type="text"
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                            placeholder="e.g. Dubai, New York"
                            className="border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400"
                        />
                    </div>

                    {/* Budget */}
                    <div className="flex flex-col gap-1">
                        <label className="text-sm font-medium text-gray-700">Max Budget / Night ({currency})</label>
                        <input
                            type="number"
                            value={budget}
                            onChange={(e) => setBudget(e.target.value)}
                            placeholder="e.g. 300"
                            min={1}
                            className="border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400"
                        />
                    </div>

                    {/* Guests */}
                    <div className="flex flex-col gap-1">
                        <label className="text-sm font-medium text-gray-700">Guests</label>
                        <input
                            type="number"
                            value={guests}
                            onChange={(e) => setGuests(Number(e.target.value))}
                            min={1}
                            className="border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400"
                        />
                    </div>

                    {/* Check-in */}
                    <div className="flex flex-col gap-1">
                        <label className="text-sm font-medium text-gray-700">Check-In (optional)</label>
                        <input
                            type="date"
                            value={checkInDate}
                            onChange={(e) => setCheckInDate(e.target.value)}
                            min={new Date().toISOString().split('T')[0]}
                            className="border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400"
                        />
                    </div>

                    {/* Check-out */}
                    <div className="flex flex-col gap-1">
                        <label className="text-sm font-medium text-gray-700">Check-Out (optional)</label>
                        <input
                            type="date"
                            value={checkOutDate}
                            onChange={(e) => setCheckOutDate(e.target.value)}
                            min={checkInDate}
                            disabled={!checkInDate}
                            className="border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400 disabled:opacity-50"
                        />
                    </div>

                </div>

                {/* Amenities */}
                <div className="mb-6">
                    <p className="text-sm font-medium text-gray-700 mb-3">Preferred Amenities</p>
                    <div className="flex flex-wrap gap-2">
                        {AMENITY_OPTIONS.map((amenity) => (
                            <button
                                key={amenity}
                                type="button"
                                onClick={() => toggleAmenity(amenity)}
                                className={`px-3 py-1.5 rounded-full text-sm border transition-all ${
                                    selectedAmenities.includes(amenity)
                                        ? "bg-blue-600 text-white border-blue-600"
                                        : "bg-white text-gray-600 border-gray-300 hover:border-gray-400"
                                }`}
                            >
                                {amenity}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Submit */}
                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-xl
                        transition-all active:scale-98 disabled:opacity-60 flex items-center justify-center gap-2"
                >
                    {isLoading ? (
                        <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            AI is thinking…
                        </>
                    ) : (
                        <>
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                            Get AI Recommendations
                        </>
                    )}
                </button>
            </form>

            {/* ---- Results ---- */}
            {searched && !isLoading && (
                <div className="max-w-4xl mx-auto mt-10">

                    {message && recommendations.length === 0 && (
                        <p className="text-center text-gray-500 py-8">{message}</p>
                    )}

                    {recommendations.length > 0 && (
                        <>
                            <h3 className="text-xl font-playfair mb-6 text-center">
                                AI Top {recommendations.length} Match{recommendations.length > 1 ? "es" : ""}
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {recommendations.map((rec, i) => (
                                    <div
                                        key={rec.room._id}
                                        className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 hover:shadow-lg transition-shadow"
                                    >
                                        {/* Room image */}
                                        <div className="relative">
                                            <img
                                                src={rec.room.images?.[0]}
                                                alt={rec.hotel.name}
                                                className="w-full h-44 object-cover"
                                            />
                                            {/* AI Score badge */}
                                            <div className="absolute top-3 right-3 bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                                                AI {rec.score}/10
                                            </div>
                                            {/* Rank badge */}
                                            <div className="absolute top-3 left-3 bg-white/90 text-gray-800 text-xs font-bold px-2 py-1 rounded-full">
                                                #{i + 1}
                                            </div>
                                        </div>

                                        <div className="p-4">
                                            <p className="font-playfair text-lg mb-1">{rec.hotel.name}</p>
                                            <p className="text-gray-500 text-sm mb-1">{rec.hotel.city} · {rec.room.roomType}</p>
                                            <p className="text-blue-600 font-medium text-sm mb-3">
                                                {currency}{rec.room.pricePerNight} / night
                                            </p>

                                            {/* AI explanation */}
                                            <div className="bg-blue-50 rounded-lg p-3 mb-4">
                                                <p className="text-xs text-blue-700 leading-relaxed">
                                                    <span className="font-semibold">Why this room? </span>
                                                    {rec.reason}
                                                </p>
                                            </div>

                                            {/* Amenities chips */}
                                            <div className="flex flex-wrap gap-1 mb-4">
                                                {rec.room.amenities?.slice(0, 3).map((a, idx) => (
                                                    <span key={idx} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                                                        {a}
                                                    </span>
                                                ))}
                                            </div>

                                            <button
                                                onClick={() => { navigate(`/rooms/${rec.room._id}`); window.scrollTo(0, 0); }}
                                                className="w-full text-center bg-blue-600 hover:bg-blue-700 text-white text-sm
                                                    py-2 rounded-lg transition-all"
                                            >
                                                View Room
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            )}
        </section>
    );
};

export default AIRecommendations;
