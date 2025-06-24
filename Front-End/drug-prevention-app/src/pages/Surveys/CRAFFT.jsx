import React, { useState, useMemo } from "react";
import "./CRAFFT.css";
import Header from "../../components/Header/Header";
import { useNavigate } from "react-router-dom";

// DỮ LIỆU TĨNH CRAFFT
const crafftQuestions = [
  {
    id: 1,
    question_text:
      "Trong 12 tháng qua, bạn đã uống bia, rượu vang hoặc bất kỳ đồ uống có cồn nào (nhiều hơn vài ngụm) trong bao nhiêu ngày?",
  },
  {
    id: 2,
    question_text:
      "Trong 12 tháng qua, bạn đã sử dụng cần sa (dạng khô, dầu, nhựa) bằng cách hút, xông hơi hoặc ăn trong bao nhiêu ngày?",
  },
  {
    id: 3,
    question_text:
      "Trong 12 tháng qua, bạn đã sử dụng chất nào khác để phê (ma túy bất hợp pháp, thuốc kê đơn, hoặc các chất hít, ngửi, xông hơi) trong bao nhiêu ngày?",
  },
  {
    id: 4,
    question_text:
      "Bạn đã từng đi xe do người đang 'phê' hoặc đã dùng rượu/bia, ma túy (kể cả bạn tự lái) điều khiển chưa?",
  },
  {
    id: 5,
    question_text:
      "Bạn có bao giờ dùng rượu hoặc ma túy để thư giãn, cảm thấy tốt hơn về bản thân, hoặc để hòa nhập không?",
  },
  {
    id: 6,
    question_text:
      "Bạn có bao giờ sử dụng rượu hoặc ma túy khi chỉ có một mình không?",
  },
  {
    id: 7,
    question_text:
      "Bạn có bao giờ quên những gì mình đã làm trong khi sử dụng rượu hoặc ma túy không?",
  },
  {
    id: 8,
    question_text:
      "Gia đình hoặc bạn bè của bạn có bao giờ nói rằng bạn nên giảm bớt việc uống rượu hoặc sử dụng ma túy không?",
  },
  {
    id: 9,
    question_text:
      "Bạn đã bao giờ gặp rắc rối trong khi đang sử dụng rượu hoặc ma túy chưa?",
  },
];

const crafftChoices = [
  // Phần A (câu 1-3): nhập số ngày, không cần choices
  // Phần B (câu 4-9): Có/Không
  {
    question_id: 4,
    choices: [
      { id: 10, text: "Có", score: 1 },
      { id: 11, text: "Không", score: 0 },
    ],
  },
  {
    question_id: 5,
    choices: [
      { id: 12, text: "Có", score: 1 },
      { id: 13, text: "Không", score: 0 },
    ],
  },
  {
    question_id: 6,
    choices: [
      { id: 14, text: "Có", score: 1 },
      { id: 15, text: "Không", score: 0 },
    ],
  },
  {
    question_id: 7,
    choices: [
      { id: 16, text: "Có", score: 1 },
      { id: 17, text: "Không", score: 0 },
    ],
  },
  {
    question_id: 8,
    choices: [
      { id: 18, text: "Có", score: 1 },
      { id: 19, text: "Không", score: 0 },
    ],
  },
  {
    question_id: 9,
    choices: [
      { id: 20, text: "Có", score: 1 },
      { id: 21, text: "Không", score: 0 },
    ],
  },
];

// Hàm xác định mức độ rủi ro dựa trên điểm số
const getRiskLevel = (score) => {
  if (score >= 2) {
    return "Cao"; // High
  } else if (score === 1) {
    return "Trung bình"; // Medium
  } else {
    return "Thấp"; // Low
  }
};

// Hàm lấy khuyến nghị dựa trên mức độ rủi ro và totalPartADaysForLogic
const getRecommendation = (riskLevel, totalPartADaysForLogic) => {
  if (totalPartADaysForLogic === 0) {
    return "Chúc mừng bạn! Bạn chưa sử dụng bất kỳ chất nào được đề cập trong đời. Duy trì lối sống lành mạnh này.";
  }

  switch (riskLevel) {
    case "Thấp":
      return "Bạn có vẻ đang kiểm soát tốt việc sử dụng chất. Hãy tiếp tục duy trì và tham gia các hoạt động cộng đồng lành mạnh để tăng cường sức khỏe tinh thần và thể chất.";
    case "Trung bình":
      return "Kết quả cho thấy bạn có thể đang ở mức rủi ro trung bình. Bạn nên cân nhắc tìm hiểu thêm về các khóa học kỹ năng sống hoặc tham vấn để nhận được hỗ trợ kịp thời.";
    case "Cao":
      return "Mức độ rủi ro cao cho thấy bạn cần được hỗ trợ chuyên sâu. Chúng tôi khuyến nghị bạn nên đặt lịch hẹn với chuyên gia y tế để được đánh giá và tư vấn cụ thể.";
    default:
      return "Vui lòng liên hệ với chuyên gia y tế để được tư vấn thêm.";
  }
};

// --- HÀM MỚI ĐỂ TẠO INLINE STYLE ---
const getRiskLevelStyles = (riskLevel) => {
  switch (riskLevel) {
    case "Thấp":
      return {
        backgroundColor: "#d4edda", // Màu xanh lá nhạt
        color: "#155724", // Màu chữ xanh lá đậm
        border: "1px solid #c3e6cb",
      };
    case "Trung bình":
      return {
        backgroundColor: "#fff3cd", // Màu vàng nhạt
        color: "#856404", // Màu chữ vàng đậm
        border: "1px solid #ffeeba",
      };
    case "Cao":
      return {
        backgroundColor: "#f8d7da", // Màu đỏ nhạt
        color: "#721c24", // Màu chữ đỏ đậm
        border: "1px solid #f5c6cb",
      };
    default:
      return {}; // Trả về object rỗng nếu không khớp
  }
};
// --- KẾT THÚC HÀM MỚI ---

const CRAFFT = () => {
  // State cho câu trả lời phần A (câu 1-3)
  const [partAChoices, setPartAChoices] = useState({ 1: 0, 2: 0, 3: 0 });
  // State cho câu trả lời phần B (câu 4-9)
  const [partBChoices, setPartBChoices] = useState({
    4: null,
    5: null,
    6: null,
    7: null,
    8: null,
    9: null,
  });
  const [showResultPopup, setShowResultPopup] = useState(false);
  const [resultScore, setResultScore] = useState(0);
  const [resultRiskLevel, setResultRiskLevel] = useState("Thấp");
  const [resultRecommendation, setResultRecommendation] = useState("");
  const [showFullPartB, setShowFullPartB] = useState(false);
  const navigate = useNavigate();

  const totalPartADaysForLogic = useMemo(() => {
    return (
      (partAChoices[1] || 0) + (partAChoices[2] || 0) + (partAChoices[3] || 0)
    );
  }, [partAChoices]);

  // Hiện Part B nếu có ngày nào > 0
  React.useEffect(() => {
    setShowFullPartB(totalPartADaysForLogic > 0);
    if (totalPartADaysForLogic === 0) {
      setPartBChoices({ 4: null, 5: null, 6: null, 7: null, 8: null, 9: null });
    }
  }, [totalPartADaysForLogic]);

  const totalPartBScore = useMemo(() => {
    return Object.values(partBChoices).reduce(
      (sum, v) => sum + (Number(v) || 0),
      0
    );
  }, [partBChoices]);

  const handlePartAChoice = (questionId, value) => {
    // Nếu xóa hết thì cho về rỗng (để user nhập tiếp), nếu nhập số thì loại bỏ toàn bộ số 0 đầu
    let val = value.replace(/^0+/, "");
    // Nếu nhập không phải số, bỏ qua
    if (!/^\d*$/.test(val)) return;
    setPartAChoices((prev) => ({ ...prev, [questionId]: val }));
  };
  const handlePartBChoice = (questionId, score) => {
    setPartBChoices((prev) => ({ ...prev, [questionId]: score }));
  };
  const handleSubmit = () => {
    // Kiểm tra đã trả lời hết phần A
    if (
      ![1, 2, 3].every(
        (id) => partAChoices[id] !== undefined && partAChoices[id] !== null
      )
    ) {
      alert("Vui lòng trả lời tất cả các câu hỏi ở Phần A (câu 1-3).");
      return;
    }
    let finalScore = 0;
    let finalRiskLevel = "Thấp";
    let recommendationText = "";
    if (totalPartADaysForLogic === 0) {
      finalScore = 0;
      finalRiskLevel = "Thấp";
      recommendationText = getRecommendation("Thấp", totalPartADaysForLogic);
    } else {
      // Kiểm tra đã trả lời hết phần B
      if (![4, 5, 6, 7, 8, 9].every((id) => partBChoices[id] !== undefined)) {
        alert(
          "Vui lòng trả lời tất cả các câu hỏi ở Phần B (câu 4-9) vì chúng đang hiển thị."
        );
        return;
      }
      finalScore = totalPartBScore;
      finalRiskLevel = getRiskLevel(finalScore);
      recommendationText = getRecommendation(
        finalRiskLevel,
        totalPartADaysForLogic
      );
    }
    setResultScore(finalScore);
    setResultRiskLevel(finalRiskLevel);
    setResultRecommendation(recommendationText);
    setShowResultPopup(true);
  };
  const handleClearAnswers = () => {
    setPartAChoices({ 1: 0, 2: 0, 3: 0 });
    setPartBChoices({ 4: null, 5: null, 6: null, 7: null, 8: null, 9: null });
    setShowFullPartB(false);
    setShowResultPopup(false);
    setResultScore(0);
    setResultRiskLevel("Thấp");
    setResultRecommendation("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const handleClosePopup = () => setShowResultPopup(false);
  const handleSuggestionClick = () => {
    handleClearAnswers();
    switch (resultRiskLevel) {
      case "Thấp":
        navigate("/CommunityActivities");
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

  const partAQuestions = crafftQuestions.filter((q) => q.id >= 1 && q.id <= 3);
  const partBQuestions_Full = crafftQuestions.filter(
    (q) => q.id >= 4 && q.id <= 9
  );

  return (
    <>
      <Header />
      <div className="test-wrapper">
        {crafftQuestions.length === 0 ? (
          <p>Không có câu hỏi nào</p>
        ) : (
          <>
            <div className="questions-container">
              <h2 className="test-title">BÀI KIỂM TRA CRAFFT</h2>

              {/* Phần A */}
              <div className="part-section">
                <h3 className="part-title">
                  Phần A: Trong 12 THÁNG QUA, bạn đã bao nhiêu ngày:
                </h3>
                {partAQuestions.map((q) => (
                  <div key={q.id} className="question-text">
                    <p>
                      <b>
                        {q.id}. {q.question_text}
                      </b>
                      <span
                        className="instruction-text-inline"
                        style={{
                          display: "flex",
                          justifyContent: "center",
                          marginLeft: 8,
                          color: "#888",
                          fontStyle: "italic",
                          fontSize: "0.97em",
                        }}
                      >
                        (Điền số ngày vào ô bên dưới. Nếu không có, điền "0")
                      </span>
                    </p>

                    <div className="input-days-container">
                      <input
                        type="number"
                        min="0"
                        className="days-input"
                        value={
                          partAChoices[q.id] === undefined
                            ? ""
                            : partAChoices[q.id]
                        }
                        onChange={(e) =>
                          handlePartAChoice(q.id, e.target.value)
                        }
                        placeholder="0"
                        style={{
                          textAlign: "center",
                          width: 48,
                          fontWeight: 500,
                        }}
                      />
                      <span className="days-label"> # số ngày</span>
                    </div>
                  </div>
                ))}
                <p className="instructions-partA">
                  <span className="instruction-heading">
                    ĐỌC CÁC HƯỚNG DẪN NÀY TRƯỚC KHI TIẾP TỤNG:
                  </span>
                  <br />
                  • Nếu bạn điền “0” vào TẤT CẢ các ô ở **câu hỏi 1-3** ở trên,
                  **HÃY DỪNG LẠI.**
                  <br />• Nếu bạn điền “1” hoặc cao hơn vào BẤT KỲ ô nào ở **câu
                  hỏi 1-3** ở trên, HÃY TRẢ LỜI CÁC CÂU HỎI **4-9** (Phần B).
                </p>
              </div>

              {/* Phần B - Các câu hỏi CRAFFT còn lại (bắt đầu từ câu 4) */}
              {showFullPartB && (
                <div className="part-section">
                  <h3 className="part-title">
                    Phần B: Bảng câu hỏi CRAFFT (phiên bản 2.1)
                  </h3>
                  <p className="instruction-text">Bệnh nhân điền</p>
                  <p className="instruction-text">
                    Vui lòng trả lời tất cả các câu hỏi một cách trung thực; câu
                    trả lời của bạn sẽ được giữ bí mật.
                  </p>
                  <div className="choices-header">
                    <span className="header-label">Không</span>
                    <span className="header-label">Có</span>
                  </div>

                  {partBQuestions_Full.map((q) => (
                    <div key={q.id} className="question-text question-partB">
                      <p>
                        <b>
                          {q.id}. {q.question_text}
                        </b>
                      </p>
                      <div className="choices-container">
                        {crafftChoices
                          .find((c) => c.question_id === q.id)
                          ?.choices.map((choice) => (
                            <button
                              key={choice.id}
                              onClick={() =>
                                handlePartBChoice(q.id, choice.score)
                              }
                              className={`button-base ${
                                partBChoices[q.id] === choice.score
                                  ? "button-selected"
                                  : ""
                              }`}
                            >
                              {choice.text}
                            </button>
                          ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <hr className="divider" />

            <div className="action-buttons-container">
              <button
                onClick={handleClearAnswers}
                className="clear-button action-button"
              >
                Xóa tất cả câu trả lời
              </button>
              <button
                onClick={handleSubmit}
                className="submit-button action-button"
              >
                GỬI BÀI KIỂM TRA
              </button>
            </div>

            {showResultPopup && (
              <div className="popup-overlay">
                <div className="popup-content">
                  <h3 className="popup-title">Kết Quả Bài Kiểm Tra CRAFFT</h3>
                  {totalPartADaysForLogic === 0 ? (
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
                          Tổng điểm CRAFFT của bạn:{" "}
                          <strong>{resultScore}</strong>
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
                    Lưu ý: Kết quả này chỉ mang tính chất sàng lọc ban đầu và
                    không thay thế cho đánh giá lâm sàng chuyên sâu.
                  </p>
                  <div className="popup-actions">
                    <button
                      onClick={handleClosePopup}
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
                      Gợi ý:{" "}
                      {resultRiskLevel === "Thấp" && "Tham gia cộng đồng"}
                      {resultRiskLevel === "Trung bình" && "Khóa học"}
                      {resultRiskLevel === "Cao" && "Đặt lịch"}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
};

export default CRAFFT;
