import { useEffect, useState, useContext } from "react";
import ReviewList from "./ReviewList";
import WriteReviewModal from "./WriteReviewModal";
import api from "../../api/apihandler.js";
import { AuthContext } from "../context/AuthContext.jsx";
import ReviewsDrawer from "./ReviewDrawer.jsx";
import { useLocation, useNavigate } from "react-router";
import "./hotelreview.css";

function HotelReviews({ hotelId }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [reviews, setReviews] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/api/v1/hotels/review/${hotelId}`);
      setReviews(res.data.reviews || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleWriteReview = async() => {
    console.log("clicked");
    if (!user) navigate("/login");

    const {data} = await api.get('/api/v1')
    setOpen(true);
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  return (
    <div className=" mt-11 max-w-5xl mx-auto">
      <div className="flex justify-between mb-4">
        <h2 className="text-2xl font-bold">
          What our guests are saying about this property...
        </h2>

        {/* Button is shown only if user is logged in (backend will still protect) */}
        {!user && <button
          className="btn btn-home ml-1 border-2"
          onClick={handleWriteReview}
          type="button"
        >
          <span className="btn_grey_plus">
            <i className="fa fa-plus-circle" aria-hidden="true">
              +
            </i>
          </span>
          <span className="shape_btn"></span>
          <span className="btn_black">Write your views</span>
        </button>}
      </div>
      {console.log(reviews)}
      {loading ? (
        <p>Loading reviews...</p>
      ) : reviews.length > 0 ? (
        <ReviewList reviews={reviews} />
      ) : (
        <p>No reviews yet. Be the first to write one!</p>
      )}
      <ReviewsDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        hotelId={hotelId}
      />

      <div className="flex justify-end mt-3">
        <button
          onClick={() => setDrawerOpen(true)}
          className="text-[#0071c2] font-semibold cursor-pointer"
        >
          See all reviews
        </button>
      </div>

      {open && (
        <WriteReviewModal
          hotelId={hotelId}
          onClose={() => {
            setOpen(false);
          }}
          onSuccess={fetchReviews}
        />
      )}
    </div>
  );
}

export default HotelReviews;
