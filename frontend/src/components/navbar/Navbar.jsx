import React from 'react'
import { Link, useLocation, useNavigate } from 'react-router'
import { AuthContext } from '../context/AuthContext'
import { useContext } from 'react'

function Navbar() {
  const {user} = useContext(AuthContext)
  const location = useLocation()
  const navigate = useNavigate()
  const handleLogin= () => {
      navigate("/login",{state: {lastpage: location.pathname}})
  }

  return (
   <div className='bg-[#003580] flex justify-center content-center '>
    <div className='p-5 w-full max-w-[1024px] text-white flex items-center justify-between'>
      <Link to='/' >
      <span className='font-extrabold text-2xl'>
        SARAI.COM
      </span>
      </Link>
      { !user && <div>
          <button className='ml-5 border-1 p-2.5 m-3 bg-blue-100 cursor-pointer text-[#003580] rounded-xl'>
            Register
          </button>
          <button 
          onClick={handleLogin}
          className='ml-5 border-1 p-2.5 m-3 bg-blue-100  cursor-pointer text-[#003580] rounded-xl'>
            Login
          </button>
          
        </div>}
    </div>
    
   </div>
  )
}

export default Navbar