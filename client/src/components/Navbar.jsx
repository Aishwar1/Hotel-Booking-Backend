import React, { useEffect, useState } from "react";
import { Link, useLocation} from "react-router-dom";
import { assets } from "../assets/assets";
import { useClerk, UserButton } from "@clerk/clerk-react";
import { useAppContext } from "../context/AppContext";

const BookIcon = ()=>(
    <svg className="w-4 h-4 text-gray-700" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" >
    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 19V4a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v13H7a2 2 0 0 0-2 2Zm0 0a2 2 0 0 0 2 2h12M9 3v14m7 0v4" />
</svg>
)

const Navbar = () => {
    const navLinks = [
        { name: 'Home',       path: '/' },
        { name: 'Hotels',     path: '/rooms' },
        { name: 'Smart Search', path: '/#smart-search' },
        { name: 'Trip Planner', path: '/#trip-planner' },
        { name: 'Surprise Me', path: '/#vibe-surprise' },
        { name: 'About',      path: '/#about' },
    ];

    const [isScrolled, setIsScrolled] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const {openSignIn} = useClerk()
    const location = useLocation()
    const {user, navigate, isOwner, setShowHotelReg} = useAppContext()

    useEffect(() => {
        if(location.pathname !== '/'){
            setIsScrolled(true)
            return;
        }else{
            setIsScrolled(false)
        }
        setIsScrolled(prev => location.pathname !== '/' ? true : prev)

        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, [location.pathname]);

    const linkClass = isScrolled ? "text-gray-700" : "text-white";

    return (
            <nav className={`fixed top-0 left-0 w-full flex items-center justify-between px-4 md:px-16 lg:px-24 xl:px-32 transition-all duration-500 z-50 ${isScrolled ? "bg-white/90 shadow-md text-gray-700 backdrop-blur-lg py-2.5 md:py-3" : "py-3 md:py-5"}`}>

                <Link to='/'>
                    <span className={`font-playfair font-bold text-lg md:text-2xl tracking-tight ${isScrolled ? "text-slate-900" : "text-white"}`}>TravelWithAsh</span>
                </Link>

                <div className="hidden lg:flex items-center gap-5 xl:gap-7">
                    {navLinks.map((link, i) => (
                        <a key={i} href={link.path} className={`group flex flex-col gap-0.5 text-sm ${linkClass}`}>
                            {link.name}
                            <div className={`${isScrolled ? "bg-gray-700" : "bg-white"} h-0.5 w-0 group-hover:w-full transition-all duration-300`} />
                        </a>
                    ))}
                    {user && isOwner && (
                        <button
                            className={`border px-3 py-1 text-xs font-light rounded-full cursor-pointer ${linkClass} transition-all`}
                            onClick={() => navigate('/owner')}
                        >
                            Dashboard
                        </button>
                    )}
                    {user && !isOwner && (
                        <button
                            className={`border px-3 py-1 text-xs font-light rounded-full cursor-pointer ${linkClass} transition-all`}
                            onClick={() => setShowHotelReg(true)}
                        >
                            List Hotel
                        </button>
                    )}
                </div>

                <div className="hidden md:flex items-center gap-3">
                {user ? 
                (<UserButton>
                    <UserButton.MenuItems>
                        <UserButton.Action label="My Bookings" labelIcon={BookIcon} onClick={()=> navigate('/my-bookings')} />
                    </UserButton.MenuItems>
                </UserButton>)
                :
                (<button onClick={openSignIn} className={`px-6 py-2 rounded-full text-sm transition-all duration-500 ${isScrolled ? "text-white bg-black" : "bg-black text-white"}`}>
                        Login
                    </button>)
                }
                </div>

                <div className="flex items-center gap-2 md:hidden">
                    {user && <UserButton>
                    <UserButton.MenuItems>
                        <UserButton.Action label="My Bookings" labelIcon={BookIcon} onClick={()=> navigate('/my-bookings')} />
                    </UserButton.MenuItems>
                </UserButton>}

                    <img onClick={()=> setIsMenuOpen(!isMenuOpen)} src={assets.menuIcon} alt="menu" className={`h-5 w-5 ${isScrolled ? "invert" : ""}`}/>
                </div>

                <div className={`fixed top-0 left-0 w-full h-screen bg-white text-base flex flex-col md:hidden items-center justify-center gap-5 font-medium text-gray-800 transition-all duration-500 z-50 ${isMenuOpen ? "translate-x-0" : "-translate-x-full"}`}>
                    <button className="absolute top-4 right-4" onClick={() => setIsMenuOpen(false)}>
                        <img src={assets.closeIcon} alt="close" className="h-5 w-5"/>
                    </button>

                    {navLinks.map((link, i) => (
                        <a key={i} href={link.path} onClick={() => setIsMenuOpen(false)} className="text-lg">
                            {link.name}
                        </a>
                    ))}

                    {user && isOwner && (
                        <button className="border px-4 py-1.5 text-sm rounded-full" onClick={() => { navigate('/owner'); setIsMenuOpen(false); }}>
                            Dashboard
                        </button>
                    )}
                    {user && !isOwner && (
                        <button className="border px-4 py-1.5 text-sm rounded-full" onClick={() => { setShowHotelReg(true); setIsMenuOpen(false); }}>
                            List Hotel
                        </button>
                    )}

                    {!user && <button onClick={openSignIn} className="bg-black text-white px-8 py-2.5 rounded-full text-sm">
                        Login
                    </button>}
                </div>
            </nav>
    );
}

export default Navbar
