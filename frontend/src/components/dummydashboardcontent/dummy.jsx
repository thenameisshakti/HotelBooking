import GeniusRewards from "./GeniusRewards";
import ProgressCard from "./ProgressCard";
import CreditsCard from "./CreditsCard";

const DashboardTopCards = () => {
  return (
    <div className="dashboardTopGrid">
      <GeniusRewards />
      <div className="sideCards">
        <ProgressCard />
        <CreditsCard />
      </div>
    </div>
  );
};

export default DashboardTopCards;
