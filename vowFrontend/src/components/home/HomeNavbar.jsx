import { Link } from "react-router-dom";

const HomeNavbar = () => {
  return (
    <nav>
      <Link to="/">VOW</Link>

      <div>
        <a href="#features">Features</a>
        <a href="#how-it-works">How It Works</a>

        <Link to="/login">Login</Link>
        <Link to="/signup">Get Started</Link>
      </div>
    </nav>
  );
};

export default HomeNavbar;