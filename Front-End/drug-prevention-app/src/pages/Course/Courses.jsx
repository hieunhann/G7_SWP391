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
      <div className="min-h-screen bg-[#f0f2f5] py-6 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-extrabold text-left text-[#004b8d] mb-8 border-b-4 border-[#0070cc] pb-2">
            Khóa học phòng chống ma túy
          </h2>

          {/* Bộ lọc */}
          <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
            <input
              type="text"
              placeholder="Tìm kiếm khóa học..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="px-4 py-2 border border-[#004b8d] rounded-xl w-full max-w-md focus:ring focus:ring-blue-200 shadow-sm"
            />
            <select
              value={ageGroupFilter}
              onChange={(e) => {
                setAgeGroupFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-4 py-2 border border-[#004b8d] rounded-xl focus:ring focus:ring-blue-200 shadow-sm"
            >
              <option value="">Tất cả nhóm tuổi</option>
              {allAgeGroups.map((group) => (
                <option key={group} value={group}>
                  {group}
                </option>
              ))}
            </select>
          </div>

          <p className="text-left text-sm text-gray-600 mb-4">
            Đã tìm thấy <strong>{filteredCourses.length}</strong> khóa học phù hợp
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
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    transition={{ duration: 0.3 }}
                    className="bg-white rounded-2xl shadow-2xl p-4 border border-gray-200 transform hover:scale-[1.01] transition duration-300"
                    style={{ boxShadow: "0 20px 40px rgba(0, 0, 0, 0.1)" }}
                  >
                    <div className="flex flex-col md:flex-row gap-4">
                      <img
                        src={course.image}
                        alt={course.name}
                        className="w-full md:w-64 h-56 object-cover rounded-lg border border-[#004b8d] shadow"
                      />
                      <div className="flex flex-col justify-between flex-1">
                        <h3 className="text-xl font-semibold text-[#004b8d]">
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
                        <div className="flex gap-2 mt-4 flex-wrap">
                          <button
                            className="w-fit bg-gradient-to-r from-[#004b8d] to-[#0070cc] text-white font-medium py-1.5 px-4 rounded-xl hover:opacity-90 text-sm shadow"
                            onClick={() => {
                              const user = JSON.parse(
                                localStorage.getItem("user") || "null"
                              );
                              if (!user?.id) return navigate("/login");
                              navigate(`/Courses/lesson/${course.id}`);
                            }}
                          >
                            ▶️ Xem video học
                          </button>
                          
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}

          {/* Phân trang */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-8 gap-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  className={`px-4 py-2 rounded-xl border font-medium text-sm transition-all duration-200 shadow-sm ${
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
      </div>
    </>
  );
};

export default Courses;
