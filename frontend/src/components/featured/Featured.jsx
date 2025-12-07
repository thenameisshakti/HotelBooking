import { useNavigate } from "react-router"
import useFetch from "../../hooks/useFetch"
import "./featured.css"

function Featured() {
      const {data,loading,error} = useFetch("/api/v1/hotels/all?limit=4") //make city user current loaction
      console.log(data,"this is data for all hotels")
      const navigate = useNavigate()

      const MoveTo = (id) => {
           navigate(`/hotels/${id}`, {state: {}})
      }
  return (
     <div className="fp">

       {  loading ? "Loading" : <>
       {data?.hotels?.map((item) => (
              <div 
              onClick={() => MoveTo(item._id)}
              className="fpItem cursor-pointer" key={item._id}>
                <img
                  src={item.photos[1]}
                  alt=""
                  className="fpImg rounded-xl"
                />
                <span className="fpName text-2xl">{item.name}</span>
                <span className="fpCity">{item.city}</span>
                <span className="fpPrice">₹{item.cheapestPrice} </span>
                <div className="fpRating">
                  <button>8.9</button>
                  <span>Excellent</span>
                </div>
              </div>
        ))}
        </>
        }
      
     </div>
  )
}

export default Featured