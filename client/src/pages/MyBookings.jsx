import React, { useEffect, useState } from "react";
import Title from "../components/Title";
import { assets } from "../assets/assets";
import toast from "react-hot-toast";
import { useAppContext } from "../context/AppContext";

const MyBookings = () => {
  const { axios, getToken, user } = useAppContext();

  const [bookings, setBookings] = useState([]);
  const [payingId, setPayingId] = useState(null);

  const fetchUserBookings = async () => {
    try {
      const { data } = await axios.get("/api/bookings/user", {
        headers: {
          Authorization: `Bearer ${await getToken()}`,
        },
      });

      console.log("Bookings:", data.bookings);

      if (data.success) {
        setBookings(data.bookings || []);
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  useEffect(() => {
    if (user) {
      fetchUserBookings();
    }
  }, [user]);

  const handlePayNow = async (bookingId) => {
    setPayingId(bookingId);

    try {
      const { data } = await axios.post(
        "/api/payments/create-checkout-session",
        { bookingId },
        {
          headers: {
            Authorization: `Bearer ${await getToken()}`,
          },
        }
      );

      if (data.success) {
        window.location.href = data.url;
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      setPayingId(null);
    }
  };

  return (
    <div className="py-28 md:pb-35 md:pt-32 px-4 md:px-16 lg:px-24 xl:px-32">
      <Title
        title="My Bookings"
        subTitle="Easily manage your past, current, and upcoming hotel reservations in one place."
        align="left"
      />

      <div className="max-w-6xl mt-8 w-full text-gray-800">
        <div className="hidden md:grid md:grid-cols-[3fr_2fr_1fr] border-b border-gray-300 py-3 font-medium">
          <div>Hotels</div>
          <div>Date & Timings</div>
          <div>Payment</div>
        </div>

        {bookings.length === 0 && (
          <p className="py-10 text-gray-500">
            No bookings yet.
          </p>
        )}

        {bookings
          .filter((booking) => booking.room && booking.hotel)
          .map((booking) => (
            <div
              key={booking._id}
              className="grid grid-cols-1 md:grid-cols-[3fr_2fr_1fr] border-b border-gray-300 py-6"
            >
              <div className="flex flex-col md:flex-row">
                <img
                  src={booking.room?.images?.[0] || ""}
                  alt="Room"
                  className="min-md:w-44 rounded shadow object-cover"
                />

                <div className="flex flex-col gap-2 md:ml-4 mt-3 md:mt-0">
                  <p className="font-playfair text-2xl">
                    {booking.hotel?.name}
                  </p>

                  <p>{booking.room?.roomType}</p>

                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <img src={assets.locationIcon} alt="" />
                    <span>{booking.hotel?.address}</span>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <img src={assets.guestsIcon} alt="" />
                    <span>Guests: {booking.guests}</span>
                  </div>

                  <p className="font-semibold">
                    Total: ${booking.totalPrice}
                  </p>
                </div>
              </div>

              <div className="flex gap-8 md:gap-12 mt-4 md:mt-0">
                <div>
                  <p className="font-medium">Check In</p>
                  <p className="text-gray-500">
                    {new Date(booking.checkInDate).toDateString()}
                  </p>
                </div>

                <div>
                  <p className="font-medium">Check Out</p>
                  <p className="text-gray-500">
                    {new Date(booking.checkOutDate).toDateString()}
                  </p>
                </div>
              </div>

              <div className="flex flex-col justify-center mt-4 md:mt-0">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      booking.isPaid ? "bg-green-500" : "bg-red-500"
                    }`}
                  />

                  <span
                    className={
                      booking.isPaid
                        ? "text-green-600"
                        : "text-red-500"
                    }
                  >
                    {booking.isPaid ? "Paid" : "Unpaid"}
                  </span>
                </div>

                <p className="text-xs text-gray-400 mt-1">
                  {booking.paymentMethod}
                </p>

                {!booking.isPaid && (
                  <button
                    onClick={() => handlePayNow(booking._id)}
                    disabled={payingId === booking._id}
                    className="bg-blue-600 text-white rounded-full px-4 py-2 mt-3 hover:bg-blue-700 disabled:opacity-60"
                  >
                    {payingId === booking._id
                      ? "Redirecting..."
                      : "Pay Now"}
                  </button>
                )}
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};

export default MyBookings;