import React from "react";
import { useNavigate } from "react-router-dom";

const NotifyLogin = ({
  show,
  onCancel, // callback khi bấm Hủy
  message = "Hãy đăng nhập để tiếp tục!",
  cancelText = "Hủy",
  confirmText = "Tiếp tục",
  redirectTo = "/login",
}) => {
  const navigate = useNavigate();

  if (!show) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        zIndex: 9999,
        minWidth: 400,
        maxWidth: 600,
        background: "#fff",
        border: "2px solid #0070cc",
        color: "#0070cc",
        padding: "40px 32px",
        borderRadius: 16,
        textAlign: "center",
        fontWeight: 700,
        fontSize: "1.5rem",
        boxShadow: "0 4px 32px rgba(0,0,0,0.20)"
      }}
    >
      <div>{message}</div>
      <div className="mt-4 d-flex justify-content-center gap-4">
        <button
          className="btn btn-outline-primary w-100 mt-2"
          style={{ minWidth: 120, fontSize: "1.1rem" }}
          onClick={onCancel}
        >
          {cancelText}
        </button>
        <button
          className="btn btn-outline-primary w-100 mt-2"
          style={{ minWidth: 120, fontSize: "1.1rem" }}
          onClick={() => navigate(redirectTo)}
        >
          {confirmText}
        </button>
      </div>
    </div>
  );
};

export default NotifyLogin;