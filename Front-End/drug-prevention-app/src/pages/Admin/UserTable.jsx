import React, { useState } from "react";
import { FaUserCircle, FaEdit, FaTrash } from "react-icons/fa";

const roleMap = {
  ADMIN: "Admin",
  CONSULTANT: "Tư vấn viên",
  MANAGER: "Quản lý",
  MEMBER: "Thành viên",
  STAFF: "Nhân viên",
};

// Thứ tự ưu tiên role
const rolePriority = {
  ADMIN: 1,
  MANAGER: 2,
  STAFF: 3,
  MEMBER: 4,
  CONSULTANT: 5,
};

const UserTable = ({ users, onEditRole, onDelete }) => {
  const [filterRole, setFilterRole] = useState("ALL");

  // Lọc và sắp xếp users
  const filteredUsers = (Array.isArray(users) ? users : [])
    .filter(user => filterRole === "ALL" || user.role === filterRole)
    .sort((a, b) => {
      const pa = rolePriority[a.role] || 99;
      const pb = rolePriority[b.role] || 99;
      return pa - pb;
    });

  return (
    <div className="overflow-x-auto">
      {/* Bộ lọc role */}
      <div className="mb-4 flex items-center gap-2">
        <label className="font-semibold">Lọc theo vai trò:</label>
        <select
          className="border rounded px-2 py-1"
          value={filterRole}
          onChange={e => setFilterRole(e.target.value)}
        >
          <option value="ALL">Tất cả</option>
          <option value="ADMIN">Admin</option>
          <option value="MANAGER">Quản lý</option>
          <option value="STAFF">Nhân viên</option>
          <option value="MEMBER">Thành viên</option>
          <option value="CONSULTANT">Tư vấn viên</option>
        </select>
      </div>
      <table className="min-w-full bg-white border rounded-2xl shadow-lg">
        <thead>
          <tr className="bg-blue-100 text-blue-700">
            <th className="py-3 px-4 border-b font-semibold">Avatar</th>
            <th className="py-3 px-4 border-b font-semibold">Username</th>
            <th className="py-3 px-4 border-b font-semibold">Họ tên</th>
            <th className="py-3 px-4 border-b font-semibold">Chức vụ</th>
            <th className="py-3 px-4 border-b font-semibold">Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {filteredUsers.map((user) => (
            <tr key={user.id} className="hover:bg-blue-50 transition">
              <td className="py-2 px-4 border-b text-center">
                {user.avatar ? (
                  <img src={`http://localhost:8080/storage/avatars/${user.avatar}`} alt="avatar" className="w-8 h-8 rounded-full mx-auto object-cover" />
                ) : (
                  <FaUserCircle className="w-8 h-8 text-gray-400 mx-auto" />
                )}
              </td>
              <td className="py-2 px-4 border-b">{user.username}</td>
              <td className="py-2 px-4 border-b">{user.firstName} {user.lastName}</td>
              <td className="py-2 px-4 border-b">{roleMap[user.role] || user.role}</td>
              <td className="py-2 px-4 border-b text-center">
                <button
                  className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-lg mr-2 flex items-center gap-1 shadow-sm transition"
                  onClick={() => onEditRole(user)}
                  title="Đổi quyền"
                >
                  <FaEdit /> <span className="hidden sm:inline">Đổi quyền</span>
                </button>
                <button
                  className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg flex items-center gap-1 shadow-sm transition"
                  onClick={() => onDelete(user.id)}
                  title="Xóa user"
                >
                  <FaTrash /> <span className="hidden sm:inline">Xóa</span>
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UserTable;