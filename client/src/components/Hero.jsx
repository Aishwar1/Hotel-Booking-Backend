import React, { useState, useEffect } from 'react'
import { assets, cities } from '../assets/assets'
import { useAppContext } from '../context/AppContext'

// 6 wallpapers from Unsplash — they auto-rotate every 5 seconds with a smooth crossfade.
// Each photo is a different luxury-hotel setting to keep the hero feeling fresh.
const WALLPAPERS = [
    "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1920&q=80", // resort pool at dusk
    "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=1920&q=80", // cliffside hotel
    "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1920&q=80", // infinity pool
    "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=1920&q=80", // tropical resort
    "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=1920&q=80", // beach bungalows
    "https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=1920&q=80", // luxury rooftop
];

const Hero = () => {
    const { navigate, getToken, axios, setSearchedCities } = useAppContext()
    const [destination, setDestination] = useState('');

    // Track which wallpaper is currently shown (and which is fading in)
    const [current, setCurrent] = useState(0);
    const [next, setNext]       = useState(1);
    const [fading, setFading]   = useState(false); // true while the crossfade is mid-transition

    // Advance to the next wallpaper every 5 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            setFading(true); // start fade-in of the "next" layer
            setTimeout(() => {
                // Once the transition ends, swap current ← next and prepare a new next
                setCurrent(n => (n + 1) % WALLPAPERS.length);
                setNext(n => (n + 2) % WALLPAPERS.length);
                setFading(false);
            }, 1000); // matches the CSS transition duration below
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    const onSearch = async (e) => {
        e.preventDefault();
        navigate(`/rooms?destination=${destination}`);

        // Persist the searched city for the user's recent-search history
        await axios.post(
            '/api/user/store-recent-search',
            { recentSearchedCity: destination },
            { headers: { Authorization: `Bearer ${await getToken()}` } }
        );

        setSearchedCities(prev => {
            const updated = [...prev, destination];
            if (updated.length > 3) updated.shift();
            return updated;
        });
    };

    return (
        <div className="relative flex flex-col items-start justify-center px-6 md:px-16 lg:px-24 xl:px-32 text-white h-screen overflow-hidden">

            {/* ── Background layer A (current wallpaper, always fully visible) ── */}
            <div
                className="absolute inset-0 bg-cover bg-center transition-opacity duration-1000"
                style={{ backgroundImage: `url(${WALLPAPERS[current]})`, opacity: 1 }}
            />

            {/* ── Background layer B (next wallpaper, fades in on top) ── */}
            <div
                className="absolute inset-0 bg-cover bg-center transition-opacity duration-1000"
                style={{ backgroundImage: `url(${WALLPAPERS[next]})`, opacity: fading ? 1 : 0 }}
            />

            {/* Dark gradient overlay so text stays legible over any photo */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/60" />

            {/* Dot indicators — click any dot to jump to that wallpaper */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-20">
                {WALLPAPERS.map((_, i) => (
                    <button
                        key={i}
                        onClick={() => { setCurrent(i); setNext((i + 1) % WALLPAPERS.length); }}
                        className={`w-2 h-2 rounded-full transition-all duration-300 ${i === current ? 'bg-white w-6' : 'bg-white/50'}`}
                    />
                ))}
            </div>

            {/* ── Content (sits above the backgrounds) ── */}
            <div className="relative z-10 w-full">
                <p className='bg-[#49B9FF]/50 px-3.5 py-1 rounded-full mt-20 inline-block'>
                    AI-powered stays and trips
                </p>

                <h1 className='font-playfair text-2xl md:text-5xl md:text-[56px] md:leading-[56px] font-bold md:font-extrabold max-w-xl mt-4'>
                    Discover your next unforgettable trip
                </h1>

                <p className='max-w-130 mt-2 text-sm md:text-base'>
                    Smart stays, detailed trip plans, and a travel assistant that helps you decide where to go.
                </p>

                {/* Search form — compact on mobile */}
                <form onSubmit={onSearch} className='bg-white text-gray-500 rounded-xl px-4 py-3 md:px-6 md:py-4 mt-6 md:mt-8 flex flex-col md:flex-row max-md:items-stretch gap-3 md:gap-4 max-w-4xl'>

                    <div className="flex-1 min-w-0">
                        <div className='flex items-center gap-1.5'>
                            <img src={assets.locationIcon} alt="" className='h-3.5 w-3.5 opacity-60' />
                            <label htmlFor="destinationInput" className="text-xs md:text-sm">Destination</label>
                        </div>
                        <input
                            onChange={e => setDestination(e.target.value)}
                            value={destination}
                            list='destinations'
                            id="destinationInput"
                            type="text"
                            className="w-full rounded border border-gray-200 px-3 py-1.5 mt-1 text-sm outline-none"
                            placeholder="Where to?"
                            required
                        />
                        <datalist id='destinations'>
                            {cities.map((city, i) => <option value={city} key={i} />)}
                        </datalist>
                    </div>

                    <div className="grid grid-cols-3 gap-2 md:flex md:gap-4">
                        <div>
                            <label htmlFor="checkIn" className="text-xs md:text-sm">Check in</label>
                            <input id="checkIn" type="date" className="w-full rounded border border-gray-200 px-2 py-1.5 mt-1 text-xs md:text-sm outline-none" />
                        </div>
                        <div>
                            <label htmlFor="checkOut" className="text-xs md:text-sm">Check out</label>
                            <input id="checkOut" type="date" className="w-full rounded border border-gray-200 px-2 py-1.5 mt-1 text-xs md:text-sm outline-none" />
                        </div>
                        <div>
                            <label htmlFor="guests" className="text-xs md:text-sm">Guests</label>
                            <input min={1} max={4} id="guests" type="number" defaultValue={1} className="w-full rounded border border-gray-200 px-2 py-1.5 mt-1 text-xs md:text-sm outline-none" />
                        </div>
                    </div>

                    <button className='flex items-center justify-center gap-1.5 rounded-lg bg-black py-2.5 md:py-3.5 px-5 md:px-7 text-white text-sm cursor-pointer md:self-end shrink-0'>
                        <img src={assets.searchIcon} alt="" className='h-4 w-4 invert' />
                        <span>Search</span>
                    </button>
                </form>
            </div>
        </div>
    )
}

export default Hero
