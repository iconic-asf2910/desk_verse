import { Link } from "react-router-dom";

const CTA = () => {
  return (
    <section>
      <h2>Ready to Get Started?</h2>

      <p>
        Create your VOW account and start collaborating with your team.
      </p>

      <Link to="/signup">
        Get Started
      </Link>

      <Link to="/login">
        Login
      </Link>
    </section>
  );
};

export default CTA;