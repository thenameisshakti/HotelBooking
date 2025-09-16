
import Navbar from '../../components/navbar/Navbar'
import Header from '../../components/header/Header'
import './list.css'
import { useLocation } from 'react-router'
import { useContext, useState } from 'react'
import { format } from 'date-fns'
import { DateRange } from 'react-date-range'
import SearchItems from '../../components/searchItems/SearchItems'
import useFetch from '../../hooks/useFetch'
import { SearchContext } from '../../components/context/SearchContext'
import MailList from '../../components/mailList/MailList'
import Footer from '../../components/footer/Footer'

function List() {

  const location = useLocation()

  const[openDate, setOpenDate] = useState(false)
  
  const [destination,setDestination]= useState(location.state.destination)
  const[date, setDate] = useState(location.state.date)
  const [option,setOption] = useState(location.state.option)
 
  const [min, setMin] = useState()
  const [max,setMax] = useState()

  
  const {data,loading,error,reFetch} = useFetch(`/api/v1/hotels/all?city=${destination}&min=${min ?? ''}&max=${max ?? ''}`)
  console.log(data,"this is what you looking for")
 
  const {dispatch} = useContext(SearchContext)
  
  const handleSearch = () => {
    dispatch({
      type: "NEW_SEARCH",
      payload: {destination, date , option}
    })
      reFetch()
  }
  
  return (
    
    <div>
      <Navbar />
      <Header type= "list" />
        <div className="listContainer">
          <div className="listWrapper">
            <div className="listSearch">
              <h1 className="listTitle">
                Search
              </h1>
               <div className="lsItem">
                <label htmlFor="label"> Destination</label>
                <input 
                onChange={(e) => setDestination(e.target.value)}
                type="text" className=' bg-white px-2 py-2 rounded-md  cursor-pointer focus:outline-none' placeholder={destination} />
               </div>

               <div className="lsItem">
                <label htmlFor="check-in Date">Check-in Date</label>
                
                <span className='rounded-md bg-white p-2 text-gray-600' 
                onClick={() => setOpenDate(!openDate)}
                >{`${format(date[0].startDate,"dd/MM/yyyy")} to ${format(date[0].endDate,"dd/MM/yyyy")}`} </span>
                {openDate && 
                <DateRange
                onChange={item=> setDate([item.selection])}
                minDate={new Date()} 
                ranges={date}
                />}
               </div>
               <div className="lsItem ">
                <label> Options</label>
                <div className="lsOptionItem ">
                  <span className="lsOptionText ">
                    Min prices<small> per night</small>
                    
                  </span>
                  <input 
                  type="text" 
                  className='flex bg-white p-1.5 w-13 rounded-md focus:outline-none'
                  placeholder='999'
                  onChange={e=> setMin(e.target.value)}
                  />
                  
                </div>
                <div className="lsOptionItem">
                  <span className="lsOptionText">
                    Max price <small>per night</small>
                  </span>
                  <input
                  type="text"
                  className='flex bg-white p-1.5 w-13 rounded-md focus:outline-none' 
                  placeholder='999'
                  onChange={e => setMax(e.target.value)}
                  />
                </div>
                <div className="lsOptionItem">
                  <span className="lsOptionText">Adult</span>
                  <input
                    type="number"
                    min={1}
                    className="lsOptionInput"
                    onChange={e => setOption(perv => ({...perv , adult: e.target.value}))}
                    placeholder={option.adult}
                  />
                </div>
                <div className="lsOptionItem">
                  <span className="lsOptionText">Children</span>
                  <input
                    type="number"
                    min={0}
                    className="lsOptionInput"
                    onChange={e => setOption(perv => ({...perv , children: e.target.value}))}
                    placeholder={option.children}
                  />
                </div>
                <div className="lsOptionItem">
                  <span className="lsOptionText">Room</span>
                  <input
                    type="number"
                    min={1}
                    className="lsOptionInput"
                    onChange={e => setOption(perv => ({...perv , room: e.target.value}))}
                    placeholder={option.room}
                  />
                </div>
                

              </div>
              <button 
              className='w-full p-2 rounded-md cursor-pointer font-medium text-white bg-[#0071c2] active:bg-blue-800'
              onClick={handleSearch}
              >Search</button> 

            </div>
            <div className="listResult">
                { loading ? "loading" : ( 
                <>
                 {data.map((hotel) => (
                        <SearchItems hotel={hotel} key={hotel._id} />
                      ))
                  }
                </>
                  )}

                   
            </div>
          </div>
        </div>
        <MailList/>
        <Footer/>
    </div>
  )
}

export default List