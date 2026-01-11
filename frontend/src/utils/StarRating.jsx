export function StarRating({ value, onChange }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          className={`text-2xl ${
            star <= value ? "text-[#003580]" : "text-gray-300"
          }`}
        >
          ★
        </button>
      ))}
    </div>
  );
}

function StarRatingSummary({ rating }) {
  const stars = [];

  for (let i = 1; i <= 5; i++) {
    if (rating >= i) {
      // Full star
      stars.push(
        <span key={i} className="text-[#003580]">★</span>
      );
    } else if (rating >= i - 0.5) {
      // Half star
      stars.push(
        <span key={i} className="text-[#003580]">☆</span>
      );
    } else {
      // Empty star
      stars.push(
        <span key={i} className="text-gray-300">★</span>
      );
    }
  }

  return <span className="text-xl flex">{stars}</span>;
}
export default StarRatingSummary;