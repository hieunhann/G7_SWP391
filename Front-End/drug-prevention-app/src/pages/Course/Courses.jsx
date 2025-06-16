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
                        objectFit: 'cover',
                        border: '1px solid var(--primary-color)',
                      }}
                    />
                  </div>
                  <div className="col-md-8">
                    <div className="card-body d-flex flex-column h-100">
                      <h5 className="card-title">{course.title}</h5>
                      <p className="card-text flex-grow-1">{course.description}</p>
                      <div className="d-flex justify-content-between align-items-center mt-3">
                        <span className="badge bg-primary">#{course.id}</span>
                        <button className="btn btn-primary">
                          Xem chi tiết
                        </button>
                      </div>
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
