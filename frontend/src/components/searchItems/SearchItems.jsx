import { useLocation, useNavigate } from 'react-router'
import './searchitems.css'

function SearchItems({hotel}) {

  
  console.log(hotel,"this is selective")
  const navigate = useNavigate()
  const handleAvailability =() => {
    navigate(`/hotels/${hotel._id}`, {state: {}})
  }
  
  return (
    <div className="searchItem">
        <img 
        src={hotel.photos[0]}
        alt=""
        className="siImg"
        />
        <div className="siDesc">
            <h1 className="siTitle font-extrabold capitalize">{`${hotel.name}`}</h1>
            <span className="siDistance">{`${hotel.address}`}</span>
            <span className="siTaxiOp">Free airport taxi</span>
            <span className="siSubtitle">
              Studio Apartment with Air conditioning
            </span>
            <span className="siFeatures">
              {`${hotel.discription}`}
            </span>
            <span className="siCancelOp">Free cancellation </span>
            <span className="siCancelOpSubtitle">
              You can cancel later, so lock in this great price today!
            </span>
        </div>
      <div className="siDetails ">
        <div className="siRating ">
          <span className='siRatingspan'>Excellent</span>
          <button className='siRatingbutton rounded-md'>8.9</button>
        </div>
        <div className="siDetailTexts">
          <span className="siPrice">₹{`${hotel.cheapestPrice}`}</span>
          <span className="siTaxOp">Includes taxes<sup>*</sup></span>
          <button
          className="siCheckButton"
          onClick={handleAvailability}
          >See availability</button>
        </div>
      </div>
    </div>


  )
}

export default SearchItems