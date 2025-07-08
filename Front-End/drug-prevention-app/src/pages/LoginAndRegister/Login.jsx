import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import api from "../../Axios/Axios";
import { toast } from "react-toastify";
import { useDispatch } from "react-redux";
import { Login } from "../../redux/features/userSlice";

const LoginPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();
  const message = location.state?.message;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    try {
      const res = await api.post("/auth/login", { username, password });

      const { user, accessToken } = res.data.data;
      dispatch(Login({ user, accessToken }));
      localStorage.setItem("user", JSON.stringify({ ...user, accessToken }));
      toast.success("Đăng nhập thành công!");
      if (user.role === "ADMIN") {
      navigate("/admin/users");
    } else {
      navigate("/");
    }
      
    } catch (err) {
      setErrorMsg("Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.");
      toast.error("Sai tài khoản hoặc mật khẩu!");
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const token = credentialResponse.credential;
      if (!token) throw new Error("Google token is missing");

      const res = await api.post("/auth/google", { token });
      const { user, accessToken } = res.data.data;

      dispatch(Login({ user, accessToken }));
      localStorage.setItem("user", JSON.stringify({ ...user, accessToken }));
      toast.success("Đăng nhập bằng Google thành công!");
      if (user.role === "ADMIN") {
      navigate("/admin/users");
    } else {
      navigate("/");
    }
    } catch (err) {
      toast.error("Lỗi đăng nhập Google");
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center px-4"
      style={{
        backgroundImage:
          "url('https://png.pngtree.com/thumb_back/fw800/background/20231226/pngtree-elegant-light-green-cannabis-leaf-floral-texture-design-in-a-seamless-image_13909796.png')",
      }}
    >
      <div className="w-full max-w-xl bg-white/30 border border-white/30 shadow-2xl rounded-3xl p-10 text-gray-800">
        <h2 className="text-3xl font-bold text-center text-[#004b8d] mb-8">
          Đăng nhập hệ thống
        </h2>

        {message && <div className="mb-4 text-red-600 text-center">{message}</div>}

        <form
          onSubmit={handleSubmit}
          className="space-y-5 text-base font-medium"
        >
          {/* Tên người dùng */}
          <div>
            <label className="block mb-1">Tên người dùng</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Nhập tên người dùng"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white/60 
                         placeholder-gray-600 text-gray-900 focus:outline-none 
                         focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Mật khẩu */}
          <div className="relative">
            <label className="block mb-1">Mật khẩu</label>
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Nhập mật khẩu"
              className="w-full px-4 py-3 pr-12 rounded-lg border border-gray-300 bg-white/60 
                         placeholder-gray-600 text-gray-900 focus:outline-none 
                         focus:ring-2 focus:ring-blue-500"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute top-1/2 right-3 transform -translate-y-1/2 text-gray-600 hover:text-gray-800"
            >
              <i
                className={`bi ${showPassword ? "bi-eye-slash" : "bi-eye"}`}
              ></i>
            </button>
          </div>

          {/* Lỗi đăng nhập */}
          {errorMsg && (
            <div className="text-red-600 text-sm text-center">{errorMsg}</div>
          )}

          {/* Nút đăng nhập */}
          <button type="submit" className="btn btn-outline-primary w-100 mt-1">
            Đăng nhập
          </button>
        </form>

        {/* Google */}
        <div className="my-6 text-center text-gray-700">Hoặc</div>
        <div className="flex justify-center">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => toast.error("Lỗi đăng nhập Google")}
            locale="vi"
          />
        </div>

        {/* Đăng ký */}
        <p className="text-center text-lg mt-6">
          Bạn chưa có tài khoản?{" "}
          <a
            href="/register"
            className="text-blue-700 font-semibold hover:underline"
          >
            Đăng ký tại đây
          </a>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
