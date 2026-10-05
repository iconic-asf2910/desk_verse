import { Bell } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import useAuth from "../../hooks/UseAuth";

const Navbar = () => {
  const { user } = useAuth();
  const location = useLocation();

  const isProfile = location.pathname === "/profile";

  return (
    <header className="flex h-16 bg-[#f3f4f6]">
      <Link
        to="/dashboard"
        className="flex w-55 items-center gap-3 bg-[#111827] px-6 text-xl font-semibold tracking-tight text-white"
      >
        <img
          src="/logo.png"
          alt="DeskVerse"
          className="h-9 w-9 object-contain"
        />

        <span>DeskVerse</span>
      </Link>

      <div className="flex flex-1 items-center justify-end border-b border-slate-300 px-6">
        <button
          type="button"
          className="flex h-9 w-9 items-center justify-center rounded-full text-slate-600 hover:bg-slate-200"
        >
          <Bell size={20} strokeWidth={1.8} />
        </button>

        <div className="mx-4 h-5 w-px bg-white/40" />

        <Link
          to="/profile"
          className={`flex items-center gap-3 rounded-lg px-3 py-2 ${
            isProfile ? "bg-slate-200" : "hover:bg-slate-200"
          }`}
        >
          <img
            src="/manprofile.png"
            alt="Profile"
            className="h-9 w-9 rounded-full object-cover"
          />

          <p className="text-sm font-medium text-slate-900">
            {user?.name || "User"}
          </p>
        </Link>

        <div className="mx-4 h-5 w-px bg-white/40" />

       
      </div>
    </header>
  );
};

export default Navbar;