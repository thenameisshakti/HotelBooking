import './styling.css'

const CreditsCard = () => {
  return (
    <div className="card smallCard">
      <h4>No Credits or vouchers yet</h4>
      <p className="creditsCount">0</p>

      <a href="#" className="link">
        More details
      </a>
    </div>
  );
};

export default CreditsCard;
