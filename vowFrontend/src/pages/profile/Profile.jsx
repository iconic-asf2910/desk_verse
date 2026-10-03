import useAuth from "../../hooks/UseAuth";

const Profile = () => {
  const { user } = useAuth();

  return (
    <div>
      <h1>Profile</h1>

      <section>
        <h2>{user?.name || "User"}</h2>
        <p>{user?.email || "No email available"}</p>
        <p>{user?.role || "No role available"}</p>

        <button type="button">Edit Profile</button>
      </section>
    </div>
  );
};

export default Profile;