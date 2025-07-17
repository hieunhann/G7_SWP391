import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8080/api/v1",
 
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
      console.error("Lỗi khi lấy token:", error);
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
        const res = await axios.get("http://localhost:8080/api/v1/auth/refresh", {
          withCredentials: true, 
        });

        const newAccessToken = res.data.accessToken;
        const updatedUser = {
          ...JSON.parse(localStorage.getItem("user")),
          accessToken: newAccessToken,
        };

        localStorage.setItem("user", JSON.stringify(updatedUser));

        originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        console.error("Refresh token thất bại:", refreshError);
        localStorage.removeItem("user");
        window.location.href = "/login"; 
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
