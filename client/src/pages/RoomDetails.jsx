import React, { useState, useEffect } from "react";
import {useParams} from "react-router-dom";
import { assets, facilityIcons, roomCommonData, roomsDummyData } from "../assets/assets";
import StarRating from "../components/StarRating";
import fakeMap from '../assets/doctor on demand.png';
import { useAppContext } from "../context/AppContext";
import toast from "react-hot-toast";

const RoomDetails = () => {
    const {id} = useParams();
    const {rooms, getToken, axios, navigate} = useAppContext();
    const [room, setRoom] = React.useState(null);
    const [mainImage, setMainImage] = React.useState(null);
    const [checkInDate, setCheckInDate] = React.useState(null);
    const [checkOutDate, setCheckOutDate] = React.useState(null);
    const [guests, setGuests] = useState(1);

    const [isAvailable, setIsAvailable] = useState(false);

    // Check if the Room is Available
    const checkAvailability = async () => {
    try {
        // Check if Check-In Date is greater than Check-Out Date
        if (new Date(checkInDate) >= new Date(checkOutDate)) {
        toast.error('Check-In Date should be less than Check-Out Date');
        return;
        }

        const { data } = await axios.post(
        '/api/bookings/check-availability',
        {
            room: id,
            checkInDate,
            checkOutDate,
        },
        {
            headers: {
            Authorization: `Bearer ${await getToken()}`,
            },
        }
        );


        if (data.success) {
        if (data.isAvailable) {
            setIsAvailable(true);
            toast.success('Room is available');
        } else {
            setIsAvailable(false);
            toast.error('Room is not available');
        }
        } else {
        toast.error(data.message);
        }
    } catch (error) {
        toast.error(error.message);
    }
    };

    // onSubmitHandler function to check availability & book the room
    const onSubmitHandler = async (e) => {
        e.preventDefault();
    try {

        if (!isAvailable) {
        return checkAvailability();
        } else {
        const { data } = await axios.post(
            '/api/bookings/book',
            {
            room: id,
            checkInDate,
            checkOutDate,
            guests,
            paymentMethod: 'Pay At Hotel',
            },
            {
            headers: {
                Authorization: `Bearer ${await getToken()}`,
            },
            }
        );

        if (data.success) {
            toast.success(data.message);
            navigate('/my-bookings');
            scrollTo(0, 0);
        } else {
            toast.error(data.message);
        }
        }
    } catch (error) {
        toast.error(error.message);
    }
    };


    useEffect(() => {
    setIsAvailable(false);
    }, [checkInDate, checkOutDate, guests]);



    useEffect(() => {
        const room = rooms.find((room) => room._id === id);
        room && setRoom(room);
        room && setMainImage(room.images[0]);
    }, [rooms]);


    return room && (
        <div className="py-28 md:py-35 px-4 md:px-16 lg:px-24 xl:px:32">
            {/* Room Details */}
            <div className="flex flex-col md:flex-row items-start md:items-center gap-2">
                <h1 className="text-3xl md:text-4xl font-playfair">{room.hotel?.name} <span className="font-inter text-sm">({room.roomType})</span></h1>
                <p className="text-xs font-inter py-1.5 px-3 text-white bg-orange-500 rounded-full">20% OFF</p>
            </div>


            {/* Room Rating */}
            <div className="flex items-center gap-1 mt-2">
                <StarRating />
                <p className="ml-2">200+ reviews</p>
            </div>
            {/* Room Address */}
            <div className="flex items-center gap-1 text-gray-500 mt-2">
                <img src={assets.locationIcon} alt="location-icon" />
                <span>{room.hotel?.address}</span>
            </div>
            {/* Room Images */}
            <div className="flex flex-col lg:flex-row mt-6 gap-6">
                <div className="lg:w-1/2 w-full">
                    <img src={mainImage} alt="Room Image" 
                    className="w-full rounded-xl shadow-lg object-cover"/>
                </div>
                <div className="grid grid-cols-2 gap-4 lg:w-1/2 w-full">
                    {room?.images.length > 1 && room.images.map((image, index)=>(
                        <img onClick={()=> setMainImage(image)}
                        key={index} src={image} alt="Room Image" 
                        className={`w-full rounded-xl shadow-md object-cover cursor-pointer ${mainImage === image && 'outline-3 outline-orange-500'}`}/>
                    ))}
                </div>
            </div>

            {/* Room Highlights */}
            <div className="flex flex-col md:flex-row md:justify-between mt-10">
                <div className="flex flex-col">
                    <h1 className="text-3xl md:text-4xl font-playfair">Experience Luxury Like Never Before</h1>
                    <div className="flex flex-wrap items-center mt-3 mb-6 gap-4">
                        {room.amenities.map((item, index)=>(
                            <div key ={index} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100">
                                <img src={facilityIcons[item]} alt={item} className="w-5 h-5"/>
                                <p className="text-xs">{item}</p>
                            </div>
                        ))}
                    </div>
                </div>
                {/* Room Price */}
                <p className="text-2xl font-medium">${room.pricePerNight}/night</p>
            </div>

            {/* CheckIn CheckOut Form */}
            <form onSubmit={onSubmitHandler} className="flex flex-col md:flex-row items-start md:items-center justify-between bg-white shadow-[0px_0px_20px_rgba(0,0,0,0.15)] p-6 rounded-xl mx-auto mt-16 max-w-6xl">
                <div className="flex flex-col flex-wrap md:flex-row items-start md:items-center gap-4 md:gap-10 text-gray-500">

                    <div className="flex flex-col">
                        <label htmlFor="checkInDate" className="font-medium">Check-In</label>
                        <input onChange={(e)=>setCheckInDate(e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                        type="date" id="checkInDate" placeholder="Check-In" className="w-full rounded border border-gray-300 px-3 py-2 mt-1.5 outline-none" required/>
                    </div>
                    <div className="w-px h-15 bg-gray-300/70 max-md:hidden"></div>
                    <div className="flex flex-col">
                        <label htmlFor="checkOutDate" className="font-medium">Check-Out</label>
                        <input onChange={(e)=>setCheckOutDate(e.target.value)}
                        min={checkInDate} disabled={!checkInDate}
                        type="date" id="checkOutDate" placeholder="Check-Out" className="w-full rounded border border-gray-300 px-3 py-2 mt-1.5 outline-none" required/>
                    </div>
                    <div className="w-px h-15 bg-gray-300/70 max-md:hidden"></div>
                    <div className="flex flex-col">
                        <label htmlFor="guests" className="font-medium">Guests</label>
                        <input onChange={(e)=>setGuests(Number(e.target.value))} value={guests}
                        type="number" id="guests" placeholder="1" className="max-w-20 rounded border border-gray-300 px-3 py-2 mt-1.5 ouline-none" required/>
                    </div>

                </div>
                <button type="submit" className="bg-blue-600 hover:bg-blue-700 active:scale-95 transition-all text-white 
             rounded-md w-full md:w-auto px-6 md:px-25 py-3 md:py-4 text-base cursor-pointer">
                    {isAvailable ? "Book Now" : "Check Availability"}
                </button>
            </form>


            {/* Common Specifications */}
            <div className="mt-25 space-y-4">
                {roomCommonData.map((spec, index)=>(
                    <div key = {index} className="flex items-start gap-2">
                        <img src={spec.icon} alt={`${spec.title}-icon`} className="w-6.5"/>
                        <div>
                            <p className="text-base">{spec.title}</p>
                            <p className="text-gray-500">{spec.description}</p>
                        </div>
                    </div>

                ))}
            </div>

            <div className="max-w-3xl border-y border-gray-300 my-15 py-10 text-gray-500"> 
                <p>Guests will be allocated on the ground floor according to availability.
                You get a comfortable Two bedroom apartment has a true city feeling. the 
                price quoted is for two guest, at the guest slow please mark the number of 
                guestes to get the exact price for groups. The Guests will be allocated 
                ground floor according to availability. You get the comfortable two bedroom 
                apartment that has a true city feeling.</p>
            </div>

            {/* Fake Map Placeholder */}
            {/* <div className="w-full h-80 my-10 rounded-lg overflow-hidden border">
                <img
                    src="https://maps.gstatic.com/tactile/basepage/pegman_sherlock.png"
                    alt="Map placeholder"
                    className="w-full h-full object-cover brightness-90"
                />
            </div> */}


            {/* <div className="w-full h-80 my-10 rounded-lg overflow-hidden border relative">
                <img
                    src="https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/World_map_blank_without_borders.svg/2000px-World_map_blank_without_borders.svg.png"
                    alt="Map placeholder"
                    className="w-full h-full object-cover opacity-90"
                />

                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="bg-white/70 px-4 py-2 rounded-md text-gray-800 font-medium shadow">
                    Map Preview (Static)
                    </div>
                </div>
            </div> */}

            <div className="w-full h-80 my-10 rounded-lg overflow-hidden border">
                <img 
                    src={fakeMap} 
                    alt="Map Placeholder" 
                    className="w-full h-full object-cover"
                />
            </div>

                    

            {/* Hosted by */}
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
                <button className="bg-blue-600 hover:bg-blue-700 active:scale-95 transition-all text-white 
             rounded-md w-full md:w-auto px-6 md:px-6 py-3 md:py-4 text-base cursor-pointer">
                    Contact Now
                </button>
            </div>

        </div>
        )
}

export default RoomDetails;