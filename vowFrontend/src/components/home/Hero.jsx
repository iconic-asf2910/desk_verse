import { Link } from "react-router-dom";

const Hero = () => {
  return (
    <section className="flex min-h-64 items-center justify-between bg-white px-14 py-8">
      <div className="w-1/2">
        <h1 className="text-4xl font-bold leading-tight text-black">
          Recreate Spontaneous Office
          <br />
          Interactions, Anywhere.
        </h1>

        <p className="mt-4 max-w-xl text-xs leading-4 text-slate-600">
          DeskVerse is a virtual organized world that allows distributed teams
          to meet, collaborate, and communicate seamlessly through interactive
          virtual offices, real-time video chats, and integrated productivity
          tools—all in one place.
        </p>

        <div className="mt-5 flex items-center gap-5">
          <Link
            to="/dashboard"
            className="rounded-md bg-blue-600 px-2 py-1.5 text-xs text-white hover:bg-blue-700"
          >
            Enter Workspace
          </Link>

          <a
            href="#how-it-works"
            className="rounded-md border border-gray-400 px-2 py-1.5 text-xs text-gray-800 hover:bg-gray-100"
          >
            ◉ Watch Demo
          </a>
        </div>
      </div>

      <div className="flex w-5/12 justify-center">
        <img
          src="/meet.png"
          alt="Virtual workspace"
          className="h-85 w-auto object-contain"
        />
      </div>
    </section>
  );
};

export default Hero;
