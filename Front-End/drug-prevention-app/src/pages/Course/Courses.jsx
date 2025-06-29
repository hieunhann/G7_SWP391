import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../Axios/Axios";
import Header from "../../components/Header/Header";

const COURSES_PER_PAGE = 4;

const Courses = () => {
  const [courses, setCourses] = useState([]);
  const [search, setSearch] = useState("");
  const [ageGroupFilter, setAgeGroupFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      try {
        const res = await api.get("/course/getAllCourse");
        setCourses(Array.isArray(res.data.data) ? res.data.data : res.data);
      } catch (err) {
        console.error("Lỗi lấy danh sách khóa học:", err);
      }
      setLoading(false);
    };
    fetchCourses();
  }, []);

  const allAgeGroups = Array.from(
    new Set(
      courses.map((course) => course.ageGroup?.name.trim()).filter(Boolean)
    )
  );

  const filteredCourses = courses.filter((course) => {
    const matchSearch =
      course.name?.toLowerCase().includes(search.toLowerCase()) ||
      course.description?.toLowerCase().includes(search.toLowerCase());
    const matchAgeGroup =
      !ageGroupFilter ||
      course.ageGroup?.name.toLowerCase() === ageGroupFilter.toLowerCase();
    return matchSearch && matchAgeGroup;
  });

  const totalPages = Math.ceil(filteredCourses.length / COURSES_PER_PAGE);
  const currentCourses = filteredCourses.slice(
    (currentPage - 1) * COURSES_PER_PAGE,
    currentPage * COURSES_PER_PAGE
  );

  return (
    <>
      <Header />
      <div className="min-h-screen bg-[#f9fafb] py-6 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-[#004b8d] mb-6">
            Khóa học phòng chống ma túy
          </h2>

          {/* Bộ lọc */}
          <div className="flex flex-wrap justify-center gap-4 mb-6">
            <input
              type="text"
              placeholder="Tìm kiếm khóa học..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="px-4 py-2 border border-[#004b8d] rounded-xl w-full max-w-md focus:ring focus:ring-blue-200"
            />
            <select
              value={ageGroupFilter}
              onChange={(e) => {
                setAgeGroupFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-4 py-2 border border-[#004b8d] rounded-xl focus:ring focus:ring-blue-200"
            >
              <option value="">Tất cả nhóm tuổi</option>
              {allAgeGroups.map((group) => (
                <option key={group} value={group}>
                  {group}
                </option>
              ))}
            </select>
          </div>

          {/* Thống kê */}
          <p className="text-center text-sm text-gray-600 mb-4">
            Đã tìm thấy <strong>{filteredCourses.length}</strong> khóa học phù
            hợp
          </p>

          {/* Danh sách khóa học */}
          {loading ? (
            <div className="flex justify-center items-center h-40">
              <div className="w-10 h-10 border-4 border-blue-300 border-t-blue-600 rounded-full animate-spin"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
              <AnimatePresence>
                {currentCourses.map((course) => (
                  <motion.div
                    key={course.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3 }}
                    whileHover={{ scale: 1.03 }}
                    className="bg-white p-4 rounded-2xl shadow hover:shadow-lg border border-teal-200 transition-all duration-300"
                  >
                    <div className="flex flex-col md:flex-row gap-4">
                      <img
                        src={course.image}
                        alt={course.name}
                        className="w-full md:w-40 h-28 object-cover rounded-lg border border-[#004b8d]"
                      />
                      <div className="flex flex-col justify-between">
                        <h3 className="text-xl font-semibold text-blue-700">
                          {course.name}
                        </h3>
                        <p className="text-gray-700 text-sm mt-2 line-clamp-3">
                          {course.description}
                        </p>
                        <div className="flex gap-4 text-sm text-[#004b8d] mt-3">
                          <span>
                            👥 {course.ageGroup?.name} ({course.ageGroup?.age})
                          </span>
                          <span>⏱ {course.duration || "N/A"} phút</span>
                        </div>
                        <div className="flex gap-2 mt-4">
                          <button
                            className="bg-blue-600 text-white px-4 py-1 rounded-xl hover:bg-blue-700 flex items-center gap-2"
                            onClick={() => {
                              const user = JSON.parse(
                                localStorage.getItem("user") || "null"
                              );
                              if (!user?.id) return navigate("/login");
                              navigate(`/Courses/lesson/${course.id}`);
                            }}
                          >
                            <i className="bi bi-play-circle-fill"></i> Bắt đầu khóa học miễn phí
                          </button>
                          <button
                            className="bg-gray-200 text-blue-700 rounded-xl px-4 py-1 hover:bg-gray-300"
                            onClick={() =>
                              navigate(`/Courses/lesson/${course.id}/feedback`)
                            }
                          >
                           Xem các đánh giá khóa học
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
        {/* Phân trang */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-6 gap-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                className={`px-4 py-2 rounded-xl border font-medium text-sm transition-all duration-200 ${
                  p === currentPage
                    ? "bg-[#004b8d] text-white border-[#004b8d]"
                    : "bg-white text-[#004b8d] border-[#004b8d] hover:bg-blue-50"
                }`}
                onClick={() => setCurrentPage(p)}
              >
                {p}
              </button>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default Courses;
