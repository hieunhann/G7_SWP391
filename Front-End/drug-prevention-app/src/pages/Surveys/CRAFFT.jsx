import React, { useState, useEffect, useMemo } from "react";
import "./CRAFFT.css";
import Header from "../../components/Header/Header";
import { useNavigate } from "react-router-dom";
import api from "../../Axios/Axios";

const CRAFFT = () => {
  const [crafftQuestions, setCrafftQuestions] = useState([]);
  const [crafftChoices, setCrafftChoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); // Vẫn dùng cho lỗi tải dữ liệu/API chung
  const [partAChoices, setPartAChoices] = useState({});
  const [partBChoices, setPartBChoices] = useState({});
  const [showResultPopup, setShowResultPopup] = useState(false);
  const [resultScore, setResultScore] = useState(0);
  const [resultRiskLevel, setResultRiskLevel] = useState("Không xác định");
  const [resultRecommendation, setResultRecommendation] = useState(
    "Không có khuyến nghị."
  );
  const [showFullPartB, setShowFullPartB] = useState(false);
  const [focusedInputId, setFocusedInputId] = useState(null);
  // NEW STATE: Lưu trữ ID của các câu hỏi Phần B chưa được trả lời
  const [unansweredPartBQuestions, setUnansweredPartBQuestions] = useState([]);

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const userId = user.id;

  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [questionsRes, choicesRes] = await Promise.all([
          api.get("/findAllCrafftQuestions"),
          api.get("/getCrafftTestChoice"),
        ]);

        const questions = questionsRes.data?.data || [];
        const choices = choicesRes.data?.data || [];

        const filteredQuestions = questions.filter(
          (q) => q.categoryId === 1 || q.category?.id === 1
        );

        const seen = new Set();
        const filteredChoices = choices.filter((c) => {
          const qOrder = c.testQuestion?.questionOrder;
          const isValid = qOrder >= 4 && qOrder <= 9;
          const isDuplicate = seen.has(`${qOrder}-${c.choiceText}`);
          if (isValid && !isDuplicate) {
            seen.add(`${qOrder}-${c.choiceText}`);
            return true;
          }
          return false;
        });

        const initPartA = {},
          initPartB = {};
        filteredQuestions.forEach((q) => {
          if (q.questionOrder <= 3) initPartA[q.id] = "0";
          else initPartB[q.id] = null;
        });

        setCrafftQuestions(filteredQuestions);
        setCrafftChoices(filteredChoices);
        setPartAChoices(initPartA);
        setPartBChoices(initPartB);
      } catch (err) {
        setError("Không thể tải dữ liệu.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const totalPartADays = useMemo(() => {
    return Object.values(partAChoices).reduce(
      (sum, val) => sum + (parseInt(val) || 0),
      0
    );
  }, [partAChoices]);

  useEffect(() => {
    setShowFullPartB(totalPartADays > 0);
    if (totalPartADays === 0) {
      const resetB = {};
      crafftQuestions.forEach((q) => {
        if (q.questionOrder >= 4) resetB[q.id] = null;
      });
      setPartBChoices(resetB);
      // Khi Phần A về 0, reset lỗi của Phần B
      setUnansweredPartBQuestions([]);
    }
  }, [totalPartADays, crafftQuestions]);

  const handlePartAChoice = (id, val) => {
    if (/^\d*$/.test(val)) {
      setPartAChoices((prev) => ({ ...prev, [id]: val }));
    }
  };

  const handlePartABlur = (id) => {
    setFocusedInputId(null);
    setPartAChoices((prev) => ({
      ...prev,
      [id]: prev[id] === "" ? "0" : prev[id],
    }));
  };

  const handlePartAFocus = (id) => {
    setFocusedInputId(id);
    setPartAChoices((prev) => ({
      ...prev,
      [id]: prev[id] === "0" ? "" : prev[id],
    }));
  };

  const handlePartBChoice = (id, score) => {
    setPartBChoices((prev) => ({ ...prev, [id]: score }));
    // Khi người dùng chọn câu trả lời, xóa lỗi cho câu hỏi đó (nếu có)
    setUnansweredPartBQuestions((prev) => prev.filter((qId) => qId !== id));
  };

  const handleSuggestionClick = () => {
    setShowResultPopup(false);
    switch (resultRiskLevel) {
      case "Thấp":
        navigate("/ViewCommunicationPrograms");
        break;
      case "Trung bình":
        navigate("/Courses");
        break;
      case "Cao":
        navigate("/booking");
        break;
      default:
        navigate("/");
    }
  };

  const handleSubmit = async () => {
    // Luôn reset các lỗi hiển thị trên form khi bắt đầu submit
    setError(null); // Reset lỗi chung (tải dữ liệu/API)
    setUnansweredPartBQuestions([]); // Reset lỗi của từng câu hỏi Phần B

    const allZero = Object.values(partAChoices).every(
      (val) => val === "0" || val === 0
    );

    let foundUnansweredInPartB = [];
    // Kiểm tra Part B nếu tổng số ngày ở Phần A lớn hơn 0
    // Sử dụng totalPartADays trực tiếp để đảm bảo giá trị luôn cập nhật
    if (totalPartADays > 0) { // <--- Đã thay đổi ở đây để khắc phục lỗi nhấn 2 lần
        crafftQuestions
          .filter((q) => q.questionOrder >= 4) // Lọc ra chỉ các câu hỏi Phần B
          .forEach((q) => {
            if (partBChoices[q.id] === null || partBChoices[q.id] === undefined) {
              foundUnansweredInPartB.push(q.id);
            }
          });
    }

    // Cập nhật state với danh sách các câu hỏi chưa trả lời
    setUnansweredPartBQuestions(foundUnansweredInPartB);

    if (foundUnansweredInPartB.length > 0) {
      // Nếu có câu hỏi chưa trả lời ở Phần B, dừng quá trình submit
      return;
    }

    // --- Xử lý trường hợp không sử dụng chất nào ---
    if (allZero) {
      setResultScore(0);
      setResultRiskLevel("Thấp");
      setResultRecommendation(
        "Hãy tham gia các chương trình cộng đồng để nâng cao nhận thức về phòng chống ma túy."
      );
      setShowResultPopup(true);
      return;
    }

    // --- Xây dựng payload ---
    const answers = [];
    Object.entries(partAChoices).forEach(([id, val]) => {
      answers.push({ questionId: parseInt(id), choiceText: val.toString() });
    });

    Object.entries(partBChoices).forEach(([id, score]) => {
      // Chỉ thêm câu trả lời phần B nếu đã được chọn (và không null)
      if (score !== null && score !== undefined) {
        const choiceObj = crafftChoices.find(
          (c) => c.testQuestion?.id === parseInt(id) && c.score === score
        );
        answers.push({
          questionId: parseInt(id),
          choiceText: choiceObj?.choiceText || "",
        });
      }
    });

    const payload = {
      memberId: userId,
      testId: 1, // ID của bài test CRAFFT
      answers,
    };

    const fetchSurveys = async () => {
      const response = await api.get("/api/v1/test/findAll");
      // setSurveys(response.data); // đảm bảo bạn có state `surveys` nếu muốn dùng
    };
    fetchSurveys();

    // --- Gửi yêu cầu và xử lý kết quả ---
    try {
      setLoading(true);

      const response = await api.post("/testResult/countCrafftTest/", payload);

      const resultData = response.data?.data;

      if (
        !resultData ||
        resultData.score === undefined ||
        !resultData.riskLevel ||
        !resultData.recommendations
      ) {
        throw new Error("Phản hồi từ API không chứa đủ dữ liệu kết quả.");
      }

      setResultScore(resultData.score);
      setResultRiskLevel(resultData.riskLevel);
      setResultRecommendation(resultData.recommendations);
      setShowResultPopup(true);
    } catch (err) {
      console.error("Lỗi khi gửi bài kiểm tra:", err);
      setError("Không thể xử lý kết quả. Vui lòng thử lại."); // Lỗi API/mạng
    } finally {
      setLoading(false);
    }
  };

  return (
        <>
      <Header />
    <div className="test-wrapper">
       <h1 className="test-title">
            Bài Kiểm Tra CRAFFT (Phiên bản 2.1)
          </h1>
      {loading && <p>Đang tải dữ liệu...</p>}
      {/* Thông báo lỗi chung (nếu có từ lỗi tải dữ liệu/API) */}
      {error && <p className="error-message">{error}</p>}

      {!loading && (
        <form onSubmit={(e) => e.preventDefault()}>
          <div className="part-section">
            <span className="instruction-text">
              (Nhập số ngày trong 12 tháng qua bạn sử dụng các chất)
            </span>
            {crafftQuestions
              .filter((q) => q.questionOrder <= 3)
              .map((q) => (
                <div key={q.id} className="question-text">
                  <label>
                    {q.questionOrder}. {q.questionText}
                  </label>
                  <div className="input-days-container">
                    <input
                      type="number"
                      min="0"
                      className="days-input"
                      value={
                        focusedInputId === q.id && partAChoices[q.id] === ""
                          ? ""
                          : partAChoices[q.id] || "0"
                      }
                      onChange={(e) => handlePartAChoice(q.id, e.target.value)}
                      onFocus={() => handlePartAFocus(q.id)}
                      onBlur={() => handlePartABlur(q.id)}
                    />
                    <span className="days-label">ngày</span>
                  </div>
                </div>
              ))}
          </div>

          {showFullPartB && (
            <div className="part-section">
              {crafftQuestions
                .filter((q) => q.questionOrder >= 4)
                .map((q) => {
                  const choices = crafftChoices.filter(
                    (c) => c.testQuestion?.id === q.id
                  );
                  return (
                    <div key={q.id} className="question-text question-partB">
                      <label>
                        {q.questionOrder}. {q.questionText}
                      </label>
                      <div>
                        {choices.map((c) => (
                          <button
                            key={c.id}
                            type="button"
                            className={`button-base ${
                              partBChoices[q.id] === c.score
                                ? "button-selected"
                                : ""
                            }`}
                            onClick={() => handlePartBChoice(q.id, c.score)}
                          >
                            {c.choiceText}
                          </button>
                        ))}
                      </div>
                      {/* HIỂN THỊ THÔNG BÁO LỖI TẠI ĐÂY */}
                      {unansweredPartBQuestions.includes(q.id) && (
                        <p className="error-message" style={{ color: 'red', marginTop: '5px' }}>
                          Vui lòng chọn một câu trả lời.
                        </p>
                      )}
                    </div>
                  );
                })}
            </div>
          )}

          <div className="action-buttons-container">
            <button
              type="button"
              className="submit-button"
              onClick={handleSubmit}
            >
              GỬI BÀI KIỂM TRA
            </button>
          </div>
        </form>
      )}

      {showResultPopup && (
        <div className="popup-overlay">
          <div className="popup-content">
            <h3 className="popup-title">Kết Quả Bài Kiểm Tra CRAFFT</h3>

            {totalPartADays === 0 ? (
              <>
                <p className="popup-text">
                  Bạn chưa sử dụng bất kỳ chất nào được đề cập trong đời.
                </p>
                <div
                  className="popup-text assist-results-substance-item"
                  style={{ marginBottom: 12 }}
                >
                  <div>Mức độ rủi ro của bạn:</div>
                  <div
                    style={{
                      color:
                        resultRiskLevel === "Thấp"
                          ? "#219653"
                          : resultRiskLevel === "Trung bình"
                          ? "#e2b100"
                          : "#d7263d",
                      fontWeight: 600,
                      margin: "2px 0",
                    }}
                  >
                    {resultRiskLevel}
                  </div>
                  <div style={{ marginTop: 2 }}>
                    Khuyến nghị:
                    <span
                      style={{
                        fontWeight: 500,
                        color:
                          resultRiskLevel === "Thấp"
                            ? "#219653"
                            : resultRiskLevel === "Trung bình"
                            ? "#e2b100"
                            : "#d7263d",
                        marginLeft: 4,
                      }}
                    >
                      {resultRecommendation}
                    </span>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div
                  className="popup-text assist-results-substance-item"
                  style={{ marginBottom: 12 }}
                >
                  <div>
                    Tổng điểm CRAFFT của bạn: <strong>{resultScore}</strong>
                  </div>
                  <div
                    style={{
                      color:
                        resultRiskLevel === "Thấp"
                          ? "#219653"
                          : resultRiskLevel === "Trung bình"
                          ? "#e2b100"
                          : "#d7263d",
                      fontWeight: 600,
                      margin: "2px 0",
                    }}
                  >
                    Mức độ: {resultRiskLevel}
                  </div>
                  <div style={{ marginTop: 2 }}>
                    Khuyến nghị:
                    <span
                      style={{
                        fontWeight: 500,
                        color:
                          resultRiskLevel === "Thấp"
                            ? "#219653"
                            : resultRiskLevel === "Trung bình"
                            ? "#e2b100"
                            : "#d7263d",
                        marginLeft: 4,
                      }}
                    >
                      {resultRecommendation}
                    </span>
                  </div>
                </div>
              </>
            )}

            <p className="popup-text">
              Lưu ý: Kết quả này chỉ mang tính chất sàng lọc ban đầu và không
              thay thế cho đánh giá lâm sàng chuyên sâu.
            </p>

            <div className="popup-actions">
              <button
                onClick={() => setShowResultPopup(false)}
                className="popup-button close-button action-button"
              >
                Đóng
              </button>
              <button
                onClick={handleSuggestionClick}
                className={`popup-button suggestion-button ${
                  resultRiskLevel === "Thấp"
                    ? "low"
                    : resultRiskLevel === "Trung bình"
                    ? "medium"
                    : "high"
                }`}
              >
                Gợi ý: {resultRiskLevel === "Thấp" && "Tham gia cộng đồng"}
                {resultRiskLevel === "Trung bình" && "Khóa học"}
                {resultRiskLevel === "Cao" && "Đặt lịch"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    </>
  );
};

export default CRAFFT;