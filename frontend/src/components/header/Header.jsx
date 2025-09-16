
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBed, faCalendarDays, faCar, faPerson, faPlane, faTaxi } from '@fortawesome/free-solid-svg-icons' 
import "./Header.css"
import { DateRange  } from 'react-date-range'
import {  useContext, useState } from 'react'
import 'react-date-range/dist/styles.css'; // main css file
import 'react-date-range/dist/theme/default.css'; // theme css file
import { format } from 'date-fns'
import {useNavigate} from "react-router"
import { SearchContext } from '../context/SearchContext'
import { AuthContext } from '../context/AuthContext'

function Header({type}) {

    const {user} = useContext(AuthContext)
    

    const [destination , setDestination] = useState()
    const [opendate , setOpendate] = useState(false)
    const [date, setDate] = useState([
        {
            startDate: new Date(),
            endDate: new Date(),
            key: "selection"
        }
    ])
    const [openOption , setOpenOption] = useState(false)
    const [option, setOption ] = useState({
        adult : 1,
        children: 0,
        room: 1
    })

    const handleOption = (name , operation) => {
        setOption(prev => {
            return{ ...prev , [name]: operation === "i" ? option[name] + 1 : option[name] -1 }
        })

    }
    const navigate = useNavigate()

    const { dispatch } = useContext(SearchContext)

    const handleSearch = () => {
        dispatch({type: "NEW_SEARCH", payload: {destination, date, option}})
        navigate('/hotels',{state:{destination,date,option}}) // this is help in when we use location 

    }

  return (
    <div className="header">
        <div className={type === "list" ? "headerContainer.listMode" : "headerContaier"}>
            <div className="headerList">
                <div className="headerListItem active">
                    <FontAwesomeIcon icon={faBed}/>
                    <span>Stays</span>
                </div>
                <div className="headerListItem">
                    <FontAwesomeIcon icon={faPlane}/>
                    <span>Flight</span>
                </div>
                <div className="headerListItem">
                    <FontAwesomeIcon icon={faCar}/>
                    <span>Car Rental</span>
                </div>
                <div className="headerListItem">
                    <FontAwesomeIcon icon={faBed}/>
                    <span>Attractions</span>
                </div><div className="headerListItem">
                    <FontAwesomeIcon icon={faTaxi}/>
                    <span>Airport taxis</span>
                </div>
            </div>
            {type !== "list" && 
            <>
            <h1 className='font-bold text-4xl'>Just Search and Book</h1>
            <p className="headerDesc text-2xl">Search low prices on hotels, homes and much more...</p>
            {!user && <button className="headerBtn mb-11 rounded-md">SignIn/Register</button>}
            <div className="headerSearch">
                 <div className="headerSearchItem">
                     <FontAwesomeIcon icon={faBed} className='headerIcon'/>
                     <input 
                     type="text" 
                     placeholder='where are you going' 
                     className='headerSearchInput'
                     onChange={(e) => setDestination(e.target.value)}
                      />
                 </div>
                 <div className="headerSearchItem">
                    <FontAwesomeIcon icon={faCalendarDays } className='headerIcon'/>
                    
                    <span
                    onClick={() => {
                        setOpendate(!opendate)
                        setOpenOption(false)
                    } }
                     className='headerSearchText'>
                        {`${format(date[0].startDate,"dd/MM/yyyy") }  to  ${format(date[0].endDate,"dd/MM/yyyy") }`}
                    </span>
                    {opendate && <DateRange 
                    editableDateInputs= {true}
                    onChange={item => setDate([item.selection])}
                    moveRangeOnFirstSelection= {false}
                    ranges={date}
                    className='date'
                    minDate={new Date()}
                    />}
                    
                 </div>
                 <div className="headerSearchItem">
                     <FontAwesomeIcon icon={faPerson } className='headerIcon'/>
                     <span 
                     onClick={() => {
                        setOpenOption(!openOption)
                        setOpendate(false)
                    }}
                     className='headerSearchText'>{`${option.adult} adult : ${option.children} Children : ${option.room} room`}
                     </span>
                     {openOption && <div className='options'>
                        <div className="optionItem">
                            <div className="optionText">Adult</div>
                            <div className="optionCounter">
                                <button disabled={option.adult<1} className="optionCounterButton" onClick={() => handleOption ("adult", "d")} >-</button>
                                <span className="optionCounterNumber">{`${option.adult}`} </span>
                                <button className="optionCounterButton"onClick={() => handleOption ("adult", "i")} >+</button>
                            </div>
                        </div>
                        <div className="optionItem">
                            <div className="optionText">Children</div>
                            <div className="optionCounter">
                                <button disabled={option.children<1} className="optionCounterButton" onClick={() => handleOption ("Children", "d")} >-</button>
                                <span className="optionCounterNumber">{`${option.children}`} </span>
                                <button className="optionCounterButton" onClick={() => handleOption ("Children", "i")} >+</button>
                            </div>
                        </div>
                        <div className="optionItem">
                            <div className="optionText">Room</div>
                            <div className="optionCounter">
                                <button disabled={option.room <1} className="optionCounterButton" onClick={() => handleOption ("room", "d")} >-</button>
                                <span className="optionCounterNumber">{`${option.room}`} </span>
                                <button className="optionCounterButton" onClick={() => handleOption ("room", "i")} >+</button>
                            </div>
                        </div>
                     </div>}
                 </div>
                <button className="headerSearchBtn rounded-md p-2.5 w-35 ml-3"
                onClick={handleSearch}>Search</button>
            </div> 
            </>}
        </div>
        
    </div>
  )
}

export default Header