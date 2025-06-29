import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8080/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    // Lấy accessToken từ localStorage key 'user'
    let token = null;
    const userStr = localStorage.getItem("user");
    accessToken = localStorage.getItem("access_token");

    if (userStr) {
      try {
        const userObj = JSON.parse(userStr);
        token = userObj.accessToken || accessToken;
      } catch (e) {
        token = null;
      }
    }
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
