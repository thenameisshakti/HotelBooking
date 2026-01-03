import React, { useContext } from 'react'
import { Link, useLocation, useNavigate } from 'react-router'
import { AuthContext } from '../context/AuthContext'
import axios from 'axios'

function Navbar() {
  const { user, dispatch } = useContext(AuthContext)
  console.log(user)
  const location = useLocation()
  const navigate = useNavigate()

  const handleLogin = () => {
    navigate("/login", { state: { lastpage: location.pathname } })
  }

  const handleLogout = async () => {
    try {
      const res = await axios.post(
        "/api/v1/users/logout",
        {},
        { withCredentials: true }
      )
      console.log(res)
      if (res.status === 200) {
        dispatch({ type: "LOGOUT" })
        navigate("/")
      }
    } catch (err) {
      console.error("Logout error:", err.response?.data || err.message)
    }
  }

  return (
    <div className="bg-[#003580] flex justify-center shadow-md">
      <div className="p-5 w-full max-w-[1280px] text-white flex items-center justify-between">
        
        {/* Logo */}
        <Link to="/">
          <span className="font-extrabold text-2xl tracking-wide hover:text-blue-300 transition-colors duration-200">
            SARAI.COM
          </span>
        </Link>

        {/* Auth Buttons */}
        {!user ? (
          <div className="flex space-x-4">
            {/* Register Button */}
            <button
              className="
                px-5 py-2 rounded-md font-medium
                bg-blue-600 text-white
                shadow-sm
                hover:bg-blue-700
                focus:outline-none focus:ring-2 focus:ring-blue-300
                active:scale-[0.98]
                transition-all duration-200 ease-in-out
              "
            >
              Register
            </button>

            {/* Login Button */}
            <button
              onClick={handleLogin}
              className="
                px-5 py-2 rounded-md font-medium
                bg-blue-600 text-white
                shadow-sm
                hover:bg-blue-700
                focus:outline-none focus:ring-2 focus:ring-blue-300
                active:scale-[0.98]
                transition-all duration-200 ease-in-out
              "
            >
              Login
            </button>
          </div>
        ) : (
          <div>
            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="
                px-6 py-2 rounded-md font-semibold
                bg-blue-600 text-white
                shadow-sm
                hover:bg-blue-700
                focus:outline-none focus:ring-2 focus:ring-blue-300
                active:scale-[0.98]
                transition-all duration-200 ease-in-out
              "
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default Navbar
