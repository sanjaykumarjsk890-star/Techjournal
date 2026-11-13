import api from "./api";

export const blogService = {
  // Public blog listing with search, category, sort, page, limit
  getAllBlogs: async (params = {}) => {
    const response = await api.get("/blogs", { params });
    return response.data;
  },

  // Single blog details by slug (includes related blogs and navigation)
  getBlogBySlug: async (slug) => {
    const response = await api.get(`/blogs/${slug}`);
    return response.data;
  },

  // Featured blogs
  getFeaturedBlogs: async () => {
    const response = await api.get("/blogs/featured");
    return response.data;
  },

  // Trending blogs
  getTrendingBlogs: async () => {
    const response = await api.get("/blogs/trending");
    return response.data;
  },
};

export default blogService;
