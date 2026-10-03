import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import HomeFooter from "../home/HomeFooter";
import { Outlet } from "react-router-dom";

const MainLayout = () => {
  return (
    <div className="min-h-screen bg-[#f3f4f6]">
      <Navbar />

      <div className="flex">
        <Sidebar />

        <div className="min-w-0 flex-1">
          <main>
            <Outlet />
          </main>

          <HomeFooter />
        </div>
      </div>
    </div>
  );
};

export default MainLayout;