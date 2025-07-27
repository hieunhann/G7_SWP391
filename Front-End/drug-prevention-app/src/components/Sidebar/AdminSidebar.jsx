import React from "react";
import { FaUserCog, FaUsers, FaCogs, FaSignOutAlt, FaUser } from "react-icons/fa";

const getUserInfo = () => {
  try {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user && user.username && user.role) {
      return {
        avatar: user.avatar || null,
        name: user.username,
        role: user.role,
      };
    }
  } catch {}
  return {
    avatar: null,
    name: "Admin",
    role: "ADMIN",
  };
};

const menu = [
  { label: "Quản lý phân quyền", icon: <FaUsers />, href: "/admin/users" },
  { label: "Cấu hình hệ thống", icon: <FaCogs />, href: "/admin/settings" },
  { label: "Hồ sơ cá nhân", icon: <FaUser />, href: "/UserProfile" },
];

const AdminSidebar = ({ onLogout }) => {
  const adminInfo = getUserInfo();

  // ❌ Nếu không phải ADMIN, không render gì cả
  if (adminInfo.role !== "ADMIN") {
    return null;
  }

  return (
    <aside className="h-screen w-64 bg-white shadow-xl flex flex-col fixed top-0 left-0 z-40">
      <div className="flex flex-col items-center py-8 border-b">
        {adminInfo.avatar ? (
          <img
            src={adminInfo.avatar}
            alt="avatar"
            className="w-16 h-16 rounded-full object-cover mb-2"
          />
        ) : (
          <FaUserCog className="w-16 h-16 text-blue-400 mb-2" />
        )}
        <div className="font-bold text-lg text-blue-700">{adminInfo.name}</div>
        <div className="text-xs text-gray-500">{adminInfo.role}</div>
      </div>
      <nav className="flex-1 px-4 py-6">
        <ul className="space-y-2">
          {menu.map((item) => (
            <li key={item.label}>
              <a
                href={item.href}
                className="flex items-center gap-3 px-4 py-2 rounded-lg text-gray-700 hover:bg-blue-50 hover:text-blue-700 font-medium transition"
              >
                {item.icon}
                <span>{item.label}</span>
              </a>
            </li>
          ))}
        </ul>
      </nav>
      <div className="p-4 border-t">
        <button
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold transition"
        >
          <FaSignOutAlt /> Đăng xuất
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;
