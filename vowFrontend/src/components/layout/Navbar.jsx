import { Bell } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import useAuth from "../../hooks/UseAuth";
import useNotification from "../../hooks/UseNotification";

const Navbar = () => {
  const { user } = useAuth();
  const { unreadCount } = useNotification();
  const navigate = useNavigate();
  const location = useLocation();

  const isProfile = location.pathname === "/profile"; //We check it so the code can know which page the user is currently on and change the UI/behavior accordingly.

  return (
    <header className="sticky top-0 z-40 flex h-16 bg-[#f3f4f6]">
      <Link
        to="/dashboard"
        className="flex w-55 shrink-0 items-center gap-3 bg-[#111827] px-6 text-xl font-semibold tracking-tighttext-white"
      >
        <img
          src="/logo.png"
          alt="DeskVerse"
          className="h-9 w-9 object-contain"
        />
        <span>DeskVerse</span>
      </Link>

      <div className="flex min-w-0 flex-1 items-center justify-end border-b border-slate-300 px-4 sm:px-6">
        <button
          type="button"
          onClick={() => navigate("/notifications")}
          className="relative flex h-9 w-9 items-center justify-center rounded-full text-slate-600 transition hover:bg-slate-200"
        >
          <Bell size={20} strokeWidth={1.8} />

          {unreadCount > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-semibold text-white">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>

        <div className="mx-3 h-5 w-px bg-slate-300 sm:mx-4" />

        <Link
          to="/profile"
          className={`flex items-center gap-3 rounded-lg px-2 py-2 transition sm:px-3 ${
            isProfile ? "bg-slate-200" : "hover:bg-slate-200"
          }`}
        >
          <img
            src="/manprofile.png"
            alt="Profile"
            className="h-9 w-9 rounded-full object-cover"
          />

          <p className="hidden text-sm font-medium text-slate-900 sm:block">
            {user?.name || "User"}
          </p>
        </Link>
      </div>
    </header>
  );
};

export default Navbar;
