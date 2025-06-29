import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import NotifyLogin from "../../components/Notify/NotifyLogin";
import Header from "../../components/Header/Header";
import api from "../../Axios/Axios";
import WelcomePopup from "../../components/Notify/NotifyWelcome";

const DetailsCourse = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "null");

  const [course, setCourse] = useState(null);
  const [showLoginPopup, setShowLoginPopup] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);

  const calculateAge = (dob) => {
    if (!dob) return 0;
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const extractAge = (ageStr) => {
    if (!ageStr) return 0;
    const match = ageStr.match(/^(\d+)\+/);
    return match ? parseInt(match[1], 10) : 0;
  };

  const userAge = user?.dateOfBirth ? calculateAge(user.dateOfBirth) : 0;

  useEffect(() => {
    if (!user || !user.id || user.role !== "MEMBER") {
      setShowLoginPopup(true);
    }
  }, []);

  useEffect(() => {
    api.get("/course/getAllCourse").then((res) => {
      const found = res.data.data.find((c) => String(c.id) === String(id));
      setCourse(found);
      setShowWelcome(true);
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

  const requiredAge = extractAge(course?.ageGroup?.age);
  const underAge = userAge < requiredAge;

  if (showLoginPopup) {
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
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500"></div>
      </div>
    );
  }

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

  if (showWelcome) {
    return (
      <WelcomePopup
        courseName={course.name}
        onContinue={() => setShowWelcome(false)}
      />
    );
  }

  return (
    <>
      <Header />
      <div className="min-h-screen py-8 px-4 bg-gray-100">
        <div className="max-w-4xl mx-auto">
          <nav className="text-sm text-gray-600 mb-4">
            <ol className="flex space-x-2">
              <li>
                <Link to="/Courses" className="text-teal-600 font-semibold">
                  KHÓA HỌC
                </Link>
              </li>
              <li>/</li>
              <li className="font-bold text-gray-900">
                {course.name?.toUpperCase()}
              </li>
            </ol>
          </nav>

          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold text-teal-700 italic drop-shadow-md">
              {course.name}
            </h2>
          </div>

          <div className="flex justify-center mb-6">
            {course.videoUrl ? (
              <div className="w-full max-w-2xl">
                <iframe
                  src={getEmbedUrl(course.videoUrl)}
                  title={course.name}
                  className="w-full h-[400px] rounded-xl border-2 border-teal-200 shadow-lg"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
            ) : (
              <div className="w-full max-w-2xl h-[400px] bg-gray-200 flex items-center justify-center rounded-xl border-2 border-teal-200 text-gray-500">
                Video đang được cập nhật...
              </div>
            )}
          </div>

          <div className="text-center mt-6">
            <button
              onClick={() => navigate(`/Courses/lesson/${id}`)}
              className="bg-teal-600 hover:bg-teal-700 text-white font-semibold py-2 px-6 rounded-xl transition duration-300 shadow-md"
            >
              Tiếp tục học
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default DetailsCourse;
