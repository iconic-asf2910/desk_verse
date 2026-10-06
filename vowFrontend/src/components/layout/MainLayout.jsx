import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

const MainLayout = () => {
  return (
    <div className="min-h-screen bg-[#f3f4f6]">
      <Navbar />

      <div className="flex">
        <Sidebar />

        <main className="min-w-0 flex-1 overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;