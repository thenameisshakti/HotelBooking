import { BrowserRouter , Route, Routes } from "react-router-dom";
import Home from "./pages/home/Home";
import List from "./pages/list/List";
import SingleHotel from "./pages/singleHotel/SingleHotel";
import Login from "./pages/login/Login";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home/>}/>
        <Route path="/hotels" element={<List/>}/>
        <Route path="/hotels/:id" element={<SingleHotel/>}/>
        <Route path= "/login" element={<Login />}/>
      </Routes>
    </BrowserRouter>
  )
}

export default App