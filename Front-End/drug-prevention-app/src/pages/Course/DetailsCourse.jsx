import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";

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
  const navigate = useNavigate();

  
  useEffect(() => {
    fetch("http://localhost:5002/Course")
      .then((res) => res.json())
      .then((data) => {
        const courses = Array.isArray(data) && Array.isArray(data[0]) ? data[0] : data;
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
              options: Object.entries(q.options).map(([key, value]) => `${key}. ${value}`),
              correctAnswer: q.correctAnswer,
            }))
          );
          setCurrentQuestionIndex(0);
          setShowQuiz(true);
        } else {
          setQuestions([]);
          setShowQuiz(true);
        }
      });
  };

  const handleAnswer = (option) => {
    setSelectedOption(option);
    // option là "A. ..." => lấy ký tự đầu
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
        }, 500); // slight delay after quiz ends
      }
    }, 3000);
  };

  if (!course) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-info" role="status"></div>
      </div>
    );
  }

  return (
    <div style={{ background: "#f8fafc", minHeight: "100vh" }}>
      <div className="container py-4">
        {/* Breadcrumb */}
        <nav style={{ "--bs-breadcrumb-divider": "'>'" }} aria-label="breadcrumb">
          <ol className="breadcrumb bg-transparent px-0 mb-2">
            <li className="breadcrumb-item">
              <Link to="/Courses" style={{ color: "#00838f", textDecoration: "none" }}>
                COURSES
              </Link>
            </li>
            <li className="breadcrumb-item active" aria-current="page" style={{ color: "#222", fontWeight: 600 }}>
              {course.title?.toUpperCase()}
            </li>
          </ol>
        </nav>

        {/* Title */}
        <div className="text-center mb-4">
          <div style={{ fontSize: "2rem", fontWeight: 700, color: "#00838f", fontStyle: "italic" }}>
            {course.title}
          </div>
        </div>

        {/* Video */}
        <div className="d-flex justify-content-center mb-4">
          {course.videoUrl ? (
            <div style={{ maxWidth: 700, width: "100%" }}>
              <div className="ratio ratio-16x9">
                <iframe
                  src={getEmbedUrl(course.videoUrl)}
                  title={course.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  style={{ borderRadius: "8px", border: "2px solid #b2dfdb" }}
                ></iframe>
              </div>
            </div>
          ) : (
            <div
              style={{
                width: 700,
                height: 394,
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
              Video is being updated...
            </div>
          )}
        </div>

        {/* Quiz Button */}
        {!showQuiz && !showResult && (
          <div className="d-flex justify-content-center mb-5">
            <button
              className="btn"
              style={{
                border: "2px solid #00838f",
                color: "#00838f",
                fontWeight: 600,
                borderRadius: "4px",
                background: "#fff",
                padding: "10px 48px",
                fontSize: "1.25rem",
                letterSpacing: "1px",
              }}
              onClick={fetchQuestions}
            >
              Continue <i className="bi bi-arrow-right-circle-fill ms-2"></i>
            </button>
          </div>
        )}

        {/* Quiz Section */}
        {showQuiz && questions.length > 0 && (
          <div className="text-center mb-4">
            <h4 className="mb-3">
              Question {currentQuestionIndex + 1} of {questions.length}
            </h4>
            <div className="mb-3" style={{ fontSize: "1.2rem" }}>
              {questions[currentQuestionIndex].question}
            </div>
            <div className="d-grid gap-2 col-6 mx-auto">
              {questions[currentQuestionIndex].options.map((opt, i) => (
                <button
                  key={i}
                  className="btn btn-outline-secondary"
                  onClick={() => handleAnswer(opt[0])} // opt[0] là ký tự đáp án (A/B/C/D)
                  disabled={showFeedback}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Feedback Popup */}
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
            {isCorrect ? "Correct! 🎉" : "Incorrect ❌"}
            <div className="mt-2">
              Correct answer:&nbsp;
              <b>
                {questions[currentQuestionIndex]?.options.find(
                  (opt) => opt[0] === questions[currentQuestionIndex]?.correctAnswer
                )}
              </b>
            </div>
          </div>
        )}

        {/* Result Popup */}
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
            <h4 className="mb-3">Quiz Completed</h4>
            <p style={{ fontSize: "1.25rem" }}>
              Your Score: {score} / {questions.length}
            </p>
            {score < 4 ? (
              <>
                <div className="mb-3 text-danger fw-bold">
                  Your score is below 4. Please try again!
                </div>
                <button
                  className="btn btn-warning me-2"
                  onClick={() => {
                    setShowResult(false);
                    setScore(0);
                    setCurrentQuestionIndex(0);
                    setSelectedOption(null);
                    setIsCorrect(false);
                    fetchQuestions();
                  }}
                >
                  Retry Quiz
                </button>
                <button
                  className="btn btn-secondary"
                  onClick={() => setShowResult(false)}
                >
                  Cancel
                </button>
              </>
            ) : (
              <Link to="/Courses" className="btn btn-info mt-3">
                Learn Another Course
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DetailsCourse;
