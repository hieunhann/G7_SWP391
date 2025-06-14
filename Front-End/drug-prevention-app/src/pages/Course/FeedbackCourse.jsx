import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Header from "../../components/PageHeader/Header";
import NotifyLogin from "../../components/NotifyLogin/NotifyLogin";

const FEEDBACKS_PER_PAGE = 3;

const FeedbackCourse = () => {
  const { id } = useParams();
  const courseId = id;
  const [course, setCourse] = useState({});
  const [feedbacks, setFeedbacks] = useState([]);
  const [users, setUsers] = useState([]);
  const [comment, setComment] = useState("");
  const [rating, setRating] = useState(5);
  const [submitting, setSubmitting] = useState(false);
  const [showLoginPopup, setShowLoginPopup] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const currentUser = JSON.parse(localStorage.getItem("user") || "null");

  // Lấy thông tin khóa học bằng cách fetch toàn bộ rồi tìm theo id
  useEffect(() => {
    fetch("http://localhost:5002/Course")
      .then((res) => res.json())
      .then((data) => {
        const courses = Array.isArray(data) && Array.isArray(data[0]) ? data[0] : data;
        const found = courses.find((c) => String(c.id) === String(id));
        setCourse(found || {});
      });
  }, [id]);

  // Lấy feedback và user
  useEffect(() => {
    if (!courseId) return;
    fetch("http://localhost:5002/feedbackCourse")
      .then((res) => res.json())
      .then((data) => {
        setFeedbacks(
          Array.isArray(data)
            ? data.filter((f) => String(f.courseId) === String(courseId))
            : []
        );
      });

    fetch("http://localhost:5002/User")
      .then((res) => res.json())
      .then((data) => {
        setUsers(Array.isArray(data) ? data : []);
      });
  }, [courseId, submitting]);

  const getUserName = (userId) => {
    const user = users.find((u) => String(u.id) === String(userId));
    return user ? user.fullName : "Người dùng ẩn danh";
  };

  const renderUserAvatar = (userId) => {
    const user = users.find((u) => String(u.id) === String(userId));
    if (user && user.avatar && user.avatar !== "/avatars/default.jpg") {
      return (
        <img
          src={user.avatar}
          alt={user.fullName || "avatar"}
          style={{
            width: 56,
            height: 56,
            borderRadius: "50%",
            objectFit: "cover",
            border: "2px solid #00838f",
            boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
            background: "#fff",
          }}
        />
      );
    }
    const firstChar =
      user && user.fullName ? user.fullName.charAt(0).toUpperCase() : "U";
    return (
      <div
        className="rounded-circle d-flex align-items-center justify-content-center"
        style={{
          width: 56,
          height: 56,
          background: "linear-gradient(135deg, #b2dfdb 0%, #e3e6ea 100%)",
          color: "#00838f",
          fontSize: 28,
          fontWeight: "bold",
          userSelect: "none",
          border: "2px solid #00838f",
          boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
        }}
      >
        {firstChar}
      </div>
    );
  };

  // Xử lý gửi đánh giá
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser) {
      setShowLoginPopup(true);
      return;
    }
    if (!comment.trim()) return;
    setSubmitting(true);

    const newFeedback = {
      id: Date.now().toString(),
      courseId: Number(courseId),
      userId: String(currentUser.id),
      rating,
      comment: comment.trim(),
    };

    await fetch("http://localhost:5002/feedbackCourse", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newFeedback),
    });

    setComment("");
    setRating(5);
    setSubmitting(false);
    setCurrentPage(1);
  };

  // Pagination
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
          {/* Breadcrumb */}
          <nav style={{ "--bs-breadcrumb-divider": "'>'" }} aria-label="breadcrumb">
            <ol className="breadcrumb bg-transparent px-0 mb-2">
              <li className="breadcrumb-item">
                <Link to="/Courses" style={{ color: "#00838f", textDecoration: "none" }}>
                  Khóa học
                </Link>
              </li>
              <li className="breadcrumb-item active" aria-current="page" style={{ color: "#222", fontWeight: 600 }}>
                {course?.title} - Feedback
              </li>
            </ol>
          </nav>

          {/* Trang trí hình ảnh và tiêu đề khóa học */}
          {course?.image && (
            <div className="mb-4 text-center">
              <div
                style={{
                  display: "inline-block",
                  padding: 8,
                  borderRadius: 8,
                  background: "linear-gradient(135deg, #e3f2fd 0%, #b2dfdb 100%)",
                  boxShadow: "0 6px 24px 0 rgba(0,75,141,0.10)",
                  position: "relative",
                }}
              >
                <img
                  src={course.image}
                  alt={course.title || "Course"}
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
                  onMouseOver={(e) => (e.currentTarget.style.transform = "scale(1.06)")}
                  onMouseOut={(e) => (e.currentTarget.style.transform = "scale(1)")}
                />
                
              </div>
              <div
                style={{
                  fontWeight: 800,
                  fontSize: "1.5rem",
                  color: "#00838f",
                  marginTop: 18,
                  letterSpacing: 1,
                  textShadow: "0 2px 8px #e0f7fa",
                }}
              >
                {course.title}
              </div>
              <span className="badge bg-info text-white" style={{ fontSize: "1rem", marginTop: 8 }}>
                {feedbacks.length} đánh giá
              </span>
            </div>
          )}
       
          {/* Danh sách feedback */}
          <div>
            {feedbacks.length === 0 ? (
              <div className="text-muted text-center py-5" style={{ fontSize: "1.1rem" }}>
                <i className="bi bi-chat-left-dots" style={{ fontSize: 40, color: "#bdbdbd" }}></i>
                <div className="mt-2">Chưa có đánh giá nào cho khóa học này.</div>
              </div>
            ) : (
              <>
                <div className="d-flex flex-column gap-4">
                  {pagedFeedbacks.map((fb) => (
                    <div
                      key={fb.id}
                      className="p-3 px-md-4 border rounded bg-white d-flex align-items-center gap-3 shadow-sm"
                      style={{
                        transition: "box-shadow 0.2s",
                        borderLeft: "6px solid #00bcd4",
                        boxShadow: "0 2px 8px rgba(0,188,212,0.08)",
                      }}
                    >
                      {renderUserAvatar(fb.userId)}
                      <div style={{ flex: 1 }}>
                        <div className="fw-bold" style={{ color: "#00838f", fontSize: "1.1rem" }}>
                          {getUserName(fb.userId)}
                        </div>
                        <div className="mb-1">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <span
                              key={i}
                              style={{
                                color: i < fb.rating ? "#ffc107" : "#e4e5e9",
                                fontSize: "1.2rem",
                                marginRight: 2,
                            }}
                          >
                            ★
                          </span>
                        ))}
                        </div>
                        <div style={{ fontSize: "1.05rem", color: "#333" }}>{fb.comment}</div>
                      </div>
                    </div>
                  ))}
                </div>
                {/* Pagination controls */}
                {totalPages > 1 && (
                  <nav className="mt-4 d-flex justify-content-center">
                    <ul className="pagination mb-0">
                      <li className={`page-item${currentPage === 1 ? " disabled" : ""}`}>
                        <button
                          className="page-link"
                          style={{ color: "#00838f", fontWeight: 600, borderRadius: 8 }}
                          onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        >
                          &laquo;
                        </button>
                      </li>
                      {Array.from({ length: totalPages }).map((_, idx) => (
                        <li
                          key={idx}
                          className={`page-item${currentPage === idx + 1 ? " active" : ""}`}
                        >
                          <button
                            className="page-link"
                            style={{
                              color: currentPage === idx + 1 ? "#fff" : "#00838f",
                              background: currentPage === idx + 1 ? "#00bcd4" : "#fff",
                              fontWeight: 600,
                              borderRadius: 8,
                              border: "1px solid #00bcd4"
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
                          style={{ color: "#00838f", fontWeight: 600, borderRadius: 8 }}
                          onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                        >
                          &raquo;
                        </button>
                      </li>
                    </ul>
                  </nav>
                )}
              </>
            )}
          </div>

          {/* Form đánh giá */}
          <div className="mb-5 mt-5">
            <form
              className="p-4 border rounded bg-white shadow-sm"
              onSubmit={handleSubmit}
              style={{ maxWidth: 600, margin: "0 auto" }}
            >
              <div className="mb-3 d-flex align-items-center gap-3">
                {currentUser ? renderUserAvatar(currentUser.id) : null}
                <div>
                  <div className="fw-bold" style={{ color: "#00838f" }}>
                    {currentUser ? getUserName(currentUser.id) : "Bạn chưa đăng nhập"}
                  </div>
                  <div>
                    {Array.from({ length: 5 }).map((_, i) => (
                      <span
                        key={i}
                        style={{
                          color: i < rating ? "#ffc107" : "#e4e5e9",
                          fontSize: "1.3rem",
                          cursor: currentUser ? "pointer" : "not-allowed",
                          transition: "color 0.2s"
                        }}
                        onClick={() => currentUser && setRating(i + 1)}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <textarea
                className="form-control mb-3"
                rows={3}
                placeholder={
                  currentUser
                    ? "Nhập đánh giá của bạn..."
                    : "Bạn cần đăng nhập để bình luận"
                }
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                required
                disabled={!currentUser || submitting}
                style={{ resize: "none", borderRadius: 10, borderColor: "#b2dfdb" }}
              />
              <div className="text-end">
                <button
                  type="submit"
                  className="btn btn-info px-4"
                  disabled={!currentUser || submitting || !comment.trim()}
                  style={{
                    background: "#00bcd4",
                    border: "none",
                    fontWeight: 700,
                    borderRadius: 8
                  }}
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