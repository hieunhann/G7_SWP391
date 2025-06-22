import React from "react";
import { useNavigate } from "react-router-dom";

const BookingRouter = () => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const role = user.role;
  const navigate = useNavigate();

  React.useEffect(() => {
    console.log("BookingRouter user:", user, "role:", role);
    if (role === "member" || role === "Thành viên") {
      navigate("/member-booked-consultations", { replace: true });
    } else if (role === "consultant" || role === "Chuyên gia tư vấn") {
      navigate("/consultant-booked-members", { replace: true });
    } else {
      navigate("/login", { replace: true });
    }
  }, [role, navigate]);

  return null;
};

export default BookingRouter;
