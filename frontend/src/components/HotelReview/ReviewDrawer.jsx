import { useEffect, useState } from "react";
import api from "../../api/apihandler";

const PAGE_SIZE = 5;

function ReviewsDrawer({ open, onClose, hotelId }) {
  const [reviews, setReviews] = useState([]);
  const [page, setPage] = useState(1);
  const [totalReviews, setTotalReviews] = useState(0);
  const [loading, setLoading] = useState(false);

  const totalPages = Math.ceil(totalReviews / PAGE_SIZE);

  const fetchReviews = async (pageNumber) => {
    try {
      setLoading(true);

      const skip = (pageNumber - 1) * PAGE_SIZE;

      const res = await api.get(
        `/api/v1/hotels/review/${hotelId}?skip=${skip}&limit=${PAGE_SIZE}`
      );
      console.log(res.data, "reviews fetched");

      setReviews(res.data.reviews || []);
      setTotalReviews(res.data.totalReviews || 0);
    } catch (error) {
      console.error("Failed to fetch reviews", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      setPage(1);
      fetchReviews(1);
    }
  }, [open]);

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages) return;
    setPage(newPage);
    fetchReviews(newPage);
  };

  return (
    <>
      {/* Overlay */}
      <div
        onClick={onClose}
        className={`fixed inset-0 bg-black/40 z-40 transition-opacity
        ${open ? "opacity-100 visible" : "opacity-0 invisible"}`}
      />

      {/* RIGHT Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-full sm:w-[480px] bg-white z-50
        transform transition-transform duration-300
        ${open ? "translate-x-0" : "translate-x-full"}`}
      >
        {/* Header */}
        <div className="flex justify-between items-center px-4 py-3 border-b">
          <h2 className="text-lg font-semibold">
            Guest reviews ({totalReviews})
          </h2>
          <button
            onClick={onClose}
            className="text-2xl text-gray-500 hover:text-black"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="flex flex-col h-[calc(100%-56px)]">
          {/* Reviews */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {loading ? (
              <p className="text-sm text-gray-500">Loading reviews...</p>
            ) : reviews.length === 0 ? (
              <p className="text-sm text-gray-500">
                No reviews yet. Be the first to review!
              </p>
            ) : (
              reviews.map((review) => (
                <div
                  key={review._id}
                  className="border border-gray-200 rounded-lg p-4 space-y-2"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-gray-900">
                        {review.userId?.name || "Guest"}
                      </p>
                      <p className="text-xs text-gray-500">
                        Reviewed on{" "}
                        {new Date(review.createdAt).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="bg-[#003580] text-white text-sm font-semibold px-2 py-1 rounded">
                      {Number(review.rating).toFixed(1)}
                    </div>
                  </div>

                  <p className="text-sm text-gray-700">
                    {review.description}
                  </p>
                </div>
              ))
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="border-t px-4 py-3 flex justify-center items-center gap-2">
              <button
                onClick={() => handlePageChange(page - 1)}
                disabled={page === 1}
                className="px-3 py-1 text-sm border rounded disabled:opacity-40"
              >
                Previous
              </button>

              {[...Array(totalPages)].map((_, index) => {
                const p = index + 1;
                return (
                  <button
                    key={p}
                    onClick={() => handlePageChange(p)}
                    className={`px-3 py-1 text-sm rounded border
                      ${
                        p === page
                          ? "bg-[#003580] text-white border-[#003580]"
                          : "bg-white text-gray-700"
                      }`}
                  >
                    {p}
                  </button>
                );
              })}

              <button
                onClick={() => handlePageChange(page + 1)}
                disabled={page === totalPages}
                className="px-3 py-1 text-sm border rounded disabled:opacity-40"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default ReviewsDrawer;
