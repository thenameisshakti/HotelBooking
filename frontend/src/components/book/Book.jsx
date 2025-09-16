import { faCircleXmark } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { SearchContext } from '../context/SearchContext'
import useFetch from '../../hooks/useFetch'
import { useContext, useState } from 'react'
import { useNavigate } from 'react-router'
import "./book.css"
import axios from 'axios'

function Book({setOpen , hotelId}) {

    const [selectedRoom , setSelectedRoom] = useState([])
    const {data,loading,error} = useFetch(`/api/v1/hotels/room/${hotelId}`)
    const [price,setPrice] = useState([])
    const{date} = useContext(SearchContext)
    const navigate = useNavigate()
    console.log(data,"this is data")

    const getDatesInRange = (startDate,endDate ) => {
        const start = new Date(startDate)
        const end = new Date(endDate)
        const tarik = new Date(start.getTime())


        let list = []
        while (tarik <= end) {
            list.push(new Date(tarik).getTime())
            tarik.setDate(tarik.getDate() + 1) 
        }
        return list
    }

    const alldates = getDatesInRange(date[0].startDate,date[0].endDate)
    
    const isAvailable = (roomNumber) => {
        const isFound = roomNumber.unavailableDates.some(date => 
            alldates.includes(new Date(date).getTime())
        )
        return !isFound

    }


    const handleSelect =  (e) => {
        const checked = e.target.checked 
        const value = e.target.value 
        const updateroom =(checked ? [...selectedRoom, value] : selectedRoom.filter(item => item !== value))
        setSelectedRoom(updateroom)
        priceCalcultion(updateroom)
      
    }
    const priceCalcultion = async(updateroom) => {
        let total =0
        await Promise.all(updateroom.map(async (roomId) => {
            console.log(roomId)
            const res = await axios.get(`/api/v1/rooms/get/${roomId}`)
            total += res.data.data.price
            setPrice(total)
        }))
    }
    


    const handleClick =async () => {
         try{
            await Promise.all(selectedRoom.map(async (roomId)=> {
                console.log(roomId)
                const res = await axios.put(`/api/v1/rooms/availability/${roomId}`,{date: alldates})
               console.log(res.data)
               return res.data
            }))
         }catch(error){
                console.log(error)
        }
    }
 
      
   

   
    
  return (
    <div className="reserve "> 
        <div className="rContainer rounded-md">
            <div className=' m-4 h-80 overflow-y-auto'>
            <FontAwesomeIcon
            onClick={() => setOpen(false)}
            icon={faCircleXmark } className='rClose m-1'
            />
            <span>Select Your Rooms: </span>
            {data.map((item)=> (
                <div key={item._id}>
                    <div className="capitalize font-extrabold text-2xl m-3">{item.title}</div>
                    <div className=' flex justify-between'>
                    <div>
                        <div className='m-3'>Max People:<b>{item.maxPeople}</b></div>
                        <div className='m-3'>Pricing :<b>₹{item.price}</b></div>
                    </div>
                    <div className='grid grid-cols-3 gap-2'> 
                        {item.roomNumbers.map(rno => (
                                    <div key={rno._id}>
                                    <label><b>{rno.number}</b></label>
                                    <input
                                    type="checkbox" value={rno._id}
                                    onChange={handleSelect}
                                    disabled={!isAvailable(rno)}
                                    />
                                    </div>
                            ))}
                    </div>
                    </div>
                    
                     
                    
                </div>
            ))}
            </div>
            <div className='absoute'>
               <button 
               onClick={handleClick}
               className=' bg-[#0071c2] rounded-md w-full p-4 text-white font-extrabold'>₹{price}-Book Now</button>
           </div>
        </div>
    </div>
  )
}

export default Book