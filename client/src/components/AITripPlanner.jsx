import React, { useState } from "react";
import toast from "react-hot-toast";
import { useAppContext } from "../context/AppContext";
import { downloadTripPlanPDF } from "../utils/tripPdf";

const AITripPlanner = () => {
  const { axios, navigate, currency } = useAppContext();

  const [destination, setDestination] = useState("");
  const [days, setDays] = useState(3);
  const [budget, setBudget] = useState(2000);
  const [travelers, setTravelers] = useState(2);
  const [checkInDate, setCheckInDate] = useState("");
  const [interests, setInterests] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const { data } = await axios.post("/api/ai/trip-planner", {
        destination,
        days: Number(days),
        budget: Number(budget),
        travelers: Number(travelers),
        checkInDate,
        interests: interests.split(",").map((s) => s.trim()).filter(Boolean),
      });

      if (data.success) {
        setResult(data);
        toast.success("Trip plan ready!");
      } else {
        toast.error(data.message || "Could not generate plan");
      }
    } catch {
      toast.error("Trip planner unavailable");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="trip-planner" className="px-4 md:px-16 lg:px-24 xl:px-32 py-16 md:py-20 bg-white">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-8">
          <span className="inline-block bg-indigo-100 text-indigo-700 text-xs font-medium px-3 py-1 rounded-full mb-3">
            TRAVELWITHASH AI PLANNER
          </span>
          <h2 className="text-2xl md:text-4xl font-playfair mb-2">Plan Your Perfect Trip</h2>
          <p className="text-gray-500 text-sm md:text-base max-w-xl mx-auto">
            Fill in your destination, travel length, total trip budget, and group size. Ash will create a day-by-day itinerary with a stay recommendation.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-gray-50 rounded-2xl p-4 md:p-8 border border-gray-100">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
            <label className="flex flex-col gap-1 text-xs font-medium text-gray-600">Destination / city <input required type="text" placeholder="e.g. Dubai or London" value={destination} onChange={(e) => setDestination(e.target.value)} className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm font-normal outline-none focus:border-blue-400" /></label>
            <label className="flex flex-col gap-1 text-xs font-medium text-gray-600">Trip length (days) <input required type="number" min={1} max={14} value={days} onChange={(e) => setDays(e.target.value)} placeholder="e.g. 5" className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm font-normal outline-none focus:border-blue-400" /></label>
            <label className="flex flex-col gap-1 text-xs font-medium text-gray-600">Total trip budget ({currency}) <input required type="number" min={100} value={budget} onChange={(e) => setBudget(e.target.value)} placeholder="For the entire trip, e.g. 2000" className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm font-normal outline-none focus:border-blue-400" /></label>
            <label className="flex flex-col gap-1 text-xs font-medium text-gray-600">Number of travellers <input required type="number" min={1} value={travelers} onChange={(e) => setTravelers(e.target.value)} placeholder="e.g. 2 people" className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm font-normal outline-none focus:border-blue-400" /></label>
            <label className="flex flex-col gap-1 text-xs font-medium text-gray-600">Departure / check-in date <input type="date" value={checkInDate} onChange={(e) => setCheckInDate(e.target.value)} min={new Date().toISOString().split("T")[0]} className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm font-normal outline-none focus:border-blue-400" /></label>
            <label className="flex flex-col gap-1 text-xs font-medium text-gray-600">What do you enjoy? <input type="text" value={interests} onChange={(e) => setInterests(e.target.value)} placeholder="e.g. food, beaches, museums" className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm font-normal outline-none focus:border-blue-400 sm:col-span-2 lg:col-span-1" /></label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full md:w-auto bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-xl text-sm font-medium disabled:opacity-60"
          >
            {loading ? "Planning your trip…" : "Generate Trip Plan"}
          </button>
        </form>

        {result?.plan && (
          <div className="mt-8 bg-white border border-gray-200 rounded-2xl p-4 md:p-8">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
              <div>
                <h3 className="text-xl md:text-2xl font-playfair">{result.plan.title}</h3>
                <p className="text-gray-500 text-sm mt-2">{result.plan.summary}</p>
              </div>
              <button
                onClick={() => downloadTripPlanPDF(result.plan, result.destination, result.recommendedRoom)}
                className="shrink-0 bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-lg text-sm font-medium"
              >
                Download PDF
              </button>
            </div>

            {result.recommendedRoom && (
              <div className="bg-blue-50 rounded-xl p-4 mb-6 flex flex-col sm:flex-row gap-4 items-start">
                <img
                  src={result.recommendedRoom.images?.[0]}
                  alt=""
                  className="w-full sm:w-32 h-24 object-cover rounded-lg"
                />
                <div className="flex-1">
                  <p className="font-medium">{result.recommendedRoom.hotel?.name}</p>
                  <p className="text-sm text-gray-500">{result.recommendedRoom.hotel?.city} · {result.recommendedRoom.roomType}</p>
                  <p className="text-blue-600 font-medium text-sm mt-1">${result.recommendedRoom.pricePerNight}/night</p>
                  <button
                    onClick={() => { navigate(`/rooms/${result.recommendedRoom._id}`); window.scrollTo(0, 0); }}
                    className="mt-2 text-sm text-blue-600 hover:underline"
                  >
                    Book this hotel →
                  </button>
                </div>
              </div>
            )}

            {result.plan.estimatedBudget && (
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
                {Object.entries(result.plan.estimatedBudget).map(([key, val]) => (
                  <div key={key} className="bg-gray-50 rounded-lg p-3 text-center">
                    <p className="text-xs text-gray-500 capitalize">{key}</p>
                    <p className="font-semibold text-sm">${val}</p>
                  </div>
                ))}
              </div>
            )}

            <div className="space-y-4">
              {result.plan.days?.map((day) => (
                <div key={day.day} className="border border-gray-100 rounded-xl p-4">
                  <p className="font-semibold text-blue-700">Day {day.day}: {day.title}</p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3 text-sm text-gray-600">
                    {day.morning && <p><span className="font-medium text-gray-800">Morning:</span> {day.morning}</p>}
                    {day.afternoon && <p><span className="font-medium text-gray-800">Afternoon:</span> {day.afternoon}</p>}
                    {day.evening && <p><span className="font-medium text-gray-800">Evening:</span> {day.evening}</p>}
                  </div>
                  {day.tips && <p className="text-xs text-indigo-600 mt-2">💡 {day.tips}</p>}
                </div>
              ))}
            </div>

            {result.plan.packingList?.length > 0 && (
              <div className="mt-6">
                <p className="font-medium mb-2">Packing List</p>
                <div className="flex flex-wrap gap-2">
                  {result.plan.packingList.map((item, i) => (
                    <span key={i} className="text-xs bg-gray-100 px-3 py-1 rounded-full">{item}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
};

export default AITripPlanner;
