import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import NotifyLogin from "../../components/NotifyLogin/NotifyLogin";
import Header from "../../components/Header/Header";

const DetailsCourse = () => {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [showQuiz, setShowQuiz] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [showLoginPopup, setShowLoginPopup] = useState(false);
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user") || "null");

  // Kiểm tra đăng nhập
  useEffect(() => {
    if (!user || !user.id) {
      setShowLoginPopup(true);
    }
  }, []);

  // Lấy thông tin khóa học
  useEffect(() => {
    fetch("http://localhost:5002/Course")
      .then((res) => res.json())
      .then((data) => {
        const courses =
          Array.isArray(data) && Array.isArray(data[0]) ? data[0] : data;
        const found = courses.find((c) => String(c.id) === String(id));
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

  const fetchQuestions = () => {
    fetch("http://localhost:5002/CourseQuestions")
      .then((res) => res.json())
      .then((data) => {
        const found = data.find((q) => String(q.courseId) === String(id));
        if (found && Array.isArray(found.questions)) {
          setQuestions(
            found.questions.map((q) => ({
              question: q.question,
              options: Object.entries(q.options).map(
                ([key, value]) => `${key}. ${value}`
              ),
              correctAnswer: q.correctAnswer,
            }))
          );
        } else {
          setQuestions([]);
        }
        setCurrentQuestionIndex(0);
        setShowQuiz(true);
      });
  };

  const handleAnswer = (option) => {
    setSelectedOption(option);
    const answerKey = option[0];
    const correct = answerKey === questions[currentQuestionIndex].correctAnswer;
    setIsCorrect(correct);
    if (correct) setScore((prev) => prev + 1);
    setShowFeedback(true);

    setTimeout(() => {
      setShowFeedback(false);
      setSelectedOption(null);
      if (currentQuestionIndex + 1 < questions.length) {
        setCurrentQuestionIndex((prev) => prev + 1);
      } else {
        setShowQuiz(false);
        setTimeout(() => {
          setShowResult(true);
        }, 500);
      }
    }, 3000);
  };

  if (showLoginPopup) {
    return (
      <NotifyLogin
        show={showLoginPopup}
        onCancel={() => navigate("/courses")}
        message="Hãy đăng nhập để có thể học khóa học nhé!!!"
        cancelText="Hủy"
        confirmText="Tiếp tục"
        redirectTo="/login"
      />
    );
  }

  if (!user || !user.id) return null;

  if (!course) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-info" role="status"></div>
      </div>
    );
  }

  return (
    <>
      <Header />
      <div style={{ background: "#f8fafc", minHeight: "100vh" }}>
        <div className="container py-4">
         <div className="container py-4 d-flex justify-content-center">
  <div className="container py-4">
  {/* Breadcrumb */}
  <nav
    style={{ "--bs-breadcrumb-divider": "'>'" }}
    aria-label="breadcrumb"
    className="mb-3"
  >
    <ol className="breadcrumb">
      <li className="breadcrumb-item">
        <Link
          to="/Courses"
          style={{ color: "#00838f", textDecoration: "none" }}
        >
          KHÓA HỌC
        </Link>
      </li>
      <li className="breadcrumb-item active" aria-current="page">
        <strong>{course.title?.toUpperCase()}</strong>
      </li>
    </ol>
  </nav>

  {/* Tiêu đề */}
  <h2
    className="text-center mb-4"
    style={{ color: "#00838f", fontWeight: 700, fontStyle: "italic" }}
  >
    {course.title}
  </h2>

  {/* Video */}
  {course.videoUrl ? (
    <div className="mb-4 d-flex justify-content-center">
      <iframe
        src={getEmbedUrl(course.videoUrl)}
        title={course.title}
        width="100%"
        height="400"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        style={{
          borderRadius: "10px",
          border: "none", // xoá viền
          maxWidth: "100%",
        }}
      ></iframe>
    </div>
  ) : (
    <div
      className="mb-4 d-flex align-items-center justify-content-center"
      style={{
        width: "100%",
        height: 400,
        background: "#f0f0f0",
        borderRadius: "10px",
        color: "#888",
        fontSize: "1.2rem",
      }}
    >
      Video đang được cập nhật...
    </div>
  )}

  {/* Nút làm bài kiểm tra */}
  {!showQuiz && !showResult && (
    <div className="text-center">
      <button
        className="btn"
        style={{
          border: "2px solid #00838f",
          color: "#00838f",
          fontWeight: 600,
          borderRadius: "6px",
          background: "#fff",
          padding: "10px 48px",
          fontSize: "1.25rem",
          letterSpacing: "1px",
        }}
        onClick={fetchQuestions}
      >
        Tiếp tục <i className="bi bi-arrow-right-circle-fill ms-2"></i>
      </button>
    </div>
  )}
  </div>
  {/* Quiz */}
  {showQuiz && questions.length > 0 && (
    <div className="mt-4 text-center">
      <h5 className="mb-3">
        Câu {currentQuestionIndex + 1} / {questions.length}
      </h5>
      <p style={{ fontSize: "1.1rem", fontWeight: "500" }}>
        {questions[currentQuestionIndex].question}
      </p>
      <div className="d-grid gap-2 col-8 col-md-6 mx-auto mt-3">
        {questions[currentQuestionIndex].options.map((opt, i) => (
          <button
            key={i}
            className="btn btn-outline-secondary"
            onClick={() => handleAnswer(opt)}
            disabled={showFeedback}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  )}
</div>


          {/* Phản hồi đúng/sai + progress */}
          {showFeedback && (
            <div
              className="position-fixed top-0 start-50 translate-middle-x mt-5 alert"
              style={{
                zIndex: 9999,
                background: isCorrect ? "#d0f0c0" : "#ffcdd2",
                color: "#222",
                padding: "20px",
                borderRadius: "8px",
                border: "1px solid #888",
                minWidth: "300px",
                textAlign: "center",
              }}
            >
              {isCorrect ? "Chính xác! 🎉" : "Sai ❌"}
              <div className="mt-2">
                Đáp án đúng:&nbsp;
                <b>
                  {questions[currentQuestionIndex]?.options.find(
                    (opt) =>
                      opt[0] === questions[currentQuestionIndex]?.correctAnswer
                  )}
                </b>
              </div>
              <div className="progress mt-3" style={{ height: "5px" }}>
                <div
                  className="progress-bar progress-bar-striped progress-bar-animated bg-info"
                  role="progressbar"
                  style={{ width: "100%" }}
                ></div>
              </div>
            </div>
          )}

          {/* Kết quả kiểm tra */}
          {showResult && (
            <div
              className="position-fixed top-50 start-50 translate-middle alert"
              style={{
                zIndex: 9999,
                background: "#ffffff",
                color: "#333",
                padding: "30px",
                borderRadius: "10px",
                border: "2px solid #00838f",
                textAlign: "center",
                width: "400px",
              }}
            >
              <h4 className="mb-3">Hoàn thành bài kiểm tra</h4>
              <p style={{ fontSize: "1.25rem" }}>
                Điểm của bạn: {score} / {questions.length}
              </p>
              {score < 4 ? (
                <>
                  <div className="mb-3 text-danger fw-bold">
                    Điểm dưới 4. Vui lòng làm lại bài kiểm tra!
                  </div>
                  <button
                    className="btn btn-warning me-2"
                    onClick={() => {
                      setShowResult(false);
                      setScore(0);
                      setCurrentQuestionIndex(0);
                      setSelectedOption(null);
                      setIsCorrect(false);
                      setShowFeedback(false);
                      fetchQuestions();
                    }}
                  >
                    Làm lại
                  </button>
                  <button
                    className="btn btn-secondary"
                    onClick={() => setShowResult(false)}
                  >
                    Hủy
                  </button>
                </>
              ) : (
                <Link to="/Courses" className="btn btn-info mt-3">
                  Học khóa khác
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default DetailsCourse;
