const HowItWorks = () => {
  const steps = [
    {
      number: "01",
      title: "Create Your Account",
      description: "Sign up and create your workspace.",
    },
    {
      number: "02",
      title: "Join Your Workspace",
      description:
        "Enter your virtual workspace and connect with your team.",
    },
    {
      number: "03",
      title: "Collaborate",
      description:
        "Meet, communicate, and manage your work together.",
    },
  ];

  return (
    <section
      id="how-it-works"
      className="bg-white px-14 py-16"
    >
      <h2 className="mb-8 text-2xl font-normal text-black">
        How It Works
      </h2>

      <div className="grid grid-cols-3 gap-10">
        {steps.map((step) => (
          <div key={step.number}>
            <span className="text-sm text-gray-400">
              {step.number}
            </span>

            <h3 className="mt-3 text-lg font-medium text-black">
              {step.title}
            </h3>

            <p className="mt-2 text-sm font-medium text-gray-500">
              {step.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default HowItWorks;