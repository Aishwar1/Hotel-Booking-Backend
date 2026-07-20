import axios from "axios";
import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser, useAuth } from "@clerk/clerk-react";
import { toast } from 'react-hot-toast';

// ============================================================
// APP CONTEXT – Global State
// ============================================================
// Always use relative URLs so the Vite proxy (dev) or Express
// static serving (production/Render) handles routing correctly.
// Do NOT read VITE_BACKEND_URL — the old .env value pointed to
// a Vercel deployment that no longer serves this app.
// ============================================================

axios.defaults.baseURL = '';    // Relative URLs — works in dev (Vite proxy) and prod (same server)

const AppContext = createContext();

export const AppProvider = ({ children }) => {

    const currency = import.meta.env.VITE_CURRENCY || '$';
    const navigate  = useNavigate();
    const { user }  = useUser();
    const { getToken } = useAuth();

    const [isOwner, setIsOwner]             = useState(false);
    const [showHotelReg, setShowHotelReg]   = useState(false);
    const [searchedCities, setSearchedCities] = useState([]);
    const [rooms, setRooms]                 = useState([]);

    // ---- Fetch all available rooms from the backend ----
    const fetchRooms = async () => {
        try {
            const { data } = await axios.get('/api/rooms');
            if (data.success) {
                setRooms(data.rooms);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

    // ---- Fetch logged-in user's role & recent searches ----
    const fetchUser = async () => {
        try {
            const { data } = await axios.get('/api/user', {
                headers: { Authorization: `Bearer ${await getToken()}` },
            });

            if (data.success) {
                setIsOwner(data.role === "hotelOwner");
                setSearchedCities(data.recentSearchedCities || []);
            } else {
                // Retry after 3 s if the user record isn't ready yet
                setTimeout(fetchUser, 3000);
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

    useEffect(() => {
        if (user) fetchUser();
    }, [user]);

    useEffect(() => {
        fetchRooms();
    }, []);

    const value = {
        currency, navigate, user, getToken, isOwner, setIsOwner, axios,
        showHotelReg, setShowHotelReg,
        searchedCities, setSearchedCities,
        rooms, setRooms,
    };

    return (
        <AppContext.Provider value={value}>
            {children}
        </AppContext.Provider>
    );
};

export const useAppContext = () => useContext(AppContext);
