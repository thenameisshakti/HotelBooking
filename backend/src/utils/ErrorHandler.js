import ApiError from "../utils/ApiError.js"

const errorHandler = (err, req, res, next) => {
  console.error("ERROR:", err);

  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      statusCode: err.statusCode,
    })
  }

}

export default errorHandler;
