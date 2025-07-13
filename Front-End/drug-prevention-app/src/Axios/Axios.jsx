import axios from "axios";
import { store } from "../redux/store";
import { Login, logout } from "../redux/features/userSlice";
const api = axios.create({
  baseURL: "http://localhost:8080/api/v1",
  withCredentials: true, // Cần thiết để gửi cookie chứa refresh_token
});

// ✅ Gắn accessToken từ localStorage vào mỗi request
api.interceptors.request.use(
  (config) => {
    try {
      const userData = JSON.parse(localStorage.getItem("user"));
      const token = userData?.accessToken;
      if (token) {
        config.headers["Authorization"] = `Bearer ${token}`;
      }
    } catch (error) {
      console.error("Lỗi khi lấy token từ localStorage:", error);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ✅ Tự động refresh accessToken nếu hết hạn (401)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Nếu bị 401 và chưa thử refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const res = await axios.get(
          "http://localhost:8080/api/v1/auth/refresh",
          {
            withCredentials: true, // Gửi cookie
          }
        );

        const { user, accessToken } = res.data;

        // ✅ Lưu mới vào localStorage
        const updatedUser = {
          ...user,
          accessToken: accessToken,
        };
        localStorage.setItem("user", JSON.stringify(updatedUser));

        // ✅ Nếu có Redux, cập nhật lại store
        store.dispatch(Login({ user, accessToken }));

        // ✅ Gửi lại request cũ với token mới
        originalRequest.headers["Authorization"] = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        console.error("Refresh token thất bại:", refreshError);

        // ✅ Xóa local và quay về login
        localStorage.removeItem("user");
        store.dispatch(logout());
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
