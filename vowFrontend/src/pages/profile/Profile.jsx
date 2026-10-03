import useAuth from "../../hooks/UseAuth";

const Profile = () => {
  const { user } = useAuth();

  return (
    <div>
      <h1>Profile</h1>

      <p>Name: {user?.name}</p>
      <p>Email: {user?.email}</p>
      <p>Role: {user?.role}</p>
    </div>
  );
};

export default Profile;