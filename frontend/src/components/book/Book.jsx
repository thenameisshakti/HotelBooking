import { faCircleXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { SearchContext } from "../context/SearchContext";
import useFetch from "../../hooks/useFetch";
import { useContext, useState,useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./book.css";
import api from '../../api/apihandler.js'

function Book({ setOpen, hotelId , days}) {
  const [selectedRoom, setSelectedRoom] = useState([]);
  const [goToPay , setGoToPay] = useState(false)
  const [locks, setLocks] = useState({}); 
  const { data, loading, error } = useFetch(`/api/v1/hotels/room/${hotelId}`);
  const [price, setPrice] = useState(0);
  const { date } = useContext(SearchContext);
  const navigate = useNavigate();
  const totalFair = price*days

  const getDatesInRange = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);

     const safeEnd = end.getTime() <= start.getTime()
      ? new Date(start.getTime() + 24 * 60 * 60 * 1000) // start + 1 day
      : end;
    const tarik = new Date(start.getTime());

    let list = [];
    while (tarik <= safeEnd) {
      list.push(new Date(tarik).getTime());
      tarik.setDate(tarik.getDate() + 1);
    }
    return list;
  };

  const alldates = getDatesInRange(date[0].startDate, date[0].endDate );

  const isAvailable = (roomNumber) => {
    const isFound = roomNumber.unavailableDates.some((date) =>
      alldates.includes(new Date(date).getTime())
    );
    return !isFound;
  };

  const handleSelect = async(e, price,roomId) => {
    console.log(roomId)
    const checked = e.target.checked;
    const roomNumberId = e.target.value;
   try {

    if (checked) {
       const {data} = await api.post(`/api/v1/booking/createLock`,{
         roomId,
         roomNumberId,
         startDate: date[0].startDate,
         endDate: date[0].endDate,
         hotelId
       })
       const lockId = data.data.lockId
       setLocks((prev) => ({ ...prev, [roomNumberId]: lockId, }));
       setSelectedRoom((prev) => prev.includes(roomNumberId) ? prev : [...prev, roomNumberId] );
       setPrice((prev) => prev + price);
       setGoToPay(true);
    }else {
      const lockId = locks[roomNumberId];
      if(lockId){
        await api.delete(`/api/v1/booking/deleteLock/${lockId}`)
      }
      setLocks((perv) => {
        const next = {...perv}
        delete next[roomNumberId]
        return next
      })
      setSelectedRoom((perv) => perv.filter((id) => id != roomNumberId))
      setPrice((perv) => perv - price)
      setGoToPay((prev) => prev && selectedRoom.length > 1);
    }
   } catch (error) {
      e.target.checked = !checked;
      if (error?.response?.status === 409)
        { alert("Room is temporarily locked");
        } else { alert("Something went wrong. Please try again."); }
   }
  };

  const handleCross = async() => {
    try {
      if(Object.keys(locks).length > 0) {
          await Promise.all(Object.values(locks).map((lockId) => 
          api.delete(`/api/v1/booking/deleteLock/${lockId}`)))
      }
    } catch (error) {
      console.log("error releasing locks",error)
    }finally{
      setOpen(false)
    }
  }

  const checkoutHandler = async (amount) => {
    const unique = await api.get("/api/v1/getkey");

    const res = await api.post("/api/v1/pay/payment", { amount });

    const options = {
      key: unique.data.key,
      amount: res.data.data.amount,
      currency: "INR",
      name: "@thenameisshakti",
      description: "thank you for helping people",
      image:
        "https://avatars.githubusercontent.com/u/158671738?s=400&u=cfa2ffe129d72fff816910f848369c5f70560229&v=4",
      order_id: res.data.data.id,
      handler: async function (response) {
      await api.post("/api/v1/pay/verify-and-book", {
        razorpay_payment_id: response.razorpay_payment_id,
        razorpay_order_id: response.razorpay_order_id,
        razorpay_signature: response.razorpay_signature,
        lockIds: Object.values(locks),
      });
      navigate(`/paymentsuccess?pay=${razorpay_payment_id}&order=${razorpay_order_id}`)
    },
      prefill: {
        name: "vinay",
        email: "viany@shakti.com",
        contact: "8307157627",
      },
      notes: {
        address: "Razorpay Corporate Office",
      },
      theme: {
        color: "#121212",
      },
    };

    const razor = new window.Razorpay(options);
    razor.open();
  };

  const handleDateandPay = async () => {
    try {
          if(price == 0) return 
          checkoutHandler(totalFair);
    } catch (error) {
      console.log("payment got failed")
    }
  };

  return (
  <div className="reserve fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
    <div className="rContainer bg-white rounded-2xl shadow-2xl w-[92%] max-w-3xl relative overflow-hidden">

      {/* Top Bar */}
      <div className="flex justify-between items-center px-6 py-4 ">
        <h2 className="text-xl font-bold text-gray-900">Select Your Rooms</h2>
        <FontAwesomeIcon
          onClick= {handleCross}
          icon={faCircleXmark}
          className="text-2xl text-gray-700 hover:text-red-600 cursor-pointer transition"
        />
      </div>

      {/* Scrollable Content */}
      <div className="p-6 max-h-[380px] overflow-y-auto custom-scroll space-y-6">

        {data.map((item) => (
          <div
            key={item._id}
            className="border rounded-xl p-5 bg-white shadow-sm hover:shadow-md transition"
          >
            {/* Room Header */}
            <div className="mb-4">
              <h3 className="text-2xl font-bold text-gray-900">{item.title}</h3>
              <p className="text-sm text-gray-500 mt-1">Choose available room numbers below</p>
            </div>

            {/* Room Details */}
            <div className="flex flex-col sm:flex-row sm:justify-between gap-6">

              {/* Left Section */}
              <div className="space-y-2 text-gray-700">
                <p>
                  <span className="font-medium">Max People:</span>{" "}
                  <span className="font-bold">{item.maxPeople}</span>
                </p>
                <p>
                  <span className="font-medium">Price:</span>{" "}
                  <span className="font-bold text-green-600">₹{item.price}</span>
                </p>
              </div>

              {/* Room Numbers Grid */}
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 w-full sm:w-auto">
                {item.roomNumbers.map((rno) => (
                  <label
                    key={rno._id}
                    className={`
                      flex flex-col items-center justify-center p-3 rounded-lg border text-sm font-semibold
                      shadow-sm cursor-pointer transition select-none
                      ${
                        !isAvailable(rno)
                          ? "opacity-40 cursor-not-allowed"
                          : "hover:bg-blue-50 hover:border-blue-400"
                      }
                    `}
                  >
                    <span className="text-gray-800">{rno.number}</span>
                    <input
                      type="checkbox"
                      value={rno._id}
                      onChange={(e) => handleSelect(e,item.price,item._id)}
                      disabled={!isAvailable(rno)}
                      className="mt-2 h-4 w-4 accent-blue-600 cursor-pointer"
                    />
                  </label>
                ))}
              </div>

            </div>
          </div>
        ))}

      </div>

      {/* Footer */}
      <div className="p-5 border-t bg-gray-50">
        <button
          onClick={handleDateandPay}
          disabled={!goToPay}
          className={`
            w-full p-4 rounded-xl font-extrabold text-lg transition
            ${
              goToPay
                ? "bg-[#0071c2] text-white hover:bg-blue-700 shadow-md"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }
          `}
        >
          {goToPay ? `₹ ${totalFair} • Book Now` : `Select Room`}
        </button>
      </div>

    </div>
  </div>
);


}

export default Book;
