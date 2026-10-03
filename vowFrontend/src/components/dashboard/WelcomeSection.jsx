import useAuth from "../../hooks/UseAuth";

const WelcomeSection = () => {
  const { user } = useAuth();

  return (
    <section>
      <h1>Welcome{user?.name ? `, ${user.name}` : ""}</h1>
      <p>Your workspace at a glance.</p>
    </section>
  );
};

export default WelcomeSection;