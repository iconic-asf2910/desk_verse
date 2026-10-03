import activities from "../../data/activities";

const ActivityOverview = () => {
  return (
    <section>
      <h2>Recent Activity</h2>

      {activities.map((activity) => (
        <div key={activity.id}>
          <p>{activity.message}</p>
          <span>{activity.time}</span>
        </div>
      ))}
    </section>
  );
};

export default ActivityOverview;