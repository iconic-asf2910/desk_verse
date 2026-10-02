const HowItWorks = () => {
  const steps = [
    {
      step: "01",
      title: "Create Your Account",
      description: "Sign up and create your VOW account.",
    },
    {
      step: "02",
      title: "Join Your Workspace",
      description: "Access the workspace and rooms assigned to you.",
    },
    {
      step: "03",
      title: "Collaborate",
      description: "Chat, meet, manage tasks, and interact with your team.",
    },
  ];

  return (
    <section>
      <h2>How VOW Works</h2>

      <div>
        {steps.map((item) => (
          <div key={item.step}>
            <span>{item.step}</span>
            <h3>{item.title}</h3>
            <p>{item.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default HowItWorks;