import React from "react";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import { Outlet } from "react-router-dom";

const MainLayout = ({ children }) => {
  return (
    <div>
      <Navbar />

      <div>
        <Sidebar />

        <main>
        <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;