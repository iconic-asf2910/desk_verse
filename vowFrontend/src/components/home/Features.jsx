const Features = () => {
  const features = [
    {
      title: "Virtual Office & Spaces",
      description:
        "Custom digital offices with interactive layouts and presence indicators.",
      image: "/tab.png",
    },
    {
      title: "Real-Time Collaboration",
      description:
        "Video conferencing with spatial audio to simulate proximity-based conversations.",
      image: "/man.png",
    },
    {
      title: "Smart Meeting Hub",
      description:
        "Schedule directly, smart reminders, and AI meeting summaries.",
      image: "/video.png",
    },
    {
      title: "Project Tracker",
      description: "Integrated task management with role-based assignments.",
      image: "/projector.png",
    },
  ];

  return (
    <section className="bg-white px-14 pb-8">
      <h2 className="mb-6 text-xl font-normal text-black">
        The DeskVerse Experience
      </h2>

      <div className="grid grid-cols-4 gap-12">
        {features.map((feature) => (
          <div
            key={feature.title}
            className="h-36 rounded-lg border border-slate-500 bg-gray-200 px-4 py-3"
          >
            <div className="flex h-12 justify-center">
              <img
                src={feature.image}
                alt={feature.title}
                className="h-12 w-12 object-contain"
              />
            </div>

            <h3 className="mt-2 text-sm font-medium text-black">
              {feature.title}
            </h3>

            <p className="mt-1 text-xs font-medium leading-3 text-slate-600">
              {feature.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Features;
