import { Link } from "react-router-dom";

const HomeNavbar = () => {
  return (
    <nav className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-14">
      <Link to="/" className="flex h-10 w-10 items-center justify-center" />

      <div className="flex items-center gap-5">
        <Link to="/login" className="text-sm text-gray-900 hover:text-blue-600">
          Log In
        </Link>

        <Link
          to="/signup"
          className="rounded-md bg-blue-600 px-3 py-2 text-sm text-white hover:bg-blue-700"
        >
          Get Started
        </Link>
      </div>
    </nav>
  );
};

export default HomeNavbar;
