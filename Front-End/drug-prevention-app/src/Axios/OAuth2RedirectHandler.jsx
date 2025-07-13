// // src/pages/OAuth2RedirectHandler.jsx

// import React, { useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import { useDispatch } from "react-redux";
// import { Login } from "../redux/features/userSlice";
// import axios from "axios";
// import { toast } from "react-toastify";

// const OAuth2RedirectHandler = () => {
//   const navigate = useNavigate();
//   const dispatch = useDispatch();

//   useEffect(() => {
//     axios
//       .get("http://localhost:8080/api/v1/auth/refresh", {
//         withCredentials: true,
//       })
//       .then((res) => {
//         const { user, accessToken } = res.data.data;
//         if (user && accessToken) {
//           dispatch(Login({ user, accessToken }));
//           localStorage.setItem("user", JSON.stringify({ user, accessToken }));
//           toast.success("Đăng nhập Google thành công!");
//           navigate("/");
//         } else {
//           toast.error("Không lấy được thông tin người dùng.");
//           navigate("/login");
//         }
//       })
//       .catch((err) => {
//         console.error("Lỗi khi lấy user từ refresh token:", err);
//         toast.error("Đăng nhập thất bại.");
//         navigate("/login");
//       });
//   }, [dispatch, navigate]);

//   return <div>Đang xác thực tài khoản Google...</div>;
// };

// export default OAuth2RedirectHandler;
