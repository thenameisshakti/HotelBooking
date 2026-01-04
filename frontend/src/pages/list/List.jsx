import Navbar from "../../components/navbar/Navbar";
import Header from "../../components/header/Header";
import "./list.css";
import { useLocation } from "react-router";
import { useContext, useState, useEffect, useRef } from "react";
import { format } from "date-fns";
import { DateRange } from "react-date-range";
import SearchItems from "../../components/searchItems/SearchItems";
import useFetch from "../../hooks/useFetch";
import { SearchContext } from "../../components/context/SearchContext";
import MailList from "../../components/mailList/MailList";
import Footer from "../../components/footer/Footer";
import api from '../../api/apihandler.js'

function List() {
  const location = useLocation();

  const [openDate, setOpenDate] = useState(false);

  // original initial states from location (unchanged)
  const [destination, setDestination] = useState(location.state.destination);
  const [date, setDate] = useState(location.state.date);
  const [option, setOption] = useState(location.state.option);

  // page visible in UI (for debugging / display) and pageRef for up-to-date value
  const [page, setPage] = useState(1);
  const pageRef = useRef(1);

  const [hotels, setHotels] = useState([]);
  const [hasMore, setHasMore] = useState(true);

  // lock to prevent concurrent loads
  const isFetchingRef = useRef(false);

  // limit per page (you set this). Keep as constant for loadMore calls.
  const limit = 3;

  const [min, setMin] = useState("");
  const [max, setMax] = useState("");

  // useFetch is used only for the initial page (page=1) and for reFetch when filters/search changes.
  // This preserves your existing reFetch behavior (you said you wanted it unchanged).
  // Note: page=1 is intentionally hard-coded here so useFetch won't re-run on every page increment.
  const initialUrl = `/api/v1/hotels/all?page=1&limit=${limit}&city=${destination}&min=${min}&max=${max}`;
  const { data, loading, error, reFetch } = useFetch(initialUrl);

  // When initial data arrives (or when reFetch triggers), replace hotels if we're on page 1.
  // This keeps the original behavior: initial fetch shows page 1 results and resets list on new search.
  useEffect(() => {
    if (!loading && data?.hotels) {
      // reset the list to the fresh first page results
      setHotels(data.hotels);
      setPage(1);
      pageRef.current = 1;
      // set hasMore based on server-returned totalPages
      const totalPages = data.totalPages ?? 1;
      setHasMore(totalPages > 1);
    }
  }, [data, loading]);

  // Keep refs of reactive values that loadMore/scroll listener will read
  const hasMoreRef = useRef(hasMore);
  useEffect(() => {
    hasMoreRef.current = hasMore;
  }, [hasMore]);

  const destinationRef = useRef(destination);
  useEffect(() => {
    destinationRef.current = destination;
  }, [destination]);

  const minRef = useRef(min);
  useEffect(() => {
    minRef.current = min;
  }, [min]);

  const maxRef = useRef(max);
  useEffect(() => {
    maxRef.current = max;
  }, [max]);

  // loadMore uses refs so it's safe when called from the scroll handler (no stale closures).
  const loadMore = async () => {
    // prevent multiple concurrent calls
    if (isFetchingRef.current || !hasMoreRef.current) return;

    isFetchingRef.current = true;
    const nextPage = pageRef.current + 1;

    // Use totalPages from the last fetched "data" (which is returned by useFetch)
    // data may be undefined temporarily; guard against it:
    const knownTotalPages = data?.totalPages ?? Infinity;
    if (nextPage > knownTotalPages) {
      setHasMore(false);
      isFetchingRef.current = false;
      return;
    }

    console.log("Loading page:", nextPage);

    try {
      const response = await api.get(
        `/api/v1/hotels/all?page=${nextPage}&limit=${limit}&city=${encodeURIComponent(
          destinationRef.current
        )}&min=${encodeURIComponent(minRef.current)}&max=${encodeURIComponent(
          maxRef.current
        )}`
      );

      const newHotels = response.data?.data?.hotels ?? [];

      // append without duplicates
      setHotels((prev) => {
        const merged = [...prev, ...newHotels];
        const unique = Array.from(new Map(merged.map((h) => [h._id, h])).values());
        return unique;
      });

      // advance page in both ref and state
      pageRef.current = nextPage;
      setPage(nextPage);

      const serverTotalPages = response.data?.data?.totalPages ?? knownTotalPages;
      setHasMore(nextPage < serverTotalPages);
    } catch (err) {
      console.error("loadMore error:", err);
    } finally {
      // small delay to avoid rapid re-triggers as the user scrolls
      setTimeout(() => {
        isFetchingRef.current = false;
      }, 200);
    }
  };

  // Single, stable scroll listener that reads latest refs.
  useEffect(() => {
    let throttled = false;

    const handleScroll = () => {
      if (throttled) return;
      throttled = true;
      setTimeout(() => {
        throttled = false;
        // only trigger loadMore when user is near bottom AND there is more to load
        if (
          window.innerHeight + window.scrollY >=
          document.body.offsetHeight - 500
        ) {
          if (!isFetchingRef.current && hasMoreRef.current) {
            loadMore();
          }
        }
      }, 250);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
    // empty deps -> attach once
  }, []);

  const { dispatch } = useContext(SearchContext);

  // keep handleSearch behavior unchanged — still calls reFetch and dispatches context
  const handleSearch = () => {
    dispatch({
      type: "NEW_SEARCH",
      payload: { destination, date, option },
    });
    // reset local state; useFetch effect will pick up new 'data' and set hotels to page1
    reFetch();
  };
const debounceRef = useRef(null); 
  const handleDestinationChange = (place) => {
    if (debounceRef.current) {
    clearTimeout(debounceRef.current);
  }
    
    debounceRef.current = setTimeout(() => {
      setDestination(place)
    }, 1000);
  }

  return (
    <div>
      <Navbar />
      <Header type="list" />
      <div className="listContainer">
        <div className="listWrapper">
          {/* --- SEARCH UI: KEPT IDENTICAL TO YOUR ORIGINAL (no functional changes) --- */}
          <div className="listSearch">
            <h1 className="listTitle">Search</h1>
            <div className="lsItem">
              <label htmlFor="label"> Destination</label>
              <input
                onChange={(e) => handleDestinationChange(e.target.value)}
                type="text"
                className=" bg-white px-2 py-2 rounded-md  cursor-pointer focus:outline-none"
                placeholder={destination}
              />
            </div>

            <div className="lsItem">
              <label htmlFor="check-in Date">Check-in Date</label>

              <span
                className="rounded-md bg-white p-2 text-gray-600"
                onClick={() => setOpenDate(!openDate)}
              >
                {`${format(date[0].startDate, "dd/MM/yyyy")} to ${format(
                  date[0].endDate,
                  "dd/MM/yyyy"
                )}`}{" "}
              </span>
              {openDate && (
                <DateRange
                  onChange={(item) => setDate([item.selection])}
                  minDate={new Date()}
                  ranges={date}
                />
              )}
            </div>
            <div className="lsItem ">
              <label> Options</label>
              <div className="lsOptionItem ">
                <span className="lsOptionText ">
                  Min prices<small> per night</small>
                </span>
                <input
                  type="text"
                  className="flex bg-white p-1.5 w-13 rounded-md focus:outline-none"
                  placeholder="999"
                  onChange={(e) => setMin(e.target.value)}
                />
              </div>
              <div className="lsOptionItem">
                <span className="lsOptionText">
                  Max price <small>per night</small>
                </span>
                <input
                  type="text"
                  className="flex bg-white p-1.5 w-13 rounded-md focus:outline-none"
                  placeholder="999"
                  onChange={(e) => setMax(e.target.value)}
                />
              </div>
              <div className="lsOptionItem">
                <span className="lsOptionText">Adult</span>
                <input
                  type="number"
                  min={1}
                  className="lsOptionInput"
                  onChange={(e) =>
                    setOption((perv) => ({ ...perv, adult: e.target.value }))
                  }
                  placeholder={option.adult}
                />
              </div>
              <div className="lsOptionItem">
                <span className="lsOptionText">Children</span>
                <input
                  type="number"
                  min={0}
                  className="lsOptionInput"
                  onChange={(e) =>
                    setOption((perv) => ({ ...perv, children: e.target.value }))
                  }
                  placeholder={option.children}
                />
              </div>
              <div className="lsOptionItem">
                <span className="lsOptionText">Room</span>
                <input
                  type="number"
                  min={1}
                  className="lsOptionInput"
                  onChange={(e) =>
                    setOption((perv) => ({ ...perv, room: e.target.value }))
                  }
                  placeholder={option.room}
                />
              </div>
            </div>
            <button
              className="w-full p-2 rounded-md cursor-pointer font-medium text-white bg-[#0071c2] active:bg-blue-800"
              onClick={handleSearch}
            >
              Search
            </button>
          </div>

          {/* --- RESULTS --- */}
          <div className="flex flex-col w-[75%]">
            <div className="listResult">
              {loading ? (
                "loading"
              ) : (
                <>
                  {hotels?.map((hotel) => (
                    <SearchItems hotel={hotel} key={hotel._id} />
                  ))}
                  {/* Optionally show a "loading more" indicator */}

                  {!hasMore && <div>No more results</div>}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-col items-center">
        <MailList />
        <Footer />
      </div>
    </div>
  );
}

export default List;
