import api from "./api";

export const categoryService = {
  // Public list of all categories
  getCategories: async () => {
    const response = await api.get("/categories");
    return response.data;
  },

  // Admin create category
  createCategory: async (categoryData) => {
    const response = await api.post("/categories", categoryData);
    return response.data;
  },

  // Admin update category
  updateCategory: async (id, categoryData) => {
    const response = await api.put(`/categories/${id}`, categoryData);
    return response.data;
  },

  // Admin delete category
  deleteCategory: async (id) => {
    const response = await api.delete(`/categories/${id}`);
    return response.data;
  },

  // Admin seed default categories
  seedDefaultCategories: async () => {
    const response = await api.post("/categories/seed");
    return response.data;
  },
};

export default categoryService;
