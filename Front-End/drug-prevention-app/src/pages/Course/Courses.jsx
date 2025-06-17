import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../components/Header/Header";
const COURSES_PER_PAGE = 4;

const getAllAgeGroups = (courses) => {
  // Tách tất cả nhóm tuổi thành mảng, loại bỏ trùng lặp và khoảng trắng thừa
  const groups = new Set();
  courses.forEach((course) => {
    if (course.ageGroup) {
      course.ageGroup.split(",").forEach((g) => groups.add(g.trim()));
    }
  });
  return Array.from(groups);
};

const Courses = () => {
  const [courses, setCourses] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");
  const [ageGroupFilter, setAgeGroupFilter] = useState(""); 

  const navigate = useNavigate();

 
  useEffect(() => {
    fetch("http://localhost:5002/Course")
      .then((res) => res.json())
      .then((data) => {
        const validData = Array.isArray(data) && Array.isArray(data[0]) ? data[0] : data;
        setCourses(validData);
      })
      .catch((err) => console.error("Không thể lấy khóa học:", err));
  }, []);

  // Lấy tất cả nhóm tuổi
  const allAgeGroups = getAllAgeGroups(courses);

  // Lọc theo tìm kiếm và nhóm tuổi
  const filteredCourses = courses.filter(
    (course) => {
      const matchSearch =
        course.title?.toLowerCase().includes(search.toLowerCase()) ||
        course.description?.toLowerCase().includes(search.toLowerCase());
      const matchAgeGroup =
        !ageGroupFilter ||
        (course.ageGroup &&
          course.ageGroup
            .split(",")
            .map((g) => g.trim().toLowerCase())
            .includes(ageGroupFilter.toLowerCase()));
      return matchSearch && matchAgeGroup;
    }
  );

  const totalPages = Math.ceil(filteredCourses.length / COURSES_PER_PAGE);
  const startIdx = (currentPage - 1) * COURSES_PER_PAGE;
  const currentCourses = filteredCourses.slice(startIdx, startIdx + COURSES_PER_PAGE);

  return (
    <>
      <Header />
    
      <div className="container py-5">
        <h2 className="text-center mb-5">Khóa học</h2>
        
        <div className="row g-4">
          {currentCourses.map((course) => (
            <div className="col-md-6 col-lg-4" key={course.id}>
              <div className="card h-100">
                <div className="row g-0">
                  <div className="col-md-4">
                    <img
                      src={course.image}
                      alt={course.title}
                      className="img-fluid rounded-start h-100"
                      style={{
                        color: "#004b8d",
                        fontWeight: 700,
                        fontSize: "1.6rem",
                        lineHeight: 1.2,
                      }}
                    >
                      {course.title}
                    </h3>
                    <p className="mb-2" style={{ color: "#444", fontSize: "1.05rem" }}>
                      {course.description}
                    </p>
                    <div className="mt-2 mb-3">
                      <button
                        className="btn"
                        style={{
                          border: "2px solid #004b8d",
                          color: "#004b8d",
                          fontWeight: 600,
                          borderRadius: "4px",
                          background: "#fff",
                          padding: "8px 28px",
                          fontSize: "1.1rem",
                        }}
                        onClick={() => navigate(`/Courses/lesson/${course.id}`)}
                      >
                        Bắt đầu khóa học miễn phí này{" "}
                        <i className="bi bi-arrow-right-circle" style={{ fontSize: "1.1rem" }}></i>
                      </button>
                    </div>
                    <div className="mt-2 mb-3">
                      <button
                        className="btn"
                        style={{
                          border: "2px solid #004b8d",
                          color: "#004b8d",
                          fontWeight: 600,
                          borderRadius: "4px",
                          background: "#fff",
                          padding: "8px 28px",
                          fontSize: "1.1rem",
                        }}
                        onClick={() => navigate(`/Courses/lesson/${course.id}/feedback`)}
                      >
                        Phản hồi khóa học này{" "}
                        <i className="bi bi-arrow-right-circle" style={{ fontSize: "1.1rem" }}></i>
                      </button>
                    </div>
                    <div
                      className="d-flex align-items-center gap-4 pt-3 border-top"
                      style={{ color: "#004b8d", fontSize: "1rem" }}
                    >
                      <span>
                        <i className="bi bi-person-circle me-1"></i>
                        {course.ageGroup || "Tất cả độ tuổi"} 
                      </span>
                      <span>
                        <i className="bi bi-clock me-1"></i>
                        {course.duration || "N/A"}
                      </span>
                      <span>
                        <i className="bi bi-journal-bookmark me-1"></i>
                        {course.lessons ? `${course.lessons} bài học` : "5 bài học"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        <nav className="mt-4">
          <ul className="pagination justify-content-center">
            <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
              <button
                className="page-link"
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Trước
              </button>
            </li>
            {[...Array(totalPages)].map((_, index) => (
              <li
                key={index + 1}
                className={`page-item ${currentPage === index + 1 ? 'active' : ''}`}
              >
                <button
                  className="page-link"
                  onClick={() => setCurrentPage(index + 1)}
                >
                  {index + 1}
                </button>
              </li>
            ))}
            <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
              <button
                className="page-link"
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Sau
              </button>
            </li>
          </ul>
        </nav>
      </div>

      {/* Bootstrap Icons */}
      <link
        rel="stylesheet"
        href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.1/font/bootstrap-icons.css"
      />
    </>
  );
};

export default Courses;
