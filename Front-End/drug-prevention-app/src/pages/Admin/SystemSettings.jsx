import React, { useState } from "react";
import { FaEnvelope, FaLock, FaImage, FaSave } from "react-icons/fa";

const SystemSettings = () => {
  const [systemName, setSystemName] = useState("Drug Prevention App");
  const [logo, setLogo] = useState(null);
  const [email, setEmail] = useState("");
  const [passwordPolicy, setPasswordPolicy] = useState({ minLength: 8, requireSpecial: true });

  const handleLogoChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setLogo(URL.createObjectURL(e.target.files[0]));
    }
  };

  const handleSave = (e) => {
    e.preventDefault();
    // TODO: Gửi dữ liệu lên backend
    alert("Đã lưu cấu hình (demo)");
  };

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-xl p-8 mt-8">
      <h2 className="text-2xl font-extrabold text-blue-700 mb-6 flex items-center gap-2">
        <FaLock className="text-blue-400" /> Cấu hình hệ thống
      </h2>
      <form onSubmit={handleSave} className="space-y-8">
        {/* Thông tin hệ thống */}
        <div className="flex items-center gap-6">
          <div>
            <label className="block font-semibold mb-1">Tên hệ thống</label>
            <input
              type="text"
              className="border rounded-lg px-4 py-2 w-64 focus:ring-2 focus:ring-blue-300"
              value={systemName}
              onChange={(e) => setSystemName(e.target.value)}
            />
          </div>
          <div>
            <label className="block font-semibold mb-1">Logo hệ thống</label>
            <div className="flex items-center gap-3">
              <input type="file" accept="image/*" onChange={handleLogoChange} className="hidden" id="logo-upload" />
              <label htmlFor="logo-upload" className="cursor-pointer bg-blue-100 px-3 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-200">
                <FaImage /> Chọn logo
              </label>
              {logo && <img src={logo} alt="logo" className="w-12 h-12 rounded-full object-cover border" />}
            </div>
          </div>
        </div>
        {/* Email hệ thống */}
        <div>
          <label className="block font-semibold mb-1 flex items-center gap-2"><FaEnvelope /> Email hệ thống</label>
          <input
            type="email"
            className="border rounded-lg px-4 py-2 w-full max-w-md focus:ring-2 focus:ring-blue-300"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@example.com"
          />
        </div>
        {/* Chính sách mật khẩu */}
        <div>
          <label className="block font-semibold mb-1 flex items-center gap-2"><FaLock /> Chính sách mật khẩu</label>
          <div className="flex items-center gap-4">
            <div>
              <span className="text-sm">Độ dài tối thiểu:</span>
              <input
                type="number"
                min={6}
                className="border rounded-lg px-2 py-1 w-16 ml-2 focus:ring-2 focus:ring-blue-300"
                value={passwordPolicy.minLength}
                onChange={(e) => setPasswordPolicy(p => ({ ...p, minLength: e.target.value }))}
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={passwordPolicy.requireSpecial}
                onChange={(e) => setPasswordPolicy(p => ({ ...p, requireSpecial: e.target.checked }))}
                className="accent-blue-500"
                id="special-char"
              />
              <label htmlFor="special-char" className="text-sm">Yêu cầu ký tự đặc biệt</label>
            </div>
          </div>
        </div>
        <div className="flex justify-end">
          <button type="submit" className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition">
            <FaSave /> Lưu cấu hình
          </button>
        </div>
      </form>
    </div>
  );
};

export default SystemSettings; 