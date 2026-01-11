import StarRatingSummary from "../../utils/StarRating";

function RatingSummary({ reviewStats }) {
  if (!reviewStats || reviewStats.totalReviews === 0) {
    return <p>No reviews yet</p>;
  }

  const { averageRating, totalReviews, ratingCounts, categoryAverages } =
    reviewStats;

  const getPercentage = (count) => Math.round((count / totalReviews) * 100);

  const stars = [
    { label: "5 star", count: ratingCounts.fiveStar },
    { label: "4 star", count: ratingCounts.fourStar },
    { label: "3 star", count: ratingCounts.threeStar },
    { label: "2 star", count: ratingCounts.twoStar },
    { label: "1 star", count: ratingCounts.oneStar },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl">
      {/* LEFT: Overall rating + distribution */}
      <div>
        <h2 className="text-2xl font-bold mb-1">Customer reviews</h2>

        <div className="flex items-center gap-2 mb-2">
          <StarRatingSummary rating={averageRating} />
          <span className="text-lg font-semibold">
            {averageRating.toFixed(1)} out of 5
          </span>
        </div>

        <p className="text-gray-600 mb-4">
          {totalReviews.toLocaleString()} global ratings
        </p>

        <div className="space-y-3">
          {stars.map((star) => {
            const percentage = getPercentage(star.count);

            return (
              <div key={star.label} className="flex items-center gap-3">
                <span className="w-14 text-black text-sm cursor-pointer">
                  {star.label}
                </span>

                <div className="flex-1 h-4 bg-gray-200 rounded overflow-hidden">
                  <div
                    className="h-full bg-[#0071c2]"
                    style={{ width: `${percentage}%` }}
                  />
                </div>

                <span className="w-10 text-sm text-black">
                  {percentage}%
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* RIGHT: Category averages */}
      <div className="grid content-end">
        <h3 className="text-xl font-semibold mb-4">
          Average ratings by category :
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
          {Object.entries(categoryAverages).map(([key, value]) => {
            const percentage = (value / 5) * 100; // Booking-style scale (out of 10)

            return (
              <div key={key} className="">
                {/* Label + value */}
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-800">
                    {key.replace(/([A-Z])/g, " $1")}
                  </span>
                  <span className="text-sm font-semibold text-gray-900">
                    {value.toFixed(1)}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#0071c2] rounded-full transition-all duration-300"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default RatingSummary;
