import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import useAuth from "../../hooks/UseAuth";

const Signup = () => {
  const { signup } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    try {
      await signup(name, email, password);
      navigate("/dashboard");
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div className="flex min-h-screen bg-white">
      <div className="relative flex w-2/5 flex-col items-center justify-center overflow-hidden bg-slate-900 px-12 text-center text-white">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-3"
          style={{ backgroundImage: "url('/bgimg.jpg')" }}
        />

        <div className="relative z-10">
          <h1 className="text-5xl font-bold tracking-tight">
            DeskVerse
          </h1>

          <p className="mt-3 text-sm text-slate-200">
            Securely access your
            <br />
            virtual workspaces.
          </p>
        </div>
      </div>

      <div className="flex w-3/5 items-center justify-center px-12">
        <div className="w-full max-w-md">
          <p className="text-sm text-gray-700">Get Started</p>

          <h2 className="mt-1 text-3xl font-bold text-gray-900">
            Create Your Account
          </h2>

          <div className="mt-7 space-y-3">
            <button
              type="button"
              className="flex w-full items-center justify-center gap-3 rounded-md border border-gray-300 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fill="#4285F4"
                  d="M23.49 12.27c0-.79-.07-1.55-.2-2.27H12v4.3h6.45a5.52 5.52 0 0 1-2.39 3.62v3.01h3.87c2.27-2.09 3.56-5.17 3.56-8.66Z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.07 7.93-2.91l-3.87-3.01c-1.07.72-2.43 1.15-4.06 1.15-3.12 0-5.76-2.11-6.71-4.95H1.29v3.1A12 12 0 0 0 12 24Z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.29 14.28A7.2 7.2 0 0 1 4.92 12c0-.79.14-1.56.37-2.28v-3.1H1.29A12 12 0 0 0 0 12c0 1.93.46 3.75 1.29 5.38l4-3.1Z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.77c1.76 0 3.34.61 4.59 1.8l3.44-3.44C17.95 1.14 15.24 0 12 0A12 12 0 0 0 1.29 6.62l4 3.1C6.24 6.88 8.88 4.77 12 4.77Z"
                />
              </svg>

              Continue with Google
            </button>

            <button
              type="button"
              className="flex w-full items-center justify-center gap-3 rounded-md border border-gray-300 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="currentColor"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M12 .5a12 12 0 0 0-3.79 23.39c.6.11.82-.26.82-.58v-2.04c-3.34.73-4.04-1.61-4.04-1.61-.55-1.39-1.34-1.76-1.34-1.76-1.09-.75.08-.73.08-.73 1.2.09 1.83 1.23 1.83 1.23 1.07 1.83 2.8 1.3 3.49.99.11-.77.42-1.3.76-1.6-2.67-.3-5.47-1.34-5.47-5.93 0-1.31.47-2.38 1.23-3.22-.12-.3-.53-1.52.12-3.18 0 0 1-.32 3.3 1.23A11.5 11.5 0 0 1 12 6.11c1.02 0 2.05.14 3.01.41 2.29-1.55 3.29-1.23 3.29-1.23.65 1.66.24 2.88.12 3.18.77.84 1.23 1.91 1.23 3.22 0 4.6-2.8 5.62-5.48 5.92.43.37.81 1.1.81 2.22v3.29c0 .32.22.7.83.58A12 12 0 0 0 12 .5Z" />
              </svg>

              Continue with GitHub
            </button>
          </div>

          <div className="my-6 flex items-center gap-4">
            <div className="h-px flex-1 bg-gray-300" />
            <span className="text-sm text-gray-500">OR</span>
            <div className="h-px flex-1 bg-gray-300" />
          </div>

          <form onSubmit={handleSubmit}>
            <label className="block text-sm font-medium text-gray-800">
              Full Name
            </label>

            <input
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Full Name"
              required
              className="mt-2 w-full rounded-md border border-gray-300 px-4 py-3 text-sm outline-none focus:border-blue-500"
            />

            <label className="mt-4 block text-sm font-medium text-gray-800">
              Work Email address
            </label>

            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Work Email address"
              required
              className="mt-2 w-full rounded-md border border-gray-300 px-4 py-3 text-sm outline-none focus:border-blue-500"
            />

            <label className="mt-4 block text-sm font-medium text-gray-800">
              Password
            </label>

            <div className="relative mt-2">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Password"
                required
                minLength={8}
                pattern="(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).*"
                className="w-full rounded-md border border-gray-300 px-4 py-3 pr-12 text-sm outline-none focus:border-blue-500"
              />

              <button
                type="button"
                onClick={() => setShowPassword((previous) => !previous)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-800"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {error && (
              <p className="mt-4 text-sm text-red-600">{error}</p>
            )}

            <button
              type="submit"
              className="mt-5 w-full rounded-md bg-blue-600 py-3 text-sm font-medium text-white hover:bg-blue-700"
            >
              Create Account
            </button>
          </form>

          <p className="mt-5 text-center text-sm text-gray-600">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-medium text-blue-600 hover:underline"
            >
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;