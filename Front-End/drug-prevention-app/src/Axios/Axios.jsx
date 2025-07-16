import axios from "axios";
import { store } from "../redux/store";
import { Login, logout } from "../redux/features/userSlice";
const api = axios.create({
  baseURL: "https://backend-drug-prevention.onrender.com/api/v1",
  withCredentials: true, 
});

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

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const res = await axios.get(
          "https://backend-drug-prevention.onrender.com/api/v1/auth/refresh",
          {
            withCredentials: true, 
          }
        );

        const { user, accessToken } = res.data;

        // ✅ Lưu mới vào localStorage
        const updatedUser = {
          ...user,
          accessToken: accessToken,
        };
        localStorage.setItem("user", JSON.stringify(updatedUser));

        store.dispatch(Login({ user, accessToken }));

        originalRequest.headers["Authorization"] = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        console.error("Refresh token thất bại:", refreshError);

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
