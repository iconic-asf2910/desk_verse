import { Link } from "react-router-dom";

const CTA = () => {
  return (
    <section className="bg-slate-100 px-14 py-16 text-center">
      <h2 className="text-3xl font-semibold text-black">
        Ready to Get Started?
      </h2>

      <p className="mt-3 text-gray-600">
        Create your workspace and start collaborating with your team.
      </p>

      <Link
        to="/signup"
        className="mt-6 inline-block rounded-md bg-blue-600 px-6 py-3 text-white hover:bg-blue-700"
      >
        Get Started
      </Link>
    </section>
  );
};

export default CTA;