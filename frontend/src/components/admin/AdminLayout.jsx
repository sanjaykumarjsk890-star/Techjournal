import AdminSidebar from "./AdminSidebar";
import AdminHeader from "./AdminHeader";

function AdminLayout({ children, title }) {
  return (
    <div className="admin-app-container">
      <AdminSidebar />
      <div className="admin-main-viewport">
        <AdminHeader title={title} />
        <main className="admin-content-area">{children}</main>
      </div>
    </div>
  );
}

export default AdminLayout;
