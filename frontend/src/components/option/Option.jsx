import { faCircleXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useContext, useState } from "react";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";


import { format } from "date-fns";
import { DateRange } from "react-date-range";
import { SearchContext } from "../context/SearchContext";

function Option({ setDirect, state }) {
  const { dispatch } = useContext(SearchContext);

  const [destination, setDestination] = useState();
  const today = new Date() 
  const tomorrow = new Date()
  tomorrow.setDate(today.getDate() + 1)

  const [date, setDate] = useState([
    {
      startDate: today ,
      endDate: tomorrow,
      key: "selection",
    },
  ]);
  const [option, setOption] = useState({
    adult: 1,
    children: 0,
    room: 1,
  });
  const [openDate, setOpenDate] = useState(false);
  const [openOption, setOpenOption] = useState(false);

  const handleOption = (name, operation) => {
    setOption((prev) => {
      return {
        ...prev,
        [name]: operation === "i" ? option[name] + 1 : option[name] - 1,
      };
    });
  };

  const handleBook = () => {
    setDestination(state);

    dispatch({ type: "NEW_SEARCH", payload: { destination, date, option } });
    setDirect(false);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
  <div className="relative bg-white rounded-xl shadow-2xl  max-w-fit overflow-hidden">

    {/* Header */}
    <div className="flex justify-between items-center px-5 py-4 border-b ">
      <h2 className="font-bold text-xl text-black">Booking Details</h2>
      <FontAwesomeIcon
        onClick={() => setDirect(false)}
        icon={faCircleXmark}
        className="text-2xl cursor-pointer text-black/70 hover:text-red-600 transition"
      />
    </div>

    <div className="p-6 space-y-6">

      {/* DATE SECTION */}
      <div>
        <label className="font-semibold text-gray-800">Select Dates</label>
        <div
          onClick={() => {
            setOpenDate(!openDate);
            setOpenOption(false);
          }}
          className="mt-2 bg-gray-100 border rounded-lg px-3 py-3 cursor-pointer hover:bg-gray-200 transition"
        >
          {`${format(date[0].startDate, "dd/MM/yyyy")} — ${format(
            date[0].endDate,
            "dd/MM/yyyy"
          )}`}
        </div>

        {openDate && (
          <div className="mt-3 border rounded-lg  w-full shadow-md overflow-hidden">
            <DateRange
               onChange={(item) => {
                const start = item.selection.startDate;
                let end = item.selection.endDate;

                if (start.getTime() === end.getTime()) {
                  end = new Date(start);
                  end.setDate(end.getDate() + 1);
                }
              
                setDate([
                  {
                    ...item.selection,
                    startDate: start,
                    endDate: end,
                  },
                ]);
              }}
              minDate={new Date()}
              ranges={date}
              className="flex justify-end rounded-md"
            />
          </div>
        )}
      </div>

      {/* OPTION SECTION */}
      <div>
        <label className="font-semibold text-gray-800">Guests & Rooms</label>

        <div
          onClick={() => {
            setOpenOption(!openOption);
            setOpenDate(false);
          }}
          className="mt-2 bg-gray-100 border rounded-lg px-3 py-3 cursor-pointer hover:bg-gray-200 transition"
        >
          {`${option.adult} Adult · ${option.children} Children · ${option.room} Room`}
        </div>

        {openOption && (
          <div className="mt-3 bg-gray-50 border rounded-lg shadow-md p-4 space-y-4">

            {/* Row Template Functionality KEPT SAME */}

            {/* Adult */}
            <div className="flex justify-between items-center ">
              <span className="font-semibold text-gray-700">Adults</span>
              <div className="flex items-center gap-3">
                <button
                  disabled={option.adult <= 1}
                  onClick={() => handleOption("adult", "d")}
                  className="h-10 w-10 ml-2 bg-gray-200 rounded-lg flex items-center justify-center font-bold hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  –
                </button>

                <span className="h-10 w-10 flex items-center justify-center font-medium text-gray-800">
                  {option.adult}
                </span>

                <button
                  onClick={() => handleOption("adult", "i")}
                  className="h-10 w-10 bg-gray-200 rounded-lg flex items-center justify-center font-bold hover:bg-gray-300"
                >
                  +
                </button>
              </div>
            </div>

            {/* Children */}
            <div className="flex justify-between items-center">
              <span className="font-semibold text-gray-700">Children</span>
              <div className="flex items-center gap-3">
                <button
                  disabled={option.children < 1}
                  onClick={() => handleOption("children", "d")}
                  className="h-10 w-10 ml-2 bg-gray-200 rounded-lg flex items-center justify-center font-bold hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  –
                </button>

                <span className="h-10 w-10 flex items-center justify-center font-medium text-gray-800">
                  {option.children}
                </span>

                <button
                  onClick={() => handleOption("children", "i")}
                  className="h-10 w-10 bg-gray-200 rounded-lg flex items-center justify-center font-bold hover:bg-gray-300"
                >
                  +
                </button>
              </div>
            </div>

            {/* Room */}
            <div className="flex justify-between items-center">
              <span className="font-semibold text-gray-700">Rooms</span>
              <div className="flex items-center gap-3">
                <button
                  disabled={option.room <= 1}
                  onClick={() => handleOption("room", "d")}
                  className="h-10 w-10 ml-2 bg-gray-200 rounded-lg flex items-center justify-center font-bold hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  –
                </button>

                <span className="h-10 w-10 flex items-center justify-center font-medium text-gray-800">
                  {option.room}
                </span>

                <button
                  onClick={() => handleOption("room", "i")}
                  className="h-10 w-10 bg-gray-200 rounded-lg flex items-center justify-center font-bold hover:bg-gray-300"
                >
                  +
                </button>
              </div>
            </div>

          </div>
        )}
      </div>

    </div>

    {/* SUBMIT BUTTON */}
    <div className="px-6 pb-6">
      <button
        onClick={handleBook}
        className="w-full bg-blue-600 text-white font-semibold text-lg py-3 rounded-lg hover:bg-blue-700 shadow-md transition"
      >
        Submit
      </button>
    </div>

  </div>
</div>

  );
}

export default Option;
