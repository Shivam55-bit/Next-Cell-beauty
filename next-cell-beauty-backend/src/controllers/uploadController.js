import { sendSuccess, sendError } from "../utils/apiResponse.js";

export const uploadFile = (req, res) => {
  if (!req.file && (!req.files || req.files.length === 0)) {
    return sendError(res, "No file uploaded.", 400);
  }

  const getRelativeFolder = (fileObj) => {
    if (fileObj.destination) {
      const parts = fileObj.destination.split(/[\/\\]/);
      return parts[parts.length - 1] || "products";
    }
    return "products";
  };

  if (req.files && req.files.length > 0) {
    const uploadedFiles = req.files.map((file) => {
      const folder = getRelativeFolder(file);
      return {
        filename: file.filename,
        url: `${req.protocol}://${req.get("host")}/uploads/${folder}/${file.filename}`
      };
    });

    return sendSuccess(res, "Files uploaded successfully", uploadedFiles, 201);
  }

  const folder = getRelativeFolder(req.file);
  const fileUrl = `${req.protocol}://${req.get("host")}/uploads/${folder}/${req.file.filename}`;

  return sendSuccess(res, "File uploaded successfully", {
    filename: req.file.filename,
    url: fileUrl
  }, 201);
};
