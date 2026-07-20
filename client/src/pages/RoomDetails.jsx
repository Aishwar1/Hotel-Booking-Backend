import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { assets, facilityIcons, roomCommonData } from "../assets/assets";
import StarRating from "../components/StarRating";
import fakeMap from '../assets/doctor on demand.png';
import { useAppContext } from "../context/AppContext";
import toast from "react-hot-toast";

// ============================================================
// ROOM DETAILS PAGE
// ============================================================
// Shows full room info and the booking form.
//
// CHANGES / FIXES:
//  • Payment method selection added (Pay At Hotel OR Pay with Stripe)
//  • When user picks Stripe, we create the booking first, then
//    redirect to Stripe Checkout via the /api/payments endpoint.
//  • Availability check and booking flows are clearly separated.
// ============================================================

const RoomDetails = () => {
    const { id } = useParams();
    const { rooms, getToken, axios, navigate, user } = useAppContext();

    const [room, setRoom] = useState(null);
    const [mainImage, setMainImage] = useState(null);
    const [checkInDate, setCheckInDate] = useState('');
    const [checkOutDate, setCheckOutDate] = useState('');
    const [guests, setGuests] = useState(1);
    const [isAvailable, setIsAvailable] = useState(false);

    // NEW: payment method selector
    const [paymentMethod, setPaymentMethod] = useState("Pay At Hotel");
    const [isBooking, setIsBooking] = useState(false);

    // ---- Find the room in the global rooms list ----
    useEffect(() => {
        const found = rooms.find((r) => r._id === id);
        if (found) {
            setRoom(found);
            setMainImage(found.images[0]);
        }
    }, [rooms, id]);

    // Reset availability when dates/guests change
    useEffect(() => {
        setIsAvailable(false);
    }, [checkInDate, checkOutDate, guests]);

    // ---- Step 1: Check availability ----
    const checkAvailability = async () => {
        if (new Date(checkInDate) >= new Date(checkOutDate)) {
            return toast.error("Check-out must be after check-in");
        }
        try {
            const { data } = await axios.post('/api/bookings/check-availability', {
                room: id,
                checkInDate,
                checkOutDate,
            });
            if (data.success) {
                setIsAvailable(data.isAvailable);
                data.isAvailable ? toast.success("Room is available!") : toast.error("Room is not available for those dates");
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

    // ---- Step 2: Book the room ----
    const onSubmitHandler = async (e) => {
        e.preventDefault();

        // If not yet checked, run availability check first
        if (!isAvailable) {
            return checkAvailability();
        }

        if (!user) {
            return toast.error("Please sign in to make a booking");
        }

        setIsBooking(true);
        try {
            // Create the booking record in the DB
            const { data } = await axios.post(
                '/api/bookings/book',
                { room: id, checkInDate, checkOutDate, guests, paymentMethod },
                { headers: { Authorization: `Bearer ${await getToken()}` } }
            );

            if (!data.success) {
                toast.error(data.message);
                setIsBooking(false);
                return;
            }

            // ---- Payment routing ----
            if (paymentMethod === "Stripe") {
                // ---- STRIPE CHECKOUT (NEW) ----
                // Ask the backend to create a Stripe Checkout session for this booking.
                const { data: payData } = await axios.post(
                    '/api/payments/create-checkout-session',
                    { bookingId: data.bookingId },
                    { headers: { Authorization: `Bearer ${await getToken()}` } }
                );

                if (payData.success && payData.url) {
                    // Redirect the user to Stripe's hosted payment page
                    window.location.href = payData.url;
                } else {
                    toast.error(payData.message || "Could not start payment");
                    navigate('/my-bookings');
                }
            } else {
                // ---- PAY AT HOTEL ----
                toast.success("Booking confirmed! You'll pay at the hotel.");
                navigate('/my-bookings');
                window.scrollTo(0, 0);
            }
        } catch (error) {
            toast.error(error.message);
        } finally {
            setIsBooking(false);
        }
    };

    if (!room) {
    return (
        <div className="py-40 flex justify-center items-center">
            <p className="text-2xl text-gray-500">Loading room details...</p>
        </div>
    );
}

    return (
        <div className="py-28 md:py-35 px-4 md:px-16 lg:px-24 xl:px-32">

            {/* ---- Room header ---- */}
            <div className="flex flex-col md:flex-row items-start md:items-center gap-2">
                <h1 className="text-3xl md:text-4xl font-playfair">
                    {room.hotel?.name}
                    <span className="font-inter text-sm ml-2">({room.roomType})</span>
                </h1>
                <p className="text-xs font-inter py-1.5 px-3 text-white bg-orange-500 rounded-full">20% OFF</p>
            </div>

            {/* ---- Rating ---- */}
            <div className="flex items-center gap-1 mt-2">
                <StarRating />
                <p className="ml-2">200+ reviews</p>
            </div>

            {/* ---- Address ---- */}
            <div className="flex items-center gap-1 text-gray-500 mt-2">
                <img src={assets.locationIcon} alt="location" />
                <span>{room.hotel?.address}</span>
            </div>

            {/* ---- Images ---- */}
            <div className="flex flex-col lg:flex-row mt-6 gap-6">
                <div className="lg:w-1/2 w-full">
                    <img src={mainImage} alt="Room" className="w-full rounded-xl shadow-lg object-cover" />
                </div>
                <div className="grid grid-cols-2 gap-4 lg:w-1/2 w-full">
                    {room.images.length > 1 && room.images.map((img, i) => (
                        <img
                            key={i}
                            src={img}
                            alt="Room"
                            onClick={() => setMainImage(img)}
                            className={`w-full rounded-xl shadow-md object-cover cursor-pointer ${mainImage === img ? 'outline outline-3 outline-orange-500' : ''}`}
                        />
                    ))}
                </div>
            </div>

            {/* ---- Highlights + Price ---- */}
            <div className="flex flex-col md:flex-row md:justify-between mt-10">
                <div className="flex flex-col">
                    <h1 className="text-3xl md:text-4xl font-playfair">Experience Luxury Like Never Before</h1>
                    <div className="flex flex-wrap items-center mt-3 mb-6 gap-4">
                        {room.amenities.map((item, i) => (
                            <div key={i} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100">
                                <img src={facilityIcons[item]} alt={item} className="w-5 h-5" />
                                <p className="text-xs">{item}</p>
                            </div>
                        ))}
                    </div>
                </div>
                <p className="text-2xl font-medium">${room.pricePerNight}/night</p>
            </div>

            {/* ============================================================
                BOOKING FORM
                Step 1: Pick dates → "Check Availability" button
                Step 2: Dates confirmed available → pick payment → "Book Now"
                ============================================================ */}
            <form
                onSubmit={onSubmitHandler}
                className="flex flex-col bg-white shadow-[0px_0px_20px_rgba(0,0,0,0.15)] p-6 rounded-xl mx-auto mt-16 max-w-6xl gap-6"
            >
                {/* Date + Guests row */}
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 md:gap-10 text-gray-500">

                    <div className="flex flex-col">
                        <label htmlFor="checkInDate" className="font-medium text-gray-700">Check-In</label>
                        <input
                            type="date"
                            id="checkInDate"
                            value={checkInDate}
                            onChange={(e) => setCheckInDate(e.target.value)}
                            min={new Date().toISOString().split('T')[0]}
                            className="rounded border border-gray-300 px-3 py-2 mt-1.5 outline-none"
                            required
                        />
                    </div>

                    <div className="w-px h-12 bg-gray-300/70 max-md:hidden" />

                    <div className="flex flex-col">
                        <label htmlFor="checkOutDate" className="font-medium text-gray-700">Check-Out</label>
                        <input
                            type="date"
                            id="checkOutDate"
                            value={checkOutDate}
                            onChange={(e) => setCheckOutDate(e.target.value)}
                            min={checkInDate}
                            disabled={!checkInDate}
                            className="rounded border border-gray-300 px-3 py-2 mt-1.5 outline-none disabled:opacity-50"
                            required
                        />
                    </div>

                    <div className="w-px h-12 bg-gray-300/70 max-md:hidden" />

                    <div className="flex flex-col">
                        <label htmlFor="guests" className="font-medium text-gray-700">Guests</label>
                        <input
                            type="number"
                            id="guests"
                            value={guests}
                            min={1}
                            onChange={(e) => setGuests(Number(e.target.value))}
                            className="max-w-20 rounded border border-gray-300 px-3 py-2 mt-1.5 outline-none"
                            required
                        />
                    </div>
                </div>

                {/* ---- Payment method (shown after availability is confirmed) ---- */}
                {isAvailable && (
                    <div className="border-t border-gray-200 pt-4">
                        <p className="font-medium text-gray-700 mb-3">Select Payment Method</p>
                        <div className="flex flex-col sm:flex-row gap-3">

                            {/* Option 1: Pay at Hotel */}
                            <label className={`flex items-center gap-3 border rounded-lg px-4 py-3 cursor-pointer transition-all
                                ${paymentMethod === "Pay At Hotel" ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-gray-400"}`}>
                                <input
                                    type="radio"
                                    name="paymentMethod"
                                    value="Pay At Hotel"
                                    checked={paymentMethod === "Pay At Hotel"}
                                    onChange={(e) => setPaymentMethod(e.target.value)}
                                    className="accent-blue-600"
                                />
                                <div>
                                    <p className="font-medium text-sm text-gray-800">Pay at Hotel</p>
                                    <p className="text-xs text-gray-500">Pay cash or card when you arrive</p>
                                </div>
                            </label>

                            {/* Option 2: Pay with Stripe */}
                            <label className={`flex items-center gap-3 border rounded-lg px-4 py-3 cursor-pointer transition-all
                                ${paymentMethod === "Stripe" ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-gray-400"}`}>
                                <input
                                    type="radio"
                                    name="paymentMethod"
                                    value="Stripe"
                                    checked={paymentMethod === "Stripe"}
                                    onChange={(e) => setPaymentMethod(e.target.value)}
                                    className="accent-blue-600"
                                />
                                <div>
                                    <p className="font-medium text-sm text-gray-800">Pay Online (Stripe)</p>
                                    <p className="text-xs text-gray-500">Secure card payment via Stripe</p>
                                </div>
                            </label>

                        </div>
                    </div>
                )}

                {/* ---- Submit button ---- */}
                <button
                    type="submit"
                    disabled={isBooking}
                    className="bg-blue-600 hover:bg-blue-700 active:scale-95 transition-all text-white
                        rounded-md px-8 py-3 text-base cursor-pointer self-end disabled:opacity-60"
                >
                    {isBooking
                        ? "Processing..."
                        : isAvailable
                            ? (paymentMethod === "Stripe" ? "Pay Now with Stripe" : "Book Now")
                            : "Check Availability"
                    }
                </button>
            </form>

            {/* ---- Common specs ---- */}
            <div className="mt-25 space-y-4">
                {roomCommonData.map((spec, i) => (
                    <div key={i} className="flex items-start gap-2">
                        <img src={spec.icon} alt={spec.title} className="w-6.5" />
                        <div>
                            <p className="text-base">{spec.title}</p>
                            <p className="text-gray-500">{spec.description}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="max-w-3xl border-y border-gray-300 my-15 py-10 text-gray-500">
                <p>Guests will be allocated on the ground floor according to availability.
                    You get a comfortable two bedroom apartment with a true city feeling.
                    The price quoted is for two guests — please mark the number of guests
                    accurately to get the exact price for groups.</p>
            </div>

            {/* ---- Map placeholder ---- */}
            <div className="w-full h-80 my-10 rounded-lg overflow-hidden border">
                <img src={fakeMap} alt="Map Placeholder" className="w-full h-full object-cover" />
            </div>

            {/* ---- Host info ---- */}
            <div className="flex flex-col items-start gap-4">
                <div className="flex gap-4">
                    <img src={room.hotel?.owner?.image} alt="Host" className="h-14 w-14 md:h-18 md:w-18 rounded-full" />
                    <div>
                        <p className="text-lg md:text-xl">Hosted by {room.hotel?.name}</p>
                        <div className="flex items-center mt-1">
                            <StarRating />
                            <p className="ml-2">200+ reviews</p>
                        </div>
                    </div>
                </div>
                <button className="bg-blue-600 hover:bg-blue-700 active:scale-95 transition-all text-white rounded-md px-6 py-3 text-base cursor-pointer">
                    Contact Now
                </button>
            </div>
        </div>
    );
};

export default RoomDetails;
