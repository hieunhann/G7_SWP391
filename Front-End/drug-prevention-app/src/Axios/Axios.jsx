import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8080/api/v1",
  // headers: {
  //   "Content-Type": "application/json",
  // },
});

// Gắn accessToken từ localStorage vào mỗi request
api.interceptors.request.use(
  (config) => {
    try {
      const userData = JSON.parse(localStorage.getItem("user"));
      const token = userData?.accessToken;
      if (token) {
        config.headers["Authorization"] = `Bearer ${token}`;
      }
    } catch (error) {
      console.error("Lỗi khi lấy token:", error);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: Tự động làm mới access token nếu 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Nếu bị 401 và chưa từng thử refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const res = await axios.get("http://localhost:8080/api/v1/auth/refresh", {
          withCredentials: true, // Để gửi cookie chứa refresh_token
        });

        const newAccessToken = res.data.accessToken;
        const updatedUser = {
          ...JSON.parse(localStorage.getItem("user")),
          accessToken: newAccessToken,
        };

        localStorage.setItem("user", JSON.stringify(updatedUser));

        // Gắn token mới và gửi lại request cũ
        originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        console.error("Refresh token thất bại:", refreshError);
        localStorage.removeItem("user");
        window.location.href = "/login"; // hoặc navigate nếu dùng React Router
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
