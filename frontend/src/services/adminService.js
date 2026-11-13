import api from "./api";

export const adminService = {
  // Dashboard statistics
  getDashboardStats: async () => {
    const response = await api.get("/admin/dashboard");
    return response.data;
  },

  getAuthors: async () => {
    const response = await api.get("/admin/authors");
    return response.data;
  },

  createAuthor: async (author) => {
    const response = await api.post("/admin/authors", author);
    return response.data;
  },

  updateAuthor: async (id, author) => {
    const response = await api.put(`/admin/authors/${id}`, author);
    return response.data;
  },

  deleteAuthor: async (id) => {
    const response = await api.delete(`/admin/authors/${id}`);
    return response.data;
  },

  uploadArticleImage: async (file) => {
    const formData = new FormData();
    formData.append("image", file);
    const response = await api.post("/admin/images", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  // List all blogs with status/category/search filters
  getAdminBlogs: async (params = {}) => {
    const response = await api.get("/admin/blogs", { params });
    return response.data;
  },

  // Get single blog by ID for editing
  getAdminBlogById: async (id) => {
    const response = await api.get(`/admin/blogs/${id}`);
    return response.data;
  },

  // Create article (FormData or JSON)
  createBlog: async (formData) => {
    const isFormData = formData instanceof FormData;
    const response = await api.post("/admin/blogs", formData, {
      headers: isFormData ? { "Content-Type": "multipart/form-data" } : {},
    });
    return response.data;
  },

  // Update article (FormData or JSON)
  updateBlog: async (id, formData) => {
    const isFormData = formData instanceof FormData;
    const response = await api.put(`/admin/blogs/${id}`, formData, {
      headers: isFormData ? { "Content-Type": "multipart/form-data" } : {},
    });
    return response.data;
  },

  // Delete article
  deleteBlog: async (id) => {
    const response = await api.delete(`/admin/blogs/${id}`);
    return response.data;
  },
};

export default adminService;
