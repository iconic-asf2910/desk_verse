import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import useAuth from "../../hooks/UseAuth";

const Login = () => {
  const navigate = useNavigate();
  const { login, token } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (token) {
      navigate("/dashboard", { replace: true });
    }
  }, [token, navigate]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    try {
      await login(email, password);
      navigate("/dashboard", { replace: true });
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

          <h1 className="text-5xl font-semibold tracking-tight">
            DeskVerse
          </h1>

          <p className="mt-3 text-base leading-6 text-white">
            Securely access your
            <br />
            virtual workspaces.
          </p>
        </div>

        <div className="w-[2000px] rounded-lg bg-white px-14 py-16 shadow-lg">
          <div className="mb-7">
            <p className="text-base text-slate-600">Welcome back,</p>

            <h2 className="mt-2 text-4xl font-bold text-black">
              Log In to Your Account
            </h2>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-5">
              <label className="mb-2 block text-base text-slate-700">
                Work Email Address
              </label>

              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="abc@deskverse.com"
                required
                className="h-11 w-full rounded-md border border-slate-400 bg-[#eeeeff] px-3 text-sm text-slate-700 outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-base text-slate-700">
                Password
              </label>

              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="****************"
                  required
                  className="h-11 w-full rounded-md border border-slate-400 bg-[#eeeeff] px-3 pr-11 text-sm text-slate-700 outline-none focus:border-blue-500"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              <div className="mt-2 text-right">
                <button
                  type="button"
                  className="text-xs text-[#15155c]"
                >
                  Forgot Password?
                </button>
              </div>
            </div>

            {error && (
              <p className="mt-4 text-sm text-red-500">
                {error}
              </p>
            )}

            <button
              type="submit"
              className="mt-12 h-10 w-full rounded-md bg-blue-600 text-sm font-medium text-white hover:bg-blue-700"
            >
              Log In
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-slate-600">
            Don't have an account?{" "}
            <Link to="/signup" className="text-[#15155c]">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;