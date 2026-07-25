import React, { useEffect, useMemo, useState } from "react";
import CalendarGrid from "./CalendarGrid";

const OwnerCalendar = ({ bookings = [] }) => {
  const [selectedDate, setSelectedDate] = useState(null);

  const activeBookings = useMemo(
    () => bookings.filter((b) => b.status !== "cancelled"),
    [bookings]
  );

  const bookedRanges = useMemo(
    () =>
      activeBookings.map((b) => ({
        checkInDate: b.checkInDate,
        checkOutDate: b.checkOutDate,
      })),
    [activeBookings]
  );

  const bookingsOnDate = useMemo(() => {
    if (!selectedDate) return [];
    const target = new Date(selectedDate);
    target.setHours(0, 0, 0, 0);

    return activeBookings.filter((b) => {
      const start = new Date(b.checkInDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(b.checkOutDate);
      end.setHours(0, 0, 0, 0);
      return target >= start && target < end;
    });
  }, [selectedDate, activeBookings]);

  return (
    <section className="mt-8 max-w-5xl pb-8">
      <h2 className="text-xl text-blue-950/70 font-medium mb-4">Booking Calendar</h2>
      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_280px] gap-4">
        <CalendarGrid
          bookedRanges={bookedRanges}
          onDateClick={setSelectedDate}
          selectedCheckIn={selectedDate}
          compact
        />

        <div className="bg-white border border-gray-200 rounded-xl p-4 min-h-48">
          <p className="font-medium text-gray-800 mb-3">
            {selectedDate
              ? `Bookings on ${new Date(selectedDate).toLocaleDateString()}`
              : "Select a date to see bookings"}
          </p>

          {selectedDate && bookingsOnDate.length === 0 && (
            <p className="text-sm text-gray-500">No bookings on this date.</p>
          )}

          <div className="space-y-3 max-h-72 overflow-y-auto">
            {bookingsOnDate.map((b) => (
              <div key={b._id} className="border border-gray-100 rounded-lg p-3 text-sm">
                <p className="font-medium">{b.user?.name || "Guest"}</p>
                <p className="text-gray-500">{b.room?.roomType}</p>
                <p className="text-gray-400 text-xs mt-1">
                  {new Date(b.checkInDate).toLocaleDateString()} → {new Date(b.checkOutDate).toLocaleDateString()}
                </p>
                <span className={`inline-block mt-2 text-xs px-2 py-0.5 rounded-full ${
                  b.isPaid ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
                }`}>
                  {b.isPaid ? "Paid" : "Pending"}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default OwnerCalendar;
