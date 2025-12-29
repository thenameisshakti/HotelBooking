import { faCircleXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { SearchContext } from "../context/SearchContext";
import useFetch from "../../hooks/useFetch";
import { useContext, useState } from "react";
import { useNavigate } from "react-router";
import "./book.css";
import axios from "axios";

function Book({ setOpen, hotelId }) {
  const [selectedRoom, setSelectedRoom] = useState([]);
  const [goToPay , setGoToPay] = useState(false)
  const { data, loading, error } = useFetch(`/api/v1/hotels/room/${hotelId}`);
  const [price, setPrice] = useState([]);
  const { date } = useContext(SearchContext);
  const navigate = useNavigate();

  const getDatesInRange = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const tarik = new Date(start.getTime());

    let list = [];
    while (tarik <= end) {
      list.push(new Date(tarik).getTime());
      tarik.setDate(tarik.getDate() + 1);
    }
    return list;
  };

  const alldates = getDatesInRange(date[0].startDate, date[0].endDate);

  const isAvailable = (roomNumber) => {
    const isFound = roomNumber.unavailableDates.some((date) =>
      alldates.includes(new Date(date).getTime())
    );
    return !isFound;
  };

  const handleSelect = (e) => {
    const checked = e.target.checked;
    const value = e.target.value;
    const updateroom = checked
      ? [...selectedRoom, value]
      : selectedRoom.filter((item) => item !== value);
    setSelectedRoom(updateroom);
    priceCalcultion(updateroom);
    if(updateroom.length > 0){
        setGoToPay(true)
    }else setGoToPay(false)

  };
  const priceCalcultion = async (updateroom) => {
    let total = 0;

    await Promise.all(
      updateroom.map(async (roomId) => {
        const res = await axios.get(`/api/v1/rooms/get/${roomId}`);
        total += res.data.data.price;
        setPrice(total);
      })
    );
  };

  const checkoutHandler = async (amount) => {
    const unique = await axios.get("/api/v1/getkey");

    const res = await axios.post("/api/v1/pay/payment", { amount });

    const options = {
      key: unique.data.key,
      amount: res.data.data.amount,
      currency: "INR",
      name: "@thenameisshakti",
      description: "thank you for helping people",
      image:
        "https://avatars.githubusercontent.com/u/158671738?s=400&u=cfa2ffe129d72fff816910f848369c5f70560229&v=4",
      order_id: res.data.data.id,
      callback_url: "/api/v1/pay/paymentverification",
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
      await Promise.all(
        selectedRoom.map(async (roomId) => {
          const res = await axios.put(`/api/v1/rooms/availability/${roomId}`, {
            date: alldates,
          });
          checkoutHandler(price);
          return res.data;
        })
      );
    } catch (error) {
    }
  };

  return (
  <div className="reserve fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
    <div className="rContainer bg-white rounded-2xl shadow-2xl w-[92%] max-w-3xl relative overflow-hidden">

      {/* Top Bar */}
      <div className="flex justify-between items-center px-6 py-4 ">
        <h2 className="text-xl font-bold text-gray-900">Select Your Rooms</h2>
        <FontAwesomeIcon
          onClick={() => setOpen(false)}
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
                      onChange={handleSelect}
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
          {goToPay ? `₹ ${price} • Book Now` : `Select Room`}
        </button>
      </div>

    </div>
  </div>
);


}

export default Book;
