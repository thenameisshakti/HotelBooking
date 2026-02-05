import './styling.css'


const GeniusRewards = () => {
  return (
    <div className="card largeCard">
      <h3>You have 3 Genius rewards</h3>
      <p>Enjoy rewards and discounts on select stays and rental cars worldwide.</p>

      <div className="rewardsRow">
        <div className="rewardItem">10% off stays</div>
        <div className="rewardItem">10% discounts on rental cars</div>
        <div className="rewardItem">Flight price alerts</div>
        <div className="rewardItem disabled">10–15% off stays</div>
        <div className="rewardItem disabled">Priority support</div>
      </div>

      <a href="#" className="link">
        Learn more about your rewards
      </a>
    </div>
  );
};

export default GeniusRewards;
