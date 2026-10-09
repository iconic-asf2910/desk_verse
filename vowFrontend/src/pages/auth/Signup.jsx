import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import useAuth from "../../hooks/UseAuth";

const Signup = () => {
  const navigate = useNavigate();
  const { signup } = useAuth();

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
    <div
      className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950 bg-cover bg-center"
      style={{ backgroundImage: "url('/bgimg.jpg')" }}
    >
      <div className="absolute inset-0 bg-slate-950/92" />

      <div className="relative z-10 flex w-full max-w-6xl items-center justify-center gap-80 px-8">
        <div className="flex w-[32%] flex-col items-center text-center text-white">
          <img
            src="/logo.png"
            alt="DeskVerse Logo"
            className="mb-5 h-16 w-16 object-contain"
          />

          <h1 className="text-5xl font-semibold tracking-tight">DeskVerse</h1>

          <p className="mt-3 text-base leading-6 text-white">
            Securely access your
            <br />
            virtual workspaces.
          </p>
        </div>

        <div className="w-[2000px] rounded-lg bg-white px-14 py-12 shadow-lg">
          <div className="mb-5">
            <p className="text-base text-slate-600">Get Started</p>

            <h2 className="mt-1 text-4xl font-bold text-black">
              Create Your Account
            </h2>
          </div>

          <div className="space-y-2">
            <button
              type="button"
              className="flex h-9 w-full items-center justify-center gap-2 rounded-md border border-slate-300 text-xs text-slate-700"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fill="#4285F4"
                  d="M21.35 12.27c0-.68-.06-1.34-.17-1.97H12v3.73h5.22a4.47 4.47 0 0 1-1.94 2.93v2.44h3.14c1.84-1.69 2.93-4.18 2.93-7.13Z"
                />
                <path
                  fill="#34A853"
                  d="M12 21.9c2.63 0 4.84-.87 6.45-2.36l-3.14-2.44c-.87.58-1.98.93-3.31.93-2.54 0-4.69-1.72-5.46-4.03H3.3v2.52A9.75 9.75 0 0 0 12 21.9Z"
                />
                <path
                  fill="#FBBC05"
                  d="M6.54 14a5.87 5.87 0 0 1 0-3.73V7.75H3.3a9.75 9.75 0 0 0 0 8.77L6.54 14Z"
                />
                <path
                  fill="#EA4335"
                  d="M12 6.24c1.43 0 2.72.49 3.73 1.45l2.8-2.8C16.83 3.32 14.63 2.1 12 2.1a9.75 9.75 0 0 0-8.7 5.65l3.24 2.52C7.31 7.96 9.46 6.24 12 6.24Z"
                />
              </svg>
              Continue with Google
            </button>

            <button
              type="button"
              className="flex h-9 w-full items-center justify-center gap-2 rounded-md border border-slate-300 text-xs text-slate-700"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="currentColor"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.85 10.91.57.1.78-.25.78-.55v-2.13c-3.2.7-3.88-1.36-3.88-1.36-.52-1.33-1.28-1.68-1.28-1.68-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.56-.29-5.26-1.28-5.26-5.69 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.47.11-3.06 0 0 .97-.31 3.18 1.18A11.06 11.06 0 0 1 12 6.08c.98 0 1.97.13 2.89.38 2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.77.11 3.06.74.81 1.19 1.84 1.19 3.1 0 4.42-2.7 5.4-5.27 5.69.42.36.78 1.07.78 2.16v3.21c0 .31.21.66.79.55A11.5 11.5 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5Z" />
              </svg>
              Continue with GitHub
            </button>
          </div>

          <div className="my-4 flex items-center gap-3">
            <div className="h-px flex-1 bg-slate-300" />

            <span className="text-xs text-slate-500">OR</span>

            <div className="h-px flex-1 bg-slate-300" />
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="mb-1 block text-sm text-slate-700">
                Full Name
              </label>

              <input
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Full Name"
                required
                className="h-9 w-full rounded-md border border-slate-400 bg-[#eeeeff] px-3 text-xs outline-none focus:border-blue-500"
              />
            </div>

            <div className="mb-4">
              <label className="mb-1 block text-sm text-slate-700">
                Work Email Address
              </label>

              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="abc@deskverse.com"
                required
                className="h-9 w-full rounded-md border border-slate-400 bg-[#eeeeff] px-3 text-xs outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm text-slate-700">
                Password
              </label>

              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="****************"
                  required
                  className="h-9 w-full rounded-md border border-slate-400 bg-[#eeeeff] px-3 pr-10 text-xs outline-none focus:border-blue-500"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500"
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            {error && <p className="mt-3 text-xs text-red-500">{error}</p>}

            <button
              type="submit"
              className="mt-7 h-10 w-full rounded-md bg-blue-600 text-sm font-medium text-white hover:bg-blue-700"
            >
              Create Account
            </button>
          </form>

          <p className="mt-7 text-center text-xs text-slate-600">
            Already have an account?{" "}
            <Link to="/login" className="text-[#15155c]">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
