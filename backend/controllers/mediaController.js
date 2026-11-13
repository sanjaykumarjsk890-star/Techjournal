const { normalizeImagePath } = require("../utils/imagePath");

const uploadArticleImage = (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: "Please choose a valid JPG, PNG, or WEBP image",
    });
  }

  res.status(201).json({
    success: true,
    imageUrl: normalizeImagePath(req.file),
  });
};

module.exports = { uploadArticleImage };
