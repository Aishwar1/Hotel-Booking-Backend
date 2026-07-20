import React, { useEffect, useState } from "react";
import Title from "../components/Title";
import { assets } from "../assets/assets";
import toast from "react-hot-toast";
import { useAppContext } from "../context/AppContext";

// ============================================================
// MY BOOKINGS PAGE
// ============================================================
// Shows all of the logged-in user's reservations.
//
// CHANGE: The "Pay Now" button now triggers a real Stripe
// Checkout session (via /api/payments/create-checkout-session).
// The user is redirected to Stripe's hosted page, pays, and
// comes back to /payment-success where the booking is marked paid.
// ============================================================

const MyBookings = () => {
    const { axios, getToken, user } = useAppContext();
    const [bookings, setBookings] = useState([]);
    const [payingId, setPayingId] = useState(null);   // tracks which booking is processing

    // ---- Fetch bookings for the logged-in user ----
    const fetchUserBookings = async () => {
        try {
            const { data } = await axios.get("/api/bookings/user", {
                headers: { Authorization: `Bearer ${await getToken()}` },
            });
            if (data.success) {
                setBookings(data.bookings);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

    useEffect(() => {
        if (user) fetchUserBookings();
    }, [user]);

    // ---- Stripe "Pay Now" handler ----
    const handlePayNow = async (bookingId) => {
        setPayingId(bookingId);
        try {
            const { data } = await axios.post(
                "/api/payments/create-checkout-session",
                { bookingId },
                { headers: { Authorization: `Bearer ${await getToken()}` } }
            );

            if (data.success && data.url) {
                // Redirect to Stripe's hosted payment page
                window.location.href = data.url;
            } else {
                toast.error(data.message || "Could not start payment");
            }
        } catch (error) {
            toast.error(error.message);
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

                {/* Header row */}
                <div className="hidden md:grid md:grid-cols-[3fr_2fr_1fr] w-full border-b border-gray-300 font-medium text-base py-3">
                    <div>Hotels</div>
                    <div>Date &amp; Timings</div>
                    <div>Payment</div>
                </div>

                {bookings.length === 0 && (
                    <p className="text-gray-500 py-10">No bookings yet. Go find a room!</p>
                )}

                {/* Booking rows */}
                {bookings.map((booking) => (
                    <div
                        key={booking._id}
                        className="grid grid-cols-1 md:grid-cols-[3fr_2fr_1fr] w-full border-b border-gray-300 py-6 first:border-t"
                    >
                        {/* Hotel details */}
                        <div className="flex flex-col md:flex-row">
                            <img
                                src={booking.room.images[0]}
                                alt="hotel"
                                className="min-md:w-44 rounded shadow object-cover"
                            />
                            <div className="flex flex-col gap-1.5 max-md:mt-3 min-md:ml-4">
                                <p className="font-playfair text-2xl">{booking.hotel.name}</p>
                                <span className="font-inter text-sm">{booking.room.roomType}</span>

                                <div className="flex items-center gap-1 text-sm text-gray-500">
                                    <img src={assets.locationIcon} alt="location" />
                                    <span>{booking.hotel.address}</span>
                                </div>

                                <div className="flex items-center gap-1 text-sm text-gray-500">
                                    <img src={assets.guestsIcon} alt="guests" />
                                    <span>Guests: {booking.guests}</span>
                                </div>

                                <p className="text-base font-medium">Total: ${booking.totalPrice}</p>
                            </div>
                        </div>

                        {/* Dates */}
                        <div className="flex flex-row md:items-center md:gap-12 mt-3 gap-8">
                            <div>
                                <p className="font-medium">Check-In</p>
                                <p className="text-gray-500 text-sm">{new Date(booking.checkInDate).toDateString()}</p>
                            </div>
                            <div>
                                <p className="font-medium">Check-Out</p>
                                <p className="text-gray-500 text-sm">{new Date(booking.checkOutDate).toDateString()}</p>
                            </div>
                        </div>

                        {/* Payment status + Pay Now button */}
                        <div className="flex flex-col items-start justify-center pt-3">
                            <div className="flex items-center gap-2">
                                <div className={`h-3 w-3 rounded-full ${booking.isPaid ? "bg-green-500" : "bg-red-500"}`} />
                                <p className={`text-sm font-medium ${booking.isPaid ? "text-green-600" : "text-red-500"}`}>
                                    {booking.isPaid ? "Paid" : "Unpaid"}
                                </p>
                            </div>

                            <p className="text-xs text-gray-400 mt-1">{booking.paymentMethod}</p>

                            {/* ---- Pay Now → triggers Stripe Checkout ---- */}
                            {!booking.isPaid && (
                                <button
                                    onClick={() => handlePayNow(booking._id)}
                                    disabled={payingId === booking._id}
                                    className="px-4 py-1.5 mt-3 text-xs bg-blue-600 text-white rounded-full
                                        hover:bg-blue-700 transition-all cursor-pointer disabled:opacity-60"
                                >
                                    {payingId === booking._id ? "Redirecting..." : "Pay Now"}
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
