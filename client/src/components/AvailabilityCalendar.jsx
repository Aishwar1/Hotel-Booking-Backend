import React, { useEffect, useState } from "react";
import CalendarGrid from "./CalendarGrid";
import { useAppContext } from "../context/AppContext";

const AvailabilityCalendar = ({ roomId, checkInDate, checkOutDate, onSelectDates }) => {
  const { axios } = useAppContext();
  const [bookedRanges, setBookedRanges] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookedDates = async () => {
      try {
        const { data } = await axios.get(`/api/bookings/room/${roomId}/dates`);
        if (data.success) {
          setBookedRanges(data.bookings);
        }
      } catch {
        // Non-critical
      } finally {
        setLoading(false);
      }
    };

    if (roomId) fetchBookedDates();
  }, [roomId, axios]);

  const handleDateClick = (dateKey) => {
    if (!onSelectDates) return;

    if (!checkInDate || (checkInDate && checkOutDate)) {
      onSelectDates(dateKey, "");
      return;
    }

    if (new Date(dateKey) <= new Date(checkInDate)) {
      onSelectDates(dateKey, "");
      return;
    }

    onSelectDates(checkInDate, dateKey);
  };

  return (
    <div className="mt-8">
      <h3 className="text-lg font-playfair mb-2">Availability Calendar</h3>
      <p className="text-sm text-gray-500 mb-4">
        Green dates are available. Red dates are already booked. Tap available dates to pick check-in and check-out.
      </p>
      {loading ? (
        <p className="text-gray-400 text-sm">Loading availability…</p>
      ) : (
        <CalendarGrid
          bookedRanges={bookedRanges}
          onDateClick={handleDateClick}
          selectedCheckIn={checkInDate}
          selectedCheckOut={checkOutDate}
          compact
        />
      )}
    </div>
  );
};

export default AvailabilityCalendar;
