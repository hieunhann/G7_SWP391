import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import NotifyLogin from "../../components/NotifyLogin/NotifyLogin";
import Header from "../../components/Header/Header";
import api from "../../Axios/Axios";

const DetailsCourse = () => {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "null");

  // Tính tuổi từ ngày sinh
  const calculateAge = (dob) => {
  if (!dob) return 0;
  const birthDate = new Date(dob); // chuẩn ISO format yyyy-MM-dd
  const today = new Date();

  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  return age;
};


  // Trích số tuổi từ "5+", "12+", "18+"
  const extractAge = (ageStr) => {
    if (!ageStr) return 0;
    const match = ageStr.match(/^(\d+)\+/);
    return match ? parseInt(match[1], 10) : 0;
  };

  const userAge = user?.dateOfBirth ? calculateAge(user.dateOfBirth) : 0;
  console.log("Ngày sinh:", user?.dateOfBirth);
  console.log("Tuổi:", userAge);

  useEffect(() => {
    if (!user || !user.id || user.role !== "MEMBER") {
      setShowLoginPopup(true);
    }
  }, []);

  const [showLoginPopup, setShowLoginPopup] = useState(false);

  useEffect(() => {
    api.get("/course/getAllCourse").then((res) => {
      const found = res.data.data.find((c) => String(c.id) === String(id));
      setCourse(found);
    });
  }, [id]);

  const getEmbedUrl = (url) => {
    if (!url) return "";
    if (url.includes("youtube.com/watch")) {
      return url.replace("watch?v=", "embed/");
    }
    if (url.includes("youtu.be/")) {
      const videoId = url.split("youtu.be/")[1];
      return `https://www.youtube.com/embed/${videoId}`;
    }
    return url;
  };

  if (!user || !user.id || user.role !== "MEMBER") {
    return (
      <NotifyLogin
        show={true}
        onCancel={() => navigate("/courses")}
        message={
          !user
            ? "Hãy đăng nhập để có thể học khóa học nhé!!!"
            : "Chỉ thành viên mới có quyền truy cập khóa học này."
        }
        cancelText="Quay lại"
        confirmText="Đăng nhập"
        redirectTo="/login"
      />
    );
  }

  if (!course) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-info" role="status"></div>
      </div>
    );
  }

  const requiredAge = extractAge(course?.ageGroup?.age);
  const underAge = userAge < requiredAge;

  if (underAge) {
    return (
      <NotifyLogin
        show={true}
        onCancel={() => navigate("/courses")}
        message={`Bạn chưa đủ ${requiredAge}+ tuổi để học khóa học này.`}
        cancelText="Quay lại"
        confirmText="Tìm khóa khác"
        redirectTo="/courses"
      />
    );
  }

  return (
    <>
      <Header />
      <div className="min-vh-100 py-4" style={{ background: "#f8fafc" }}>
        <div className="container">
          <nav
            style={{ "--bs-breadcrumb-divider": "'>'" }}
            aria-label="breadcrumb"
          >
            <ol className="breadcrumb bg-transparent px-0 mb-2">
              <li className="breadcrumb-item">
                <Link
                  to="/Courses"
                  className="text-decoration-none"
                  style={{ color: "#00838f" }}
                >
                  KHÓA HỌC
                </Link>
              </li>
              <li
                className="breadcrumb-item active"
                aria-current="page"
                style={{ color: "#222", fontWeight: 600 }}
              >
                {course.name?.toUpperCase()}
              </li>
            </ol>
          </nav>

          <div className="mb-4 text-center">
            <h2
              style={{
                fontSize: "2rem",
                fontWeight: 700,
                color: "#00838f",
                fontStyle: "italic",
              }}
            >
              {course.name}
            </h2>
          </div>

          {/* Video */}
          <div className="d-flex justify-content-center mb-4 flex-column align-items-center">
            {course.videoUrl ? (
              <div style={{ maxWidth: 700, width: "100%" }}>
                <iframe
                  src={getEmbedUrl(course.videoUrl)}
                  title={course.name}
                  width="700"
                  height="400"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  style={{ borderRadius: "8px", border: "2px solid #b2dfdb" }}
                ></iframe>
              </div>
            ) : (
              <div
                style={{
                  width: "1000px",
                  height: "562px",
                  background: "#e0e0e0",
                  borderRadius: "8px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#888",
                  fontSize: "1.2rem",
                  border: "2px solid #b2dfdb",
                }}
              >
                Video đang được cập nhật...
              </div>
            )}
          </div>

          {/* Nút kiểm tra (để sau) */}
          <div className="text-center mt-3">
            <button
              className="btn btn-outline-info"
              disabled
              title="Tính năng bài kiểm tra sẽ được cập nhật sau"
            >
              Bài kiểm tra (sắp có)
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default DetailsCourse;
