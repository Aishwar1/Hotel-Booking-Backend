import React, { useMemo, useState } from "react";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const toDateKey = (date) => {
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

const isDateInRange = (date, start, end) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const s = new Date(start);
  s.setHours(0, 0, 0, 0);
  const e = new Date(end);
  e.setHours(0, 0, 0, 0);
  return d >= s && d < e;
};

const CalendarGrid = ({
  bookedRanges = [],
  onDateClick,
  selectedCheckIn,
  selectedCheckOut,
  compact = false,
}) => {
  const today = new Date();
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [viewYear, setViewYear] = useState(today.getFullYear());

  const bookedDateKeys = useMemo(() => {
    const keys = new Set();
    bookedRanges.forEach(({ checkInDate, checkOutDate }) => {
      const current = new Date(checkInDate);
      current.setHours(0, 0, 0, 0);
      const end = new Date(checkOutDate);
      end.setHours(0, 0, 0, 0);
      while (current < end) {
        keys.add(toDateKey(current));
        current.setDate(current.getDate() + 1);
      }
    });
    return keys;
  }, [bookedRanges]);

  const days = useMemo(() => {
    const firstDay = new Date(viewYear, viewMonth, 1);
    const lastDay = new Date(viewYear, viewMonth + 1, 0);
    const grid = [];

    for (let i = 0; i < firstDay.getDay(); i++) grid.push(null);

    for (let d = 1; d <= lastDay.getDate(); d++) {
      grid.push(new Date(viewYear, viewMonth, d));
    }

    return grid;
  }, [viewMonth, viewYear]);

  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const monthLabel = new Date(viewYear, viewMonth).toLocaleString("default", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className={`bg-white rounded-xl border border-gray-200 ${compact ? "p-3" : "p-4 md:p-5"}`}>
      <div className="flex items-center justify-between mb-3">
        <button type="button" onClick={prevMonth} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-600">
          ‹
        </button>
        <p className={`font-medium text-gray-800 ${compact ? "text-sm" : "text-base"}`}>{monthLabel}</p>
        <button type="button" onClick={nextMonth} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-600">
          ›
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-1">
        {WEEKDAYS.map((day) => (
          <div key={day} className={`text-center text-gray-400 font-medium ${compact ? "text-[10px]" : "text-xs"}`}>
            {compact ? day[0] : day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {days.map((date, i) => {
          if (!date) return <div key={`empty-${i}`} />;

          const key = toDateKey(date);
          const isBooked = bookedDateKeys.has(key);
          const isPast = date < new Date(today.getFullYear(), today.getMonth(), today.getDate());
          const isSelected =
            (selectedCheckIn && isDateInRange(date, selectedCheckIn, selectedCheckOut || selectedCheckIn)) ||
            (selectedCheckIn && toDateKey(selectedCheckIn) === key) ||
            (selectedCheckOut && toDateKey(selectedCheckOut) === key);

          let cellClass = "bg-green-50 text-green-700 border-green-200";
          if (isPast) cellClass = "bg-gray-50 text-gray-300 border-gray-100";
          else if (isBooked) cellClass = "bg-red-100 text-red-700 border-red-200";
          else if (isSelected) cellClass = "bg-blue-100 text-blue-700 border-blue-300";

          return (
            <button
              key={key}
              type="button"
              disabled={isPast || isBooked}
              onClick={() => onDateClick?.(key)}
              className={`aspect-square rounded-md border text-center flex items-center justify-center transition-all
                ${compact ? "text-[10px] min-h-9" : "text-xs"}
                ${cellClass}
                ${!isPast && !isBooked && onDateClick ? "hover:ring-2 hover:ring-blue-300 cursor-pointer" : "cursor-default"}
              `}
              title={isBooked ? "Booked" : isPast ? "Past" : "Available"}
            >
              {date.getDate()}
            </button>
          );
        })}
      </div>

      <div className={`flex flex-wrap gap-3 mt-3 ${compact ? "text-[10px]" : "text-xs"} text-gray-500`}>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-green-50 border border-green-200" /> Available</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-red-100 border border-red-200" /> Booked</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-blue-100 border border-blue-300" /> Selected</span>
      </div>
    </div>
  );
};

export default CalendarGrid;
