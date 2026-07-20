import React from "react"
import Navbar from "./components/Navbar"
import { Route, Routes, useLocation } from "react-router-dom"
import Home from "./pages/Home"
import Footer from "./components/Footer"
import AllRooms from "./pages/AllRooms"
import RoomDetails from "./pages/RoomDetails"
import MyBookings from "./pages/MyBookings"
import HotelReg from "./components/HotelReg"
import Layout from "./pages/hotelOwner/Layout"
import Dashboard from "./pages/hotelOwner/Dashboard"
import AddRoom from "./pages/hotelOwner/AddRoom"
import ListRoom from "./pages/hotelOwner/ListRoom"
import PaymentSuccess from "./pages/PaymentSuccess"         // NEW: Stripe payment result page
import AIChatbot from "./components/AIChatbot"              // NEW: Floating AI chat widget
import { Toaster } from 'react-hot-toast'
import { useAppContext } from "./context/AppContext"

// ============================================================
// APP – Root routing component
// ============================================================
// Changes from original:
//  • Added /payment-success route (used after Stripe checkout)
//  • Added <AIChatbot /> — floats in the corner on every page
// ============================================================

const App = () => {

    const isOwnerPath = useLocation().pathname.includes("owner");
    const { showHotelReg } = useAppContext();

    return (
        <div>
            <Toaster />

            {/* Standard navbar — hidden on hotel owner dashboard */}
            {!isOwnerPath && <Navbar />}

            {/* Hotel registration modal */}
            {showHotelReg && <HotelReg />}

            <div className='min-h-[70vh]'>
                <Routes>
                    {/* ---- Public routes ---- */}
                    <Route path='/' element={<Home />} />
                    <Route path='/rooms' element={<AllRooms />} />
                    <Route path='/rooms/:id' element={<RoomDetails />} />
                    <Route path='/my-bookings' element={<MyBookings />} />
                    <Route path='/payment-success' element={<PaymentSuccess />} />   {/* NEW */}

                    {/* ---- Hotel owner dashboard ---- */}
                    <Route path='/owner' element={<Layout />}>
                        <Route index element={<Dashboard />} />
                        <Route path='add-room' element={<AddRoom />} />
                        <Route path='list-room' element={<ListRoom />} />
                    </Route>
                </Routes>
            </div>

            <Footer />

            {/* ---- AI Chat widget (floats in bottom-right corner) ---- */}
            {!isOwnerPath && <AIChatbot />}    {/* NEW */}
        </div>
    );
};

export default App;
