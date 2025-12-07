import { useContext, useState } from "react"
import "./login.css"
import { AuthContext } from "../../components/context/AuthContext"
import axios, { AxiosError } from "axios"
import { useLocation, useNavigate } from "react-router"

function Login() {

  const location = useLocation() 
  console.log(location)
  const backto = location.state.lastpage

  const [Credential,setCredential] = useState(
    {
      username: undefined,
      password: undefined
    }
  )
  const navigate = useNavigate()

  const {loading,error,dispatch} = useContext(AuthContext)

  const handleChange =(e) => {
    setCredential(perv => ({...perv , [e.target.id] : e.target.value}))

  }
 
  const handleClick = async (e) => {
    e.preventDefault() 
    dispatch({type: "LOGIN_START"})
    try{
      const res =  await axios.post('/api/v1/users/login', Credential,{withCredentials: true})
     
      console.log(res)
      console.log(res.data.data.loggedInUser)
      dispatch ({type : "LOGIN_SUCCESS" , payload: res.data.data})
      navigate(`${backto}`)
      

    }catch(error) {
      dispatch({type: "LOGIN_FAIL", payload: error.response.data.message})
    }
  }


  


  return (
    <div className="h-screen grid place-content-center">
      <div className="border-1">

        <div className=" grid grid-cols-1">
        <input 
        onChange={handleChange}
        className=" border-2 p-2 m-2 focus:outline-none"
        type="text" placeholder="enter your @username" id="username"/>
        <input
        onChange={handleChange}
        className=" border-2 p-2 m-2 focus:outline-none"
        type="password" placeholder="your password" id="password"/>
        </div>
        <button
        onClick={handleClick}
        className="lButton" > Log in </button>
       
      </div>
       {error && <span>{error}</span>}
       
        
    </div>
  )
}

export default Login