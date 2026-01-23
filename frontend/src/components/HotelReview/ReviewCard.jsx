function ReviewCard({ review }) {
  return (
    <div
      className="
        border rounded-xl p-4 bg-white shadow-sm
        w-[420px] h-[220px] shrink-0
        flex flex-col
      "
    >
      <div className="flex justify-between items-center mb-2">
        <span className="font-semibold">@{review.user.username}</span>
        <span className="bg-[#003580] text-white text-sm px-2 py-1 rounded">
          {review.rating}.0
        </span>
      </div>

      <p className="text-gray-700 text-sm line-clamp-6">
        {review.description}
      </p>
    </div>
  );
}

export default ReviewCard;
