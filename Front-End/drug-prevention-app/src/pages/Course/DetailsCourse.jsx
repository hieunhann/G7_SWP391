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
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showQuiz, setShowQuiz] = useState(false);
  const [result, setResult] = useState(null);

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

  const fetchQuestions = async () => {
    try {
      const res = await api.get(`/online-courses/${id}/questions`);
      const questionList = Array.isArray(res.data) ? res.data : res.data.data;
      setQuestions(questionList.slice(0, 5));
      setShowQuiz(true);
    } catch (error) {
      console.error("Lỗi khi lấy câu hỏi:", error);
    }
  };

  const handleSelectAnswer = (questionId, selectedAnswerId) => {
    setAnswers((prev) => ({ ...prev, [questionId]: selectedAnswerId }));
  };

  const handleSubmit = async () => {
    const submissions = Object.entries(answers).map(
      ([questionId, selectedAnswerId]) => ({
        questionId: parseInt(questionId, 10),
        selectedAnswerId: parseInt(selectedAnswerId, 10), // ← cần parse thêm dòng này
      })
    );

    console.log("📤 Submissions gửi đi:", submissions);

    try {
      const res = await api.post(
        `/online-courses/${id}/submit-answers`,
        submissions
      );
      console.log("✅ Kết quả:", res.data.data);
      setResult(res.data.data);
    } catch (err) {
      console.error("❌ Lỗi khi nộp bài:", err);
      console.error("📨 Phản hồi:", err.response?.data.data || err.message);
      alert("Có lỗi xảy ra khi nộp bài. Vui lòng thử lại.");
    }
  };

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

          {!showQuiz && !result && (
            <div className="text-center mt-6">
              <button
                onClick={fetchQuestions}
                className="bg-teal-600 hover:bg-teal-700 text-white font-semibold py-2 px-6 rounded-xl transition duration-300 shadow-md"
              >
                Tiếp tục học
              </button>
            </div>
          )}

          {showQuiz && questions.length > 0 && !result && (
            <div className="mt-10 bg-white p-6 rounded-xl shadow-lg">
              <h3 className="text-xl font-semibold mb-4">
                Câu {currentIndex + 1} / {questions.length}
              </h3>
              <p className="mb-4">{questions[currentIndex].questionText}</p>
              <div className="space-y-2">
                {questions[currentIndex].answers.map((ans) => {
                  const isSelected =
                    answers[questions[currentIndex].id] === ans.id;
                  return (
                    <div
                      key={ans.id}
                      onClick={() =>
                        handleSelectAnswer(questions[currentIndex].id, ans.id)
                      }
                      className={`flex items-start p-4 border rounded-lg transition-all duration-200 cursor-pointer ${
                        isSelected
                          ? "bg-teal-100 border-teal-500 shadow"
                          : "bg-white hover:bg-gray-50"
                      }`}
                    >
                      <input
                        type="radio"
                        name={`q-${questions[currentIndex].id}`}
                        value={ans.id}
                        checked={isSelected}
                        onChange={() =>
                          handleSelectAnswer(questions[currentIndex].id, ans.id)
                        }
                        className="mt-1 mr-3 accent-teal-600"
                      />
                      <span className="text-gray-800">{ans.answerText}</span>
                    </div>
                  );
                })}
              </div>

              <div className="mt-6 text-right">
                {currentIndex < questions.length - 1 ? (
                  <button
                    onClick={() => setCurrentIndex((prev) => prev + 1)}
                    className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg"
                  >
                    Tiếp theo
                  </button>
                ) : (
                  <button
                    onClick={handleSubmit}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
                  >
                    Nộp bài
                  </button>
                )}
              </div>
            </div>
          )}

          {result && (
            <div
              className={`mt-10 p-6 rounded-lg text-center ${
                result.passed
                  ? "bg-green-100 border border-green-300"
                  : "bg-red-100 border border-red-300"
              }`}
            >
              <h3
                className={`text-2xl font-bold mb-3 ${
                  result.passed ? "text-green-800" : "text-red-800"
                }`}
              >
                {result.passed
                  ? "🎉 Bạn đã vượt qua!"
                  : "❌ Bạn chưa đạt yêu cầu"}
              </h3>
              <p
                className={`text-lg ${
                  result.passed ? "text-green-700" : "text-red-700"
                }`}
              >
                Điểm: {result.correct} / {result.total}
              </p>

              {result.passed ? (
                <button
                  onClick={() => navigate("/courses")}
                  className="mt-4 bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg"
                >
                  Quay về danh sách khóa học
                </button>
              ) : (
                <button
                  onClick={() => {
                    setResult(null);
                    setAnswers({});
                    setCurrentIndex(0);
                    fetchQuestions();
                  }}
                  className="mt-4 bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg"
                >
                  Làm lại
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default DetailsCourse;
