import { useState, useEffect } from "react";
import ReviewCard from "./ReviewCard";

const CARD_WIDTH = 420;
const GAP = 45;
const VISIBLE = 2;

function ReviewList({ reviews }) {
  const extended = [reviews[reviews.length - 1], ...reviews, reviews[0]];

  const [index, setIndex] = useState(1);
  const [animate, setAnimate] = useState(true);

  const next = () => {
    setAnimate(true);
    setIndex((prev) => prev + 1);
  };

  const prev = () => {
    setAnimate(true);
    setIndex((prev) => prev - 1);
  };

  useEffect(() => {
    if (index === extended.length - VISIBLE) {
      setTimeout(() => {
        setAnimate(false);
        setIndex(1);
      }, 300);
    }

    if (index === 0) {
      setTimeout(() => {
        setAnimate(false);
        setIndex(extended.length - VISIBLE - 1);
      }, 300);
    }
  }, [index, extended.length]);

  return (
    <div className="relative flex justify-center">
      <div
        className="overflow-hidden"
        style={{
          width: CARD_WIDTH * VISIBLE + GAP,
        }}
      >
        <div
          className="flex"
          style={{
            gap: GAP,
            transition: animate ? "transform 300ms ease" : "none",
            transform: `translateX(-${index * (CARD_WIDTH + GAP)}px)`,
          }}
        >
          {extended.map((review, i) => (
            <ReviewCard key={i} review={review} />
          ))}
        </div>
      </div>

      <button
        onClick={prev}
        className="absolute -left-5 top-1/2 -translate-y-1/2 bg-[#0071c2] text-white rounded-full w-9 h-9 cursor-pointer"
      >
        ‹
      </button>

      <button
        onClick={next}
        className="absolute -right-5 top-1/2 -translate-y-1/2 bg-[#0071c2] text-white rounded-full w-9 h-9 cursor-pointer"
      >
        ›
      </button>
    </div>
  );
}

export default ReviewList;
