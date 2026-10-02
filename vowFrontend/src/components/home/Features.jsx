const Features = () => {
  const features = [
    {
      title: "Virtual Workspaces",
      description: "Organize teams and work in dedicated virtual spaces.",
    },
    {
      title: "Meetings",
      description: "Join real-time audio and video meetings with your team.",
    },
    {
      title: "Team Chat",
      description: "Communicate with individuals and teams in real time.",
    },
    {
      title: "Task Management",
      description: "Create, assign, and track tasks across your workspace.",
    },
    {
      title: "Polls",
      description: "Create polls and collect decisions from your team.",
    },
    {
      title: "Analytics",
      description: "Track team activity, meetings, and engagement.",
    },
  ];

  return (
   <section id="features">
      <h2>Everything Your Team Needs</h2>

      <div>
        {features.map((feature) => (
          <div key={feature.title}>
            <h3>{feature.title}</h3>
            <p>{feature.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Features;