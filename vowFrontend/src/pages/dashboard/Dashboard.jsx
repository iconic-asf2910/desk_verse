import WelcomeSection from "../../components/dashboard/WelcomeSection";
import WorkspaceOverview from "../../components/dashboard/WorkspaceOverview";
import UpcomingMeetings from "../../components/dashboard/UpcomingMeetings";
import TaskOverview from "../../components/dashboard/TaskOverview";
import ActivityOverview from "../../components/dashboard/ActivityOverview";

const Dashboard = () => {
  return (
    <div>
      <WelcomeSection />
      <WorkspaceOverview />
      <UpcomingMeetings />
      <TaskOverview />
      <ActivityOverview />
    </div>
  );
};

export default Dashboard;