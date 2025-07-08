import React, { useEffect, useState } from "react";
import axios from "axios";
import UserTable from "./UserTable";
import UserRoleModal from "./UserRoleModal";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AdminSidebar from "../../components/Sidebar/AdminSidebar";
import { useNavigate, useLocation } from "react-router-dom";
import SystemSettings from "./SystemSettings";

const UserManagementPage = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const fetchUsers = async () => {
    try {
      const res = await axios.get("http://localhost:8080/api/v1/users");
      console.log("API response:", res.data);
      let userArr = [];
      if (res.data.data) {
        if (Array.isArray(res.data.data.result)) {
          userArr = res.data.data.result;
        }
      }
      setUsers(userArr);
    } catch (err) {
      toast.error("Lỗi khi tải danh sách user");
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleOpenRoleModal = (user) => {
    setSelectedUser(user);
    setShowRoleModal(true);
  };

  const handleCloseRoleModal = () => {
    setShowRoleModal(false);
    setSelectedUser(null);
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      const res = await axios.put(`http://localhost:8080/api/v1/users/${userId}/role`, { role: newRole });
      toast.success(res.data.message || "Cập nhật quyền thành công!");
      fetchUsers();
    } catch (err) {
      toast.error("Cập nhật quyền thất bại!");
    }
    handleCloseRoleModal();
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Bạn có chắc muốn xóa user này?")) return;
    try {
      await axios.delete(`http://localhost:8080/api/v1/users/${userId}`);
      toast.success("Xóa user thành công!");
      fetchUsers();
    } catch (err) {
      toast.error("Xóa user thất bại!");
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  if (location.pathname === "/admin/settings") {
    return (
      <div className="flex min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
        <AdminSidebar onLogout={handleLogout} />
        <main className="flex-1 ml-64">
          <SystemSettings />
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      <AdminSidebar onLogout={handleLogout} />
      <main className="flex-1 ml-64">
        <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-xl p-8 mt-8">
          <h1 className="text-3xl font-extrabold text-blue-700 mb-2 text-center tracking-tight">Quản lý phân quyền User</h1>
          <p className="text-gray-500 mb-8 text-center">Quản lý, phân quyền và xóa tài khoản người dùng trong hệ thống.</p>
          <UserTable
            users={users}
            onEditRole={handleOpenRoleModal}
            onDelete={handleDeleteUser}
          />
          {showRoleModal && selectedUser && (
            <UserRoleModal
              user={selectedUser}
              onClose={handleCloseRoleModal}
              onSave={handleRoleChange}
            />
          )}
        </div>
        <ToastContainer position="top-right" autoClose={2500} />
      </main>
    </div>
  );
};

export default UserManagementPage;