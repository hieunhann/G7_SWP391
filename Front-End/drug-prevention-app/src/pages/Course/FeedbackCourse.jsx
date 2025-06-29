import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../../Axios/Axios";
import Header from "../../components/Header/Header";
import NotifyLogin from "../../components/NotifyLogin/NotifyLogin";

const FEEDBACKS_PER_PAGE = 3;
const ICON_COLOR = "#004b8d";

const FeedbackCourse = () => {
  const { id } = useParams();
  const courseId = id;
  const [course, setCourse] = useState({});
  const [feedbacks, setFeedbacks] = useState([]);
  const [comment, setComment] = useState("");
  const [rating, setRating] = useState(5);
  const [submitting, setSubmitting] = useState(false);
  const [showLoginPopup, setShowLoginPopup] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const currentUser = JSON.parse(localStorage.getItem("user") || "null");

  useEffect(() => {
    api
      .get("/course/getAllCourse")
      .then((res) => {
        const found = res.data.data.find(
          (c) => String(c.id) === String(courseId)
        );
        setCourse(found || {});
      })
      .catch(console.error);
  }, [courseId]);

  useEffect(() => {
    api.get("/feedback/getAllFeedback").then((res) => {
      setFeedbacks(
        res.data.data.filter((fb) => String(fb.course?.id) === String(courseId))
      );
    });
  }, [courseId, submitting]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser) {
      setShowLoginPopup(true);
      return;
    }
    if (!comment.trim()) return;

    setSubmitting(true);
    const feedback = {
      courseId: Number(courseId),
      memberId: Number(currentUser.id),
      rate: rating,
      comment: comment.trim(),
    };

    try {
      await api.post("/feedback/create", feedback);
      setComment("");
      setRating(5);
      setCurrentPage(1);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const totalPages = Math.ceil(feedbacks.length / FEEDBACKS_PER_PAGE);
  const pagedFeedbacks = feedbacks.slice(
    (currentPage - 1) * FEEDBACKS_PER_PAGE,
    currentPage * FEEDBACKS_PER_PAGE
  );

  return (
    <>
      <Header />
      <div style={{ background: "#f8fafc", minHeight: "100vh" }}>
        <div className="container py-4">
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb bg-transparent px-0 mb-2">
              <li className="breadcrumb-item">
                <Link
                  to="/Courses"
                  className="text-decoration-none"
                  style={{ color: ICON_COLOR }}
                >
                  KHÓA HỌC
                </Link>
              </li>
              <li
                className="breadcrumb-item active"
                aria-current="page"
                style={{ fontWeight: 600 }}
              >
                {course?.name} - Feedback
              </li>
            </ol>
          </nav>
          {course?.image && (
            <div className="mb-4 d-flex flex-column align-items-center text-center">
              {/* Tên khóa học */}
              <div
                style={{
                  fontWeight: 800,
                  fontSize: "1.5rem",
                  color: "#00838f",
                  marginBottom: 18,
                  letterSpacing: 1,
                  textShadow: "0 2px 8px #e0f7fa",
                }}
              >
                {course.name}
              </div>

              {/* Ảnh khóa học */}
              <div
                style={{
                  padding: 8,
                  borderRadius: 8,
                  background:
                    "linear-gradient(135deg, #e3f2fd 0%, #b2dfdb 100%)",
                  boxShadow: "0 6px 24px 0 rgba(0,75,141,0.10)",
                }}
              >
                <img
                  src={course.image}
                  alt={course.name || "Course"}
                  style={{
                    maxWidth: 180,
                    minWidth: 140,
                    height: 120,
                    objectFit: "cover",
                    borderRadius: 4,
                    border: "1.5px solid rgb(0, 75, 141)",
                    background: "#fff",
                    transition: "transform 0.3s",
                  }}
                  onMouseOver={(e) =>
                    (e.currentTarget.style.transform = "scale(1.06)")
                  }
                  onMouseOut={(e) =>
                    (e.currentTarget.style.transform = "scale(1)")
                  }
                />
              </div>

              {/* Số lượng đánh giá */}
              <span
                className="badge bg-info text-white"
                style={{
                  fontSize: "1rem",
                  marginTop: 12,
                }}
              >
                {feedbacks.length} đánh giá
              </span>
            </div>
          )}

          <div>
            {feedbacks.length === 0 ? (
              <div className="text-center text-muted">
                Chưa có đánh giá nào.
              </div>
            ) : (
              <div className="d-flex flex-column gap-3">
                {pagedFeedbacks.map((fb) => (
                  <div
                    key={fb.id}
                    className="p-3 border rounded bg-white shadow-sm"
                    style={{
                      borderLeft: "5px solid #004b8d",
                      display: "flex",
                      gap: "1.5rem",
                      alignItems: "flex-start",
                    }}
                  >
                    {/* Avatar */}
                    <div
                      style={{
                        width: 80,
                        height: 80,
                        borderRadius: "50%",
                        backgroundColor: "#e3e6ea",
                        color: "#004b8d",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: "bold",
                        fontSize: "2rem",
                        border: "2px solid #00838f", // viền màu
                        boxShadow: "0 2px 6px rgba(0,0,0,0.08)", // đổ bóng nhẹ
                        flexShrink: 0,
                      }}
                    >
                      {fb.member?.firstName?.charAt(0).toUpperCase() || "?"}
                    </div>

                    {/* Nội dung */}
                    <div style={{ flex: 1 }}>
                      <div
                        className="fw-bold"
                        style={{
                          color: "#004b8d",
                          fontSize: "1.5rem",
                          marginBottom: 4,
                        }}
                      >
                        {fb.member
                          ? `${fb.member.lastName} ${fb.member.firstName}`
                          : "Người dùng ẩn danh"}
                      </div>

                      <div className="mb-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <span
                            key={i}
                            style={{
                              color: i < fb.rate ? "#ffc107" : "#e4e5e9",
                              fontSize: "1.5rem", // tăng kích thước ngôi sao
                              marginRight: 3,
                            }}
                          >
                            ★
                          </span>
                        ))}
                      </div>

                      <div
                        style={{
                          color: "#333",
                          fontSize: "1.5rem",
                          lineHeight: 1.6,
                          whiteSpace: "pre-wrap",
                        }}
                      >
                        {fb.comment}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {totalPages > 1 && (
              <nav className="mt-4 d-flex justify-content-center">
                <ul className="pagination mb-0">
                  <li
                    className={`page-item${
                      currentPage === 1 ? " disabled" : ""
                    }`}
                  >
                    <button
                      className="page-link"
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    >
                      &laquo;
                    </button>
                  </li>
                  {Array.from({ length: totalPages }).map((_, idx) => (
                    <li
                      key={idx}
                      className={`page-item${
                        currentPage === idx + 1 ? " active" : ""
                      }`}
                    >
                      <button
                        className="page-link"
                        onClick={() => setCurrentPage(idx + 1)}
                      >
                        {idx + 1}
                      </button>
                    </li>
                  ))}
                  <li
                    className={`page-item${
                      currentPage === totalPages ? " disabled" : ""
                    }`}
                  >
                    <button
                      className="page-link"
                      onClick={() =>
                        setCurrentPage((p) => Math.min(totalPages, p + 1))
                      }
                    >
                      &raquo;
                    </button>
                  </li>
                </ul>
              </nav>
            )}
          </div>

          <div className="mt-5 mb-4">
            <form
              onSubmit={handleSubmit}
              className="p-4 border rounded bg-white shadow-sm"
              style={{ maxWidth: 600, margin: "0 auto" }}
            >
              <div className="mb-3">
                <label className="form-label fw-bold">Đánh giá của bạn:</label>
                <div>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span
                      key={i}
                      style={{
                        color: i < rating ? "#ffc107" : "#e4e5e9",
                        fontSize: "1.5rem",
                        cursor: "pointer",
                      }}
                      onClick={() => setRating(i + 1)}
                    >
                      ★
                    </span>
                  ))}
                </div>
              </div>
              <textarea
                className="form-control mb-3"
                rows="3"
                placeholder="Nhập nhận xét..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                disabled={!currentUser || submitting}
              />
              <div className="text-end">
                <button
                  type="submit"
                  className="btn btn-outline-primary"
                  disabled={!currentUser || submitting || !comment.trim()}
                >
                  {submitting ? "Đang gửi..." : "Gửi đánh giá"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <NotifyLogin
        show={showLoginPopup}
        onCancel={() => setShowLoginPopup(false)}
        message="Bạn cần đăng nhập để bình luận!"
        cancelText="Đóng"
        confirmText="Đăng nhập"
        redirectTo="/login"
      />
    </>
  );
};

export default FeedbackCourse;
