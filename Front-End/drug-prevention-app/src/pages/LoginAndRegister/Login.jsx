import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import api from "../../Axios/Axios";
import { toast } from "react-toastify";
import { useDispatch } from "react-redux";
import { Login } from "../../redux/features/userSlice";

const LoginPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const navigate = useNavigate();
  const dispatch = useDispatch();

  // ✅ Đăng nhập thông thường
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    try {
      const res = await api.post("/auth/login", { username, password });
      const response = res.data.data;
      const { user, accessToken } = response;

      dispatch(Login({ user, accessToken }));
      localStorage.setItem("user", JSON.stringify({ ...user, accessToken }));
      toast.success("Đăng nhập thành công!");
      navigate("/");
    } catch (err) {
      console.error("Login failed:", err);
      setErrorMsg("Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.");
      toast.error("Sai tài khoản hoặc mật khẩu!");
    }
  };

  // ✅ Đăng nhập Google
  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const token = credentialResponse.credential;
      if (!token) {
        throw new Error("Google token is missing");
      }

      const res = await api.post("/auth/google", { token });

      const { user, accessToken } = res.data.data;
      dispatch(Login({ user, accessToken }));
      localStorage.setItem("user", JSON.stringify({ ...user, accessToken }));
      toast.success("Đăng nhập bằng Google thành công!");
      navigate("/");
    } catch (err) {
      console.error("Google login error:", err);
      toast.error("Lỗi đăng nhập Google");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 font-sans">
      <div className="bg-white w-full max-w-md p-8 rounded-xl shadow-md">
        <h2 className="text-2xl font-bold text-center text-blue-800 mb-6">
          Drug Use Prevention Support System
        </h2>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label
              htmlFor="username"
              className="block mb-1 font-medium text-gray-700"
            >
              Tên người dùng
            </label>
            <div className="flex items-center border rounded-md overflow-hidden">
              <span className="px-3 text-blue-800">
                <i className="bi bi-person" />
              </span>
              <input
                type="text"
                id="username"
                className="flex-1 py-2 px-3 focus:outline-none"
                placeholder="Nhập tên người dùng của bạn"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="mb-4">
            <label
              htmlFor="password"
              className="block mb-1 font-medium text-gray-700"
            >
              Mật khẩu
            </label>
            <div className="flex items-center border rounded-md overflow-hidden">
              <span className="px-3 text-blue-800">
                <i className="bi bi-lock" />
              </span>
              <input
                type="password"
                id="password"
                className="flex-1 py-2 px-3 focus:outline-none"
                placeholder="Nhập mật khẩu của bạn"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          {errorMsg && (
            <div className="text-red-600 text-sm text-center mb-4">
              {errorMsg}
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-blue-800 hover:bg-blue-700 text-white py-2 rounded-md text-lg font-semibold"
          >
            Đăng nhập
          </button>
        </form>

        <div className="my-4 text-center text-gray-600">Hoặc</div>

        <div className="flex justify-center mb-4">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => {
              setErrorMsg("Đăng nhập Google thất bại");
              toast.error("Lỗi đăng nhập Google");
            }}
            locale="vi"
          />
        </div>

        <div className="text-center">
          <p className="text-sm">
            Bạn chưa có tài khoản?{" "}
            <a
              href="/register"
              className="text-blue-800 font-semibold hover:underline"
            >
              Đăng ký tại đây
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
