import './styling.css'


const ProgressCard = () => {
  return (
    <div className="card smallCard">
      <h4>You're 5 bookings away</h4>
      <p>from Genius Level 2</p>

      <a href="#" className="link">
        Check your progress
      </a>
    </div>
  );
};

export default ProgressCard;
