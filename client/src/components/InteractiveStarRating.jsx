import React, { useState } from "react";
import { assets } from "../assets/assets";

const InteractiveStarRating = ({ rating, onChange, size = "w-6 h-6" }) => {
  const [hover, setHover] = useState(0);

  return (
    <div className="flex gap-1">
      {Array(5)
        .fill("")
        .map((_, index) => {
          const value = index + 1;
          const filled = (hover || rating) >= value;
          return (
            <button
              key={index}
              type="button"
              onClick={() => onChange?.(value)}
              onMouseEnter={() => setHover(value)}
              onMouseLeave={() => setHover(0)}
              className="cursor-pointer"
            >
              <img
                src={filled ? assets.starIconFilled : assets.starIconOutlined}
                alt={`${value} star`}
                className={size}
              />
            </button>
          );
        })}
    </div>
  );
};

export default InteractiveStarRating;
