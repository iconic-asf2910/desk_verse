import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuth from "../../hooks/UseAuth";

const defaultProfile = {
  name: "",
  email: "",
  jobTitle: "",
  phone: "",
  workLocation: "Delhi, India",
  gender: "Prefer not to say",
};

const Profile = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [profile, setProfile] = useState(defaultProfile);
  const [savedProfile, setSavedProfile] = useState(defaultProfile);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const storedProfile = JSON.parse(
      localStorage.getItem("deskverseProfile")
    );

    const initialProfile = {
      ...defaultProfile,
      name: storedProfile?.name || user?.name || "",
      email: storedProfile?.email || user?.email || "",
      jobTitle: storedProfile?.jobTitle || "",
      phone: storedProfile?.phone || "",
      workLocation:
        storedProfile?.workLocation || "Delhi, India",
      gender:
        storedProfile?.gender || "Prefer not to say",
    };

    setProfile(initialProfile);
    setSavedProfile(initialProfile);
  }, [user]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setProfile((previousProfile) => ({
      ...previousProfile,
      [name]: value,
    }));
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setProfile(savedProfile);
    setIsEditing(false);
  };

  const handleSave = () => {
    localStorage.setItem(
      "deskverseProfile",
      JSON.stringify(profile)
    );

    setSavedProfile(profile);
    setIsEditing(false);
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const inputClass =
    "h-9 w-full rounded-md border border-slate-400 bg-gradient-to-r from-[#dcd8ef] via-[#f7f6fb] to-[#dcd8ef] px-3 py-0 text-sm leading-none text-slate-800 shadow-inner outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

  const displayClass =
    "flex h-9 w-full items-center rounded-md border border-slate-400 bg-gradient-to-r from-[#dcd8ef] via-[#f7f6fb] to-[#dcd8ef] px-3 text-sm leading-none text-slate-800 shadow-inner";

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#f8fafc] px-8 py-7">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-slate-900">
          My Profile
        </h1>

        {!isEditing && (
          <button
            type="button"
            onClick={handleEdit}
            className="rounded-md bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Edit Profile
          </button>
        )}
      </div>

      <div className="mt-2 flex flex-col items-center">
        <img
          src="/manprofile.png"
          alt="Profile"
          className="h-24 w-24 rounded-full object-cover ring-4 ring-blue-100"
        />

        <h2 className="mt-3 text-base font-medium text-slate-900">
          {profile.name || "User"}
        </h2>
      </div>

      <div className="mx-auto mt-5 max-w-5xl rounded-xl border border-slate-200 bg-white px-8 py-7 shadow-sm">
        <div className="grid grid-cols-1 gap-x-16 gap-y-5 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Full Name
            </label>

            <input
              type="text"
              name="name"
              value={profile.name}
              onChange={handleChange}
              disabled={!isEditing}
              placeholder="Full Name"
              className={inputClass}
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Job Title
            </label>

            <input
              type="text"
              name="jobTitle"
              value={profile.jobTitle}
              onChange={handleChange}
              disabled={!isEditing}
              placeholder="Job Title"
              className={inputClass}
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Email Address
            </label>

            <input
              type="email"
              name="email"
              value={profile.email}
              onChange={handleChange}
              disabled={!isEditing}
              placeholder="Email Address"
              className={inputClass}
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Phone Number
            </label>

            <input
              type="tel"
              name="phone"
              value={profile.phone}
              onChange={handleChange}
              disabled={!isEditing}
              placeholder="Phone Number"
              className={inputClass}
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Work Location
            </label>

            <input
              type="text"
              name="workLocation"
              value={profile.workLocation}
              onChange={handleChange}
              disabled={!isEditing}
              placeholder="e.g. Delhi, India or Remote"
              className={inputClass}
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Gender
            </label>

            {isEditing ? (
              <select
                name="gender"
                value={profile.gender}
                onChange={handleChange}
                className={inputClass}
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Non-binary">Non-binary</option>
                <option value="Prefer not to say">
                  Prefer not to say
                </option>
              </select>
            ) : (
              <div className={displayClass}>
                {profile.gender}
              </div>
            )}
          </div>
        </div>

        {isEditing && (
          <div className="mt-7 flex justify-end gap-3 border-t border-slate-100 pt-5">
            <button
              type="button"
              onClick={handleCancel}
              className="rounded-md border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleSave}
              className="rounded-md bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
            >
              Save Changes
            </button>
          </div>
        )}

        {!isEditing && (
          <div className="mt-7 border-t border-slate-100 pt-5">
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-md border border-red-200 bg-white px-5 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;