import './singlehotel.css'
import Navbar from "../../components/navbar/Navbar"
import Header from '../../components/header/Header'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import MailList from "../../components/mailList/MailList"
import Footer from "../../components/footer/Footer"
import { useContext, useState } from 'react'
import { faCircleArrowLeft, faLocation,faCircleXmark ,faCircleArrowRight} from '@fortawesome/free-solid-svg-icons'
import { useLocation, useNavigate } from 'react-router'
import useFetch from "../../hooks/useFetch"
import { SearchContext } from '../../components/context/SearchContext'
import { AuthContext } from '../../components/context/AuthContext'
import Book from '../../components/book/Book'

function SingleHotel() {
  const location = useLocation()
  const id  = location.pathname.split("/")[2] 
  
 
  const [slide,setSlide] = useState()
  const [open,setOpen] = useState(false)
  const [openmodal , setOpenModal] = useState(false)
 
  const {data,loading,error} = useFetch(`/api/v1/hotels/get/${id}`)
  console.log(data, "in single hotel")

  const {user} = useContext(AuthContext)
  console.log(user, "this is user")
  const navigate = useNavigate()
  
  const {date,option} = useContext(SearchContext)

  const MILLISECONDS_PER_DAY = 1000 * 60 * 60 * 24;

  function dayDifference(date1, date2) {
    if (!date1 || !date2) return 0;
    const timeDiff = Math.abs(date2.getTime() - date1.getTime());
    const diffDays = Math.ceil(timeDiff / MILLISECONDS_PER_DAY);
    return diffDays;
  }

  console.log(date ,option ,"the date and option ")

  const days = dayDifference(date[0]?.endDate, date[0]?.startDate);


  const photos = [
    "https://cf.bstatic.com/xdata/images/hotel/max1280x900/261707778.jpg?k=56ba0babbcbbfeb3d3e911728831dcbc390ed2cb16c51d88159f82bf751d04c6&o=&hp=1",
    "https://cf.bstatic.com/xdata/images/hotel/max1280x900/261707367.jpg?k=cbacfdeb8404af56a1a94812575d96f6b80f6740fd491d02c6fc3912a16d8757&o=&hp=1",
    "https://cf.bstatic.com/xdata/images/hotel/max1280x900/261708745.jpg?k=1aae4678d645c63e0d90cdae8127b15f1e3232d4739bdf387a6578dc3b14bdfd&o=&hp=1",
    "https://cf.bstatic.com/xdata/images/hotel/max1280x900/261707776.jpg?k=054bb3e27c9e58d3bb1110349eb5e6e24dacd53fbb0316b9e2519b2bf3c520ae&o=&hp=1",
    "https://cf.bstatic.com/xdata/images/hotel/max1280x900/261708693.jpg?k=ea210b4fa329fe302eab55dd9818c0571afba2abd2225ca3a36457f9afa74e94&o=&hp=1",
    "https://cf.bstatic.com/xdata/images/hotel/max1280x900/261707389.jpg?k=52156673f9eb6d5d99d3eed9386491a0465ce6f3b995f005ac71abc192dd5827&o=&hp=1",
]
  // const photos = []
  // data.photos?.map((photo) => photos.push(photo))

  const handlerOpen =(i) => {
    setSlide(0)
    setOpen(true)
  }
  const handleMove = (direction) => {
    let newSlideNumber;

    if (direction === "l") {
      newSlideNumber = slide === 0 ? 5 : slide - 1;
    } else {
      newSlideNumber = slide === 5 ? 0 : slide + 1;
    }

    setSlide(newSlideNumber)
  };

  const handleClick = (e) => {
      if (user) {
        setOpenModal(true)
      }else {
          navigate("/login",{state: {lastpage: location.pathname}})
      }

  }


  return (
    <div>
      <Navbar />
      <Header type = "list" />
      
      { 
      loading ? "loading" : 
      <div className="hotelContainer">
     {open && (
          <div className="slider">
            <FontAwesomeIcon
              icon={faCircleXmark}
              className="close"
              onClick={() => setOpen(false)}
            />
            <FontAwesomeIcon
              icon={faCircleArrowLeft}
              className="arrow"
              onClick={() => handleMove("l")}
            />
            <div className="sliderWrapper">
              <img src={photos[slide]} alt="" className="sliderImg" />
            </div>
            <FontAwesomeIcon
              icon={faCircleArrowRight}
              className="arrow"
              onClick={() => handleMove("r")}
            />
          </div>
        )}
        <div className="hotelWrapper">
          <button className='bookNow'>Reserve or Book Now!</button>
          <h1 className=" font-extrabold text-4xl">{`${data.name}`}</h1>
          <div className="hotelAddress">
            <FontAwesomeIcon icon={faLocation} />
            <span>{`${data.address}`} </span>
          </div>
          <span className="hotelDistance">
            {`${data.nearby ? `${datanearby}` : "-----"}` }
          </span>
          <span className="hotelPriceHighlight">
            Book a stay over ₹{`${data.cheapestPrice}`} at this property and get a free airport taxi
          </span>
          <div className=" flex flex-wrap justify-between gap-1 ">
             {photos.map((photo,i) => (
              <div className="hotelImgWrapper" key={i} >
                <img 
                onClick={() => handlerOpen(i)}
                src={photo} alt="" className="hotelImg" />
              </div>
             ))}
          </div>
          <div className='hotelDetails '>
            <div className="hotelDetailsTexts">
              <h1 className="font-extrabold text-3xl">Stay in the heart of City</h1>
              <p className="hotelDesc text-2l">
                {`${data.discription}`}
              </p>
            </div>
            <div className="hotelDetailsPrice">
              <h1 className='font-bold'>Perfect for a {days} stay!</h1>
              <span>
                Located in the real heart of Krakow, this property has an
                excellent location score of 9.8!
              </span>
              {/* <h2 >
                <b className='font-bold'>{option.room} Rooms</b> 
              </h2> */}
              <button 
              onClick={handleClick}>Select Room</button>
            </div>
          </div>
        </div>
        <MailList />
        <Footer />
      </div>
      }
      
      {openmodal && <Book setOpen={setOpenModal} hotelId={id} />}

     </div>
  )
}

export default SingleHotel