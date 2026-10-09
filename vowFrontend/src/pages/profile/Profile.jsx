import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuth from "../../hooks/UseAuth";
import usePresence from "../../hooks/UsePresence";

const Profile = () => {
  const { user, updateProfile, logout } =
    useAuth();

  const { status, setStatus } =
    usePresence();

  const navigate = useNavigate();

  const [editing, setEditing] =
    useState(false);

  const [name, setName] = useState(
    user?.name || ""
  );

  const [phone, setPhone] = useState(
    user?.phone || ""
  );

  const [gender, setGender] = useState(
    user?.gender || ""
  );

  const saveProfile = () => {
    updateProfile({
      name: name.trim(),
      phone: phone.trim(),
      gender,
    });

    setEditing(false);
  };

  const handleLogout = () => {
    setStatus("offline").catch(() => {});

    logout();

    navigate("/login");
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#f5f6f8] p-5">
      <div className="mx-auto max-w-3xl">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-5">
            <img
              src="/manprofile.png"
              alt="Profile"
              className="h-20 w-20 rounded-full object-cover"
            />

            <div>
              <h1 className="text-xl font-semibold text-slate-900">
                {user?.name || "Enter name"}
              </h1>

              <p className="text-sm text-slate-500">
                {user?.email || ""}
              </p>

              <div className="mt-2 flex items-center gap-2">
                <span
                  className={`h-2.5 w-2.5 rounded-full ${
                    status === "online"
                      ? "bg-emerald-500"
                      : status === "away"
                        ? "bg-yellow-500"
                        : "bg-slate-400"
                  }`}
                />

                <span className="text-xs text-slate-500">
                  {status}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-8 space-y-5">
            <div>
              <label className="text-xs font-medium text-slate-500">
                Name
              </label>

              {editing ? (
                <input
                  value={name}
                  onChange={(event) =>
                    setName(event.target.value)
                  }
                  placeholder="Enter name"
                  className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                />
              ) : (
                <p className="mt-2 text-sm text-slate-800">
                  {user?.name || "Enter name"}
                </p>
              )}
            </div>

            <div>
              <label className="text-xs font-medium text-slate-500">
                Email
              </label>

              <p className="mt-2 text-sm text-slate-800">
                {user?.email || ""}
              </p>
            </div>

            <div>
              <label className="text-xs font-medium text-slate-500">
                Phone Number
              </label>

              {editing ? (
                <input
                  type="tel"
                  value={phone}
                  onChange={(event) =>
                    setPhone(event.target.value)
                  }
                  placeholder="Enter phone number"
                  className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                />
              ) : (
                <p className="mt-2 text-sm text-slate-800">
                  {user?.phone || "Enter phone number"}
                </p>
              )}
            </div>

            <div>
              <label className="text-xs font-medium text-slate-500">
                Gender
              </label>

              {editing ? (
                <select
                  value={gender}
                  onChange={(event) =>
                    setGender(event.target.value)
                  }
                  className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                >
                  <option value="">
                    Select gender
                  </option>
                  <option value="Male">
                    Male
                  </option>
                  <option value="Female">
                    Female
                  </option>
                  <option value="Other">
                    Other
                  </option>
                  <option value="Prefer not to say">
                    Prefer not to say
                  </option>
                </select>
              ) : (
                <p className="mt-2 text-sm text-slate-800">
                  {user?.gender || "Select gender"}
                </p>
              )}
            </div>

            <div>
              <label className="text-xs font-medium text-slate-500">
                Role
              </label>

              <p className="mt-2 text-sm text-slate-800">
                {user?.role || "Team Member"}
              </p>
            </div>
          </div>

          <div className="mt-8 flex gap-3">
            {editing ? (
              <>
                <button
                  type="button"
                  onClick={saveProfile}
                  className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
                >
                  Save
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setName(user?.name || "");
                    setPhone(user?.phone || "");
                    setGender(user?.gender || "");
                    setEditing(false);
                  }}
                  className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-medium text-slate-700"
                >
                  Cancel
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() =>
                  setEditing(true)
                }
                className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
              >
                Edit Profile
              </button>
            )}

            <button
              type="button"
              onClick={handleLogout}
              className="rounded-lg border border-red-200 px-5 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;