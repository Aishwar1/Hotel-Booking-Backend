import React from "react";
import Navbar from "../../components/hotelOwner/Navbar";
import Sidebar from "../../components/hotelOwner/Sidebar";
import { Outlet } from "react-router-dom";

const Layout = () => {
  return (
    <div className="flex flex-col h-screen">

      {/* Navbar */}
      <Navbar />

      <div className="flex h-full">

        {/* Sidebar */}
        <Sidebar />

        {/* Main content area */}
        <div className="flex-1 p-4 pt-10 md:px-10 h-full">
          <Outlet />
        </div>

      </div>
    </div>
  );
};

export default Layout;
