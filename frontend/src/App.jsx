import { BrowserRouter , Route, Routes } from "react-router-dom";
import Home from "./pages/home/Home";
import List from "./pages/list/List";
import SingleHotel from "./pages/singleHotel/SingleHotel";
import Login from "./pages/login/Login";
import Success from "./pages/Success/Success.jsx"
import Dashboard from "./pages/dashboard/Dashboard.jsx"
import { ToastContainer } from "react-toastify"
import Register from "./pages/register/register.jsx";

function App() {
  return (
    <>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home/>}/>
        <Route path="/hotels" element={<List/>}/>
        <Route path="/hotels/:id" element={<SingleHotel/>}/>
        <Route path='/register' element={<Register/>}/>
        <Route path= "/login" element={<Login />}/>
        <Route path="/paymentsuccess" element={<Success />}/>
        <Route path='/dashboard' element={<Dashboard/>}/>
      </Routes>
    </BrowserRouter>
     <ToastContainer position="top-right" autoClose={3000} />
    </>
  )
}

export default App