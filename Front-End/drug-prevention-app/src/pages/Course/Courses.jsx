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
  const [ageGroupFilter, setAgeGroupFilter] = useState(""); // Thêm state cho bộ lọc

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
    
      <div className="container py-4">
        <h2 className="text-center mb-4" style={{ color: "#004b8d", fontWeight: 700 }}>
          Khóa học phòng chống ma túy
        </h2>

        {/* Thanh tìm kiếm và bộ lọc nhóm tuổi */}
        <div className="mb-4 d-flex flex-wrap justify-content-center gap-3">
          <input
            type="text"
            className="form-control"
            style={{ maxWidth: 400, borderColor: "#004b8d" }}
            placeholder="Tìm kiếm khóa học..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1); // Đặt lại về trang 1 khi tìm kiếm
            }}
          />
          <select
            className="form-select"
            style={{ maxWidth: 220, borderColor: "#004b8d" }}
            value={ageGroupFilter}
            onChange={(e) => {
              setAgeGroupFilter(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="">Tất cả nhóm tuổi</option>
            {allAgeGroups.map((group) => (
              <option key={group} value={group}>
                {group}
              </option>
            ))}
          </select>
        </div>

        <div className="d-flex flex-column gap-4">
          {currentCourses.map((course) => (
            <div
              className="card p-3"
              key={course.id}
              style={{
                border: "1.5px solid #b2dfdb",
                borderRadius: "8px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.07)",
              }}
            >
              <div className="row g-0 align-items-center">
                <div className="col-md-3 d-flex justify-content-center">
                  <img
                    src={course.image}
                    alt={course.title}
                    className="img-fluid"
                    style={{
                      maxWidth: 180,
                      minWidth: 140,
                      height: 120,
                      objectFit: "cover",
                      borderRadius: "4px",
                      border: "1.5px solid #004b8d",
                      background: "#fff",
                    }}
                  />
                </div>
                <div className="col-md-9">
                  <div className="card-body ps-md-4 d-flex flex-column h-100">
                    <h3
                      className="mb-2"
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

        {/* Phân trang */}
        <nav className="mt-4 d-flex justify-content-center">
          <ul className="pagination">
            <li className={`page-item${currentPage === 1 ? " disabled" : ""}`}>
              <button
                className="page-link"
                style={{ color: "#004b8d" }}
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Trang trước
              </button>
            </li>
            {[...Array(totalPages)].map((_, idx) => (
              <li
                key={idx}
                className={`page-item${currentPage === idx + 1 ? " active" : ""}`}
              >
                <button
                  className="page-link"
                  style={{
                    color: currentPage === idx + 1 ? "#fff" : "#004b8d",
                    background: currentPage === idx + 1 ? "#004b8d" : "#fff",
                    borderColor: "#004b8d",
                  }}
                  onClick={() => setCurrentPage(idx + 1)}
                >
                  {idx + 1}
                </button>
              </li>
            ))}
            <li className={`page-item${currentPage === totalPages ? " disabled" : ""}`}>
              <button
                className="page-link"
                style={{ color: "#004b8d" }}
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Trang sau
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
