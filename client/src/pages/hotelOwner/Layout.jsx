import React from "react";
import Navbar from "../../components/hotelOwner/Navbar";
import Sidebar from "../../components/hotelOwner/Sidebar";
import { Outlet } from "react-router-dom";
import { useAppContext } from "../../context/AppContext";
import { useEffect } from "react";

const Layout = () => {

  const {isOwner, navigate} = useAppContext()

  useEffect(()=>{
    if(!isOwner){
      // navigate('/')
    }
  },[isOwner])


  return (
    <div className="flex flex-col min-h-screen bg-slate-50">

      {/* Navbar */}
      <Navbar />

      <div className="flex flex-1 min-h-0">

        {/* Sidebar */}
        <Sidebar />

        {/* Main content area */}
        <main className="flex-1 min-w-0 overflow-y-auto p-4 pt-8 md:p-8 lg:p-10">
          <Outlet />
        </main>

      </div>
    </div>
  );
};

export default Layout;
