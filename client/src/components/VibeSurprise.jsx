import React, { useState } from "react";
import toast from "react-hot-toast";
import { useAppContext } from "../context/AppContext";

const VibeSurprise = () => {
  const { axios, navigate } = useAppContext();
  const [vibe, setVibe] = useState("");
  const [loading, setLoading] = useState(false);
  const [options, setOptions] = useState([]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!vibe.trim()) return toast.error("Describe your vibe first!");

    setLoading(true);
    setOptions([]);

    try {
      const { data } = await axios.post("/api/ai/vibe-surprise", { vibe: vibe.trim() });

      if (data.success && data.options?.length) {
        setOptions(data.options);
      } else {
        toast.error("No matches found. Try a different vibe!");
      }
    } catch {
      toast.error("Vibe surprise unavailable");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="vibe-surprise" className="px-4 md:px-16 lg:px-24 xl:px-32 py-16 md:py-20 bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
      <div className="max-w-4xl mx-auto text-center">
        <span className="inline-block bg-purple-100 text-purple-700 text-xs font-medium px-3 py-1 rounded-full mb-3">
          ✨ Surprise Me
        </span>
        <h2 className="text-2xl md:text-4xl font-playfair mb-2">Don't Know Where to Go?</h2>
        <p className="text-gray-500 text-sm md:text-base mb-8 max-w-lg mx-auto">
          Tell us your vibe — we'll surprise you with exactly 2 totally different destinations from our collection.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-xl mx-auto">
          <input
            type="text"
            value={vibe}
            onChange={(e) => setVibe(e.target.value)}
            placeholder="e.g. peaceful, adventurous, romantic, party..."
            className="flex-1 border border-purple-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-purple-400 bg-white"
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl text-sm font-medium disabled:opacity-60 shrink-0"
          >
            {loading ? "Finding magic…" : "Surprise Me"}
          </button>
        </form>

        {options.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-10 text-left">
            {options.map((opt, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl shadow-lg overflow-hidden border border-purple-100 hover:shadow-xl transition-shadow"
              >
                <img
                  src={opt.room?.images?.[0]}
                  alt=""
                  className="w-full h-40 object-cover"
                />
                <div className="p-5">
                  <span className="text-xs font-bold text-purple-600 uppercase">Option {i + 1}</span>
                  <h3 className="text-lg font-playfair mt-1">{opt.hotel?.name}</h3>
                  <p className="text-sm text-gray-500">{opt.hotel?.city} · {opt.room?.roomType}</p>
                  <p className="text-sm text-purple-700 mt-3 font-medium">{opt.vibeMatch}</p>
                  <p className="text-sm text-gray-600 mt-2">{opt.experience}</p>
                  <p className="text-xs text-orange-600 mt-2">✦ {opt.highlight}</p>
                  <p className="text-blue-600 font-semibold mt-3">${opt.room?.pricePerNight}/night</p>
                  <button
                    onClick={() => { navigate(`/rooms/${opt.room._id}`); window.scrollTo(0, 0); }}
                    className="mt-4 w-full bg-purple-600 hover:bg-purple-700 text-white py-2.5 rounded-lg text-sm"
                  >
                    Explore This Vibe
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default VibeSurprise;
