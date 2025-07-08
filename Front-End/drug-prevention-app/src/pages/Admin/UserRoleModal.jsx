import React, { useState } from "react";
import { FaUserShield } from "react-icons/fa";

const roles = ["ADMIN", "CONSULTANT", "MANAGER", "USER"];

const UserRoleModal = ({ user, onClose, onSave }) => {
  const [role, setRole] = useState(user.role);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(user.id, role);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 transition-all">
      <div className="bg-white p-8 rounded-2xl shadow-2xl w-96 max-w-full">
        <div className="flex items-center mb-4">
          <FaUserShield className="text-blue-600 text-2xl mr-2" />
          <h2 className="text-2xl font-bold text-blue-700">Đổi quyền cho {user.username}</h2>
        </div>
        <form onSubmit={handleSubmit}>
          <select
            className="w-full border p-3 mb-6 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            {roles.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg font-semibold transition"
              onClick={onClose}
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition"
            >
              Lưu
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserRoleModal;