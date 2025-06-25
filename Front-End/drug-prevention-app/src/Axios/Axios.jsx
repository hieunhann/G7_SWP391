import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8080/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
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

export default api;
