export const sendSuccess = (res, message = "Operation successful", data = {}, statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data
  });
};

export const sendPaginated = (res, data = [], pagination = { page: 1, limit: 20, total: 0, totalPages: 1 }, message = "Data retrieved successfully") => {
  return res.status(200).json({
    success: true,
    message,
    data,
    pagination
  });
};

export const sendError = (res, message = "An error occurred", statusCode = 400, errors = null) => {
  return res.status(statusCode).json({
    success: false,
    message,
    ...(errors ? { errors } : {})
  });
};
