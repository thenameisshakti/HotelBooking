import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import api from "../../api/apihandler.js";
import { StarRating } from "../../utils/StarRating.jsx";

const STORAGE_KEY = "hotel_review_draft";

function WriteReviewModal({ hotelId, onClose, onSuccess }) {
  const { watch, setValue, handleSubmit, reset, register } = useForm({
    defaultValues: {
      rating: 3,
      description: "",
      categoryRatings: {
        staff: 3,
        facilities: 3,
        cleanliness: 3,
        comfort: 3,
        valueForMoney: 3,
        location: 3,
        freeWifi: 3,
      },
      photos: [],
    },
  });

  const [photoFiles, setPhotoFiles] = useState([]);
  const [photoPreviews, setPhotoPreviews] = useState([]);
  const [confirming, setConfirming] = useState(false);

  /* Restore draft */
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) reset(JSON.parse(saved));
  }, [reset]);

  /* Persist draft */
  useEffect(() => {
    const sub = watch((v) =>
      localStorage.setItem(STORAGE_KEY, JSON.stringify(v))
    );
    return () => sub.unsubscribe();
  }, [watch]);

  /* Photos */
  const handlePhotoChange = (e) => {
    const files = Array.from(e.target.files).slice(0, 5);
    setPhotoFiles(files);
    setValue("photos", files);
    setPhotoPreviews(files.map((f) => URL.createObjectURL(f)));
  };

  const removePhoto = (i) => {
    const f = photoFiles.filter((_, idx) => idx !== i);
    setPhotoFiles(f);
    setPhotoPreviews(photoPreviews.filter((_, idx) => idx !== i));
    setValue("photos", f);
  };

  /* Submit */
  const submitReview = async (data) => {
    const fd = new FormData();
    fd.append("description", data.description);
    fd.append("rating", data.rating);
    fd.append("categoryRatings", JSON.stringify(data.categoryRatings));
    data.photos.forEach((p) => fd.append("photos", p));

    await api.post(`/api/v1/hotels/review/${hotelId}`, fd);

    localStorage.removeItem(STORAGE_KEY);
    reset();
    onSuccess();
    onClose();
  };

  function handleOnClose () {
    localStorage.removeItem(STORAGE_KEY)
    reset()
    onClose()
  }

  const categories = Object.keys(watch("categoryRatings"));

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
      <div className="bg-white max-w-xl w-full max-h-[90vh] overflow-y-auto  rounded-2xl shadow-xl p-6 relative">

        <button onClick={() => handleOnClose()} className="absolute top-4 right-4 text-xl">
          ✕
        </button>

        <h2 className="text-2xl font-bold mb-4">Write a review</h2>

        <form
          onSubmit={handleSubmit(() => setConfirming(true))}
          className="space-y-6"
        >

          {/* Overall rating */}
          <div>
            <p className="font-medium mb-2">Overall rating</p>
            <StarRating
              value={watch("rating")}
              onChange={(v) => setValue("rating", v)}
            />
          </div>

          {/* Category ratings */}
          <div className="border-t pt-4 space-y-4">
            <p className="font-semibold text-lg">Rate your stay</p>

            {categories.map((key) => (
              <div key={key} className="flex justify-between items-center">
                <span className="capitalize">{key}</span>
                <StarRating
                  value={watch(`categoryRatings.${key}`)}
                  onChange={(v) =>
                    setValue(`categoryRatings.${key}`, v)
                  }
                />
              </div>
            ))}
          </div>

          {/* Review text */}
          <div className="border-t pt-4">
            <textarea
              {...register("description", { maxLength: 4000 })}
              rows={4}
              placeholder="What should other guests know?"
              className="w-full border rounded-lg p-3"
            />
            <p className="text-xs text-gray-500 text-right">
              {watch("description")?.length || 0} / 4000
            </p>
          </div>

          {/* Photos */}
          <div className="border-t pt-4">
            <p className="font-medium mb-2 ">Share photos</p>
            <input className="cursor-pointer" type="file" multiple accept="image/*" onChange={handlePhotoChange} />

            {photoPreviews.length > 0 && (
              <div className="flex gap-2 mt-3">
                {photoPreviews.map((src, i) => (
                  <div key={i} className="relative">
                    <img src={src} className="w-20 h-20 object-cover rounded" />
                    <button
                      type="button"
                      onClick={() => removePhoto(i)}
                      className="absolute -top-2 -right-2 bg-black text-white rounded-full w-5 h-5 text-xs"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button className="w-full bg-[#0071c2] hover:bg-[#005fa3] py-2 rounded-full font-semibold text-white font-bold">
            Submit
          </button>
        </form>

        {/* Confirm */}
        {confirming && (
          <div className="absolute inset-0 bg-white/95 flex flex-col items-center justify-center rounded-2xl">
            <p className="font-medium mb-4">Submit this review?</p>
            <div className="flex gap-4">
              <button onClick={() =>setConfirming(false)
              } className="px-4 py-2 border rounded">
                Cancel
              </button>
              <button onClick={handleSubmit(submitReview)} className="px-4 py-2 bg-[#0071c2] hover:bg-[#005fa3] rounded text-white font-bold    ">
                Yes, submit
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default WriteReviewModal;
