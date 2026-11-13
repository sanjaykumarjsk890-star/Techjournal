import { Routes, Route, Navigate } from "react-router-dom";

import Home from "../pages/public/Home";
import Blogs from "../pages/public/Blogs";
import BlogDetails from "../pages/public/BlogDetails";
import Help from "../pages/public/Help";
import About from "../pages/public/About";
import Login from "../pages/public/Login";

import Dashboard from "../pages/admin/Dashboard";
import ManageBlogs from "../pages/admin/ManageBlogs";
import BlogForm from "../pages/admin/BlogForm";
import ManageCategories from "../pages/admin/ManageCategories";
import ManageAuthors from "../pages/admin/ManageAuthors";

import ProtectedRoute from "./ProtectedRoute";
import AdminRoute from "./AdminRoute";

function AppRoutes() {
  return (
    <Routes>
      {/* Public Pages */}
      <Route path="/" element={<Home />} />
      <Route path="/blogs" element={<Blogs />} />
      <Route path="/blogs/:slug" element={<BlogDetails />} />
      <Route path="/help" element={<Help />} />
      <Route path="/about" element={<About />} />
      <Route path="/login" element={<Login />} />

      {/* Admin CMS Pages */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <AdminRoute>
              <Dashboard />
            </AdminRoute>
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/blogs"
        element={
          <ProtectedRoute>
            <AdminRoute>
              <ManageBlogs />
            </AdminRoute>
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/blogs/new"
        element={
          <ProtectedRoute>
            <AdminRoute>
              <BlogForm />
            </AdminRoute>
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/blogs/edit/:id"
        element={
          <ProtectedRoute>
            <AdminRoute>
              <BlogForm />
            </AdminRoute>
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/categories"
        element={
          <ProtectedRoute>
            <AdminRoute>
              <ManageCategories />
            </AdminRoute>
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/authors"
        element={
          <ProtectedRoute>
            <AdminRoute>
              <ManageAuthors />
            </AdminRoute>
          </ProtectedRoute>
        }
      />

      {/* 404 Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default AppRoutes;
