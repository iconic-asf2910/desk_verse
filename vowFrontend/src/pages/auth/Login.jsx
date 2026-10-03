import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import useAuth from "../../hooks/UseAuth";

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    try {
      await login(email, password);
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
          <p className="text-sm text-gray-700">Welcome back,</p>

          <h2 className="mt-1 text-3xl font-bold text-gray-900">
            Log In to Your Account
          </h2>

          <form onSubmit={handleSubmit} className="mt-8">
            <label className="block text-sm font-medium text-gray-800">
              Work Email address
            </label>

            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="alex@deskverse.com"
              required
              className="mt-2 w-full rounded-md border border-gray-300 px-4 py-3 text-sm outline-none focus:border-blue-500"
            />

            <label className="mt-5 block text-sm font-medium text-gray-800">
              Password
            </label>

            <div className="relative mt-2">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
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

            <div className="mt-2 text-right">
              <button
                type="button"
                className="text-sm text-blue-600 hover:underline"
              >
                Forgot password?
              </button>
            </div>

            {error && (
              <p className="mt-4 text-sm text-red-600">{error}</p>
            )}

            <button
              type="submit"
              className="mt-5 w-full rounded-md bg-blue-600 py-3 text-sm font-medium text-white hover:bg-blue-700"
            >
              Log In
            </button>
          </form>

          <p className="mt-5 text-center text-sm text-gray-600">
            Don't have an account?{" "}
            <Link
              to="/signup"
              className="font-medium text-blue-600 hover:underline"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;