const normalizeImagePath = (file) =>
  file ? `/uploads/blog-images/${file.filename}` : "";

module.exports = { normalizeImagePath };
