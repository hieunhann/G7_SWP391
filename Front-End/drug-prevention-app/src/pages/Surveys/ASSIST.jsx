import React, { useState, useMemo, useEffect } from "react";

import { useNavigate } from "react-router-dom";
import "./ASSIST.css";
import Header from "../../components/Header/Header";
import api from "../../Axios/Axios";
import surveysServices from "../../apis/SurveysAPIs";
// import { a, q, select, sub } from "framer-motion/client"; // Import này không được sử dụng và có thể gây lỗi nếu framer-motion/client không được thiết lập đúng. Đã loại bỏ để mã rõ ràng hơn.

// Dữ liệu tĩnh cho câu hỏi, đáp án, substances

const ASSIST = () => {
  const [answers, setAnswers] = useState({});
  const [showPopup, setShowPopup] = useState(false);
  const [results, setResults] = useState(null); // Biến trạng thái này dường như không được sử dụng dựa trên logic hiển thị kết quả. `surveyResults` được sử dụng thay thế.
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [surveys, setSurveys] = useState([]);
  const [questionsBank, setQuestions] = useState([]);
  const [choices, setChoices] = useState([]);
  const [addictionTypeQuestion, setAddictionTypeQuestion] = useState(null);
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const userId = user.id;
  const navigate = useNavigate();
  const { getListSurveys, submitSurvey } = surveysServices();
  const [surveyResults, setSurveyResults] = useState(null);

  useEffect(() => {
    console.log("Đang lấy danh sách khảo sát...");
    getSurveys();
    getAssistQuestions();
  }, []);

  const getSurveys = async () => {
    const surveysResponse = await getListSurveys();
    console.log("Phản hồi khảo sát:", surveysResponse);
    setSurveys(surveysResponse);
  };

  const getAssistQuestions = async () => {
    try {
      setIsLoading(true);
      const [questionsRes, choicesRes] = await Promise.all([
        api.get("/findAllAssistQuestions"),
        api.get("/getAssistTestChoice"),
      ]);

      console.log("Phản hồi câu hỏi:", questionsRes.data);
      console.log("Phản hồi lựa chọn:", choicesRes.data);

      var questionsData = questionsRes.data.data ?? [];
      const choicesData = choicesRes.data.data ?? [];

      questionsData = questionsData.map((question) => {
        const choicesOptions = choicesData.filter(
          (option) => option.testQuestion.id === question.id
        );
        question.choices = choicesOptions ?? [];
        return question;
      });

      setQuestions(questionsData.filter((q) => q.subQuestion.length === 0));
      setChoices(choicesData);
      setAddictionTypeQuestion(
        questionsData.find((q) => !!q.subQuestion === true)
      );
      setSurveyResults([]); // Khởi tạo surveyResults là một mảng rỗng
    } catch (error) {
      console.error("Lỗi khi lấy câu hỏi ASSIST:", error);
      setErrorMessage("Không thể tải dữ liệu câu hỏi. Vui lòng thử lại sau.");
    } finally {
      setIsLoading(false);
    }
  };

  // const handleAnswerChange: Cập nhật đáp án khi người dùng chọn
  const handleAnswerChange = (questionId, choiceId, subQuestionKey = null) => {
    setAnswers((prev) => {
      const newAnswers = { ...prev };
      if (subQuestionKey) {
        newAnswers[questionId] = {
          ...(newAnswers[questionId] || {}),
          [subQuestionKey]: choiceId,
          questionId: questionId,
        };
      } else {
        newAnswers[questionId] = choiceId;
      }
      return newAnswers;
    });
    setErrorMessage("");
  };

  const selectedSubstances = useMemo(() => {
    if (!addictionTypeQuestion || !answers[addictionTypeQuestion.id]) return [];
    return addictionTypeQuestion.subQuestion
      .map((sq) => {
        const answerId = answers[addictionTypeQuestion.id]?.[sq.key];
        const choice = choices.find((c) => Number(c.id) === Number(answerId));

        return choice && choice.score === 3 // Giả định điểm 3 nghĩa là được chọn
          ? addictionTypeQuestion.subQuestion.find((s) => s.key === sq.key)
          : null;
      })
      .filter(Boolean);
  }, [answers, addictionTypeQuestion, choices]);

  // const shouldSkipQ2toQ7: Kiểm tra có cần hiển thị các câu hỏi 2-7 không (nếu chưa chọn chất nào ở câu 1 thì ẩn)
  const shouldSkipQ2toQ7 = useMemo(() => {
    if (!addictionTypeQuestion || !answers[addictionTypeQuestion.id])
      return true;
    return !addictionTypeQuestion.subQuestion.some((sq) => {
      const answerId = answers[addictionTypeQuestion.id]?.[sq.key];
      const choice = choices.find((c) => Number(c.id) === Number(answerId));
      return choice && choice.score === 3; // Giả định điểm 3 nghĩa là được chọn
    });
  }, [answers, addictionTypeQuestion, choices]);

  // const getRiskLevelText: Đổi mã mức độ thành tiếng Việt
  // Hàm này vẫn hữu ích nếu bạn muốn chuẩn hóa mức độ rủi ro sang tiếng Anh nội bộ
  // nhưng để hiển thị, dường như API đã trả về tiếng Việt.
  // Chúng ta sẽ giữ nguyên, nhưng sẽ dựa vào các chuỗi tiếng Việt của API để so sánh.
  const getRiskLevelText = (riskLevel) => {
    switch (riskLevel) {
      case "Thấp":
        return "Thấp";
      case "Trung bình":
        return "Trung bình";
      case "Cao":
        return "Cao";
      default:
        return riskLevel; // Trong trường hợp có giá trị không mong muốn
    }
  };

  const getOverallRiskLevel = useMemo(() => {
    if (!surveyResults || surveyResults.length === 0) return "Thấp"; // Mặc định nếu chưa có kết quả hoặc không có chất nào được chọn.

    let overallLevel = "Thấp"; // Khởi tạo với "Thấp"

    for (const res of surveyResults) {
      if (res.riskLevel === "Cao") {
        return "Cao"; // Nếu bất kỳ chất nào là "Cao", tổng thể là "Cao"
      }
      if (res.riskLevel === "Trung bình") {
        overallLevel = "Trung bình"; // Nếu bất kỳ chất nào là "Trung bình" và chưa phải "Cao", đặt là "Trung bình"
      }
    }

    // Giả định trạng thái tiêm là một phần của kết quả chất riêng lẻ hoặc một phép tính riêng.
    // Mã gốc có `results.injectionStatus` nhưng trạng thái `results` không được cập nhật.
    // Nếu trạng thái tiêm là một phép tính riêng, bạn cần phải lấy và lưu trữ nó.
    // Hiện tại, dựa trên logic hiện tại, `getOverallRiskLevel` chỉ sử dụng `surveyResults`.
    // Nếu bạn cần trạng thái tiêm ảnh hưởng đến rủi ro tổng thể, bạn cần điều chỉnh `submitSurvey` để trả về nó hoặc thêm một lệnh gọi API riêng.

    return overallLevel;
  }, [surveyResults]);

  const handleSubmit = async () => {
    setErrorMessage("");
    let allAnswered = true;

    // Kiểm tra Q1
    if (addictionTypeQuestion) {
      const q1Answers = answers[addictionTypeQuestion.id];
      if (
        !q1Answers ||
        (addictionTypeQuestion.subQuestion || []).some((sq) => {
          const isAnswered = !!q1Answers[sq.key];
          return !isAnswered;
        })
      ) {
        allAnswered = false;
      }
    }

    // Kiểm tra Q2-Q7 cho các chất đã chọn
    if (!shouldSkipQ2toQ7) {
      selectedSubstances.forEach((substance) => {
        questionsBank.forEach((q) => {
          const isSubstanceQuestionAnswered =
            answers[q.id] && answers[q.id][substance.key];
          if (!isSubstanceQuestionAnswered) {
            allAnswered = false;
          }
        });
      });
    }

    if (!allAnswered) {
      setErrorMessage(
        "Vui lòng trả lời tất cả các câu hỏi được yêu cầu trước khi gửi."
      );
      return;
    }

    // Nếu không có chất nào được chọn ở Q1, hiển thị rủi ro thấp trực tiếp
    if (selectedSubstances.length === 0) {
      setSurveyResults([
        {
          substanceName: "Không có chất được chọn",
          score: 0,
          riskLevel: "Thấp",
          recommendation:
            "Bạn chưa sử dụng bất kỳ chất nào được đề cập trong đời.",
          substanceId: "none", // Một ID duy nhất cho trường hợp này
        },
      ]);
      setShowPopup(true);
      return;
    }

    setIsLoading(true);
    setSurveyResults([]); // Xóa các kết quả trước đó trước khi gửi kết quả mới
    const submissionPromises = selectedSubstances.map(async (substance) => {
      const payloadAnswers = questionsBank.map((q) => {
        // Lặp qua questionsBank để lấy các câu trả lời liên quan
        const choiceId = answers[q.id]?.[substance.key];
        const choice = choices.find((c) => c.id === choiceId);
        return {
          questionId: q.id,
          choiceText: choice?.choiceText || "",
        };
      });

      // Bao gồm câu trả lời của Q1 cho chất cụ thể này nếu cần trong payload.
      // Dựa trên cấu trúc phản hồi API đã cung cấp (score, riskLevel, recommendation),
      // dường như backend đang tính toán dựa trên toàn bộ các câu trả lời cho một chất.
      // Vì vậy, chúng ta cần đảm bảo payload chứa tất cả các câu trả lời cho một chất cụ thể.
      // `payloadAnswers` hiện tại chỉ ánh xạ questionsBank (Q2-Q7).
      // Chúng ta cũng cần câu trả lời Q1 cho chất cụ thể.

      const q1AnswerForSubstance =
        answers[addictionTypeQuestion.id]?.[substance.key];
      if (q1AnswerForSubstance) {
        payloadAnswers.push({
          questionId: addictionTypeQuestion.id,
          choiceText:
            choices.find((c) => c.id === q1AnswerForSubstance)?.choiceText ||
            "",
        });
      }

      const payload = {
        answers: payloadAnswers,
        userId: userId,
        testId: surveys.find((s) => s.category.name === "ASSIST")?.id,
        substanceKey: substance.key, // Gửi khóa chất để backend xác định đó là chất nào
      };

      try {
        let surveyResult = await submitSurvey(payload);
        surveyResult = {
          ...surveyResult,
          substanceName: substance.text, // Giả định substance.text chứa tên tiếng Việt như "Thuốc lá"
          substanceId: substance.id,
        };
        return surveyResult;
      } catch (error) {
        console.error(`Lỗi khi gửi khảo sát cho ${substance.text}:`, error);
        return {
          substanceName: substance.text,
          score: -1, // Cho biết lỗi
          riskLevel: "Lỗi",
          recommendation: "Không thể tính toán kết quả.",
          substanceId: substance.id,
        };
      }
    });

    const allResults = await Promise.all(submissionPromises);
    setSurveyResults(allResults.filter(Boolean)); // Lọc bỏ bất kỳ kết quả null/undefined nào nếu promises thất bại
    setIsLoading(false);
    setShowPopup(true);
  };

  const handleClear = () => {
    setAnswers({});
    setResults(null); // Đặt lại trạng thái results
    setShowPopup(false);
    setErrorMessage("");
    setSurveyResults([]); // Xóa kết quả khảo sát
  };

  // Hàm này sẽ được gọi khi nhấn nút "Gợi ý" trong popup
  const handleSuggestionClick = () => {
    const overallRisk = getOverallRiskLevel; // Giá trị này sẽ là "Thấp", "Trung bình", hoặc "Cao"
    let navigateTo = "";

    switch (overallRisk) {
      case "Thấp":
        navigateTo = "/ViewCommunicationPrograms";
        break;
      case "Trung bình":
        navigateTo = "/Courses";
        break;
      case "Cao":
        navigateTo = "/booking";
        break;
      default:
        navigateTo = "/";
    }

    if (navigateTo) {
      navigate(navigateTo);
    }
    setShowPopup(false); // Đóng popup sau khi chuyển hướng
  };

  if (isLoading) {
    return <div className="test-wrapper">Đang tải dữ liệu...</div>;
  }

  // Đã chuyển phần hiển thị thông báo lỗi vào khối return chính để hiển thị nó trong cấu trúc thành phần.
  // if (errorMessage) {
  //   return <div className="test-wrapper error-message">{errorMessage}</div>;
  // }

  return (
    <>
      <Header />
      <div className="test-wrapper">
        <div className="questions-container">
          <h1 className="test-title">
            Bài Kiểm Tra Sàng Lọc Mức Độ Liên Quan Đến Chất Gây Nghiện (ASSIST)
          </h1>
          <p className="instruction-text">
            Chào mừng bạn đến với bài kiểm tra sàng lọc ASSIST. Chúng tôi sẽ hỏi
            một số câu hỏi về kinh nghiệm sử dụng các chất gây nghiện của bạn
            trong đời và trong ba tháng qua. Các chất này có thể được hút, nuốt,
            hít, tiêm hoặc dùng dưới dạng thuốc viên.
          </p>
          <p className="instruction-text instruction-heading">
            Vui lòng trả lời thành thật nhất có thể.
          </p>

          {addictionTypeQuestion && (
            <div className="question-text">
              <p>
                <strong>1. {addictionTypeQuestion.questionText}</strong>
              </p>
              {addictionTypeQuestion.subQuestion?.map((subQ, index) => (
                <div key={subQ.key} className="assist-sub-question-row">
                  <span className="assist-sub-question-text">{`1.${
                    index + 1
                  }. ${subQ.text}`}</span>
                  <div className="assist-sub-question-options">
                    {addictionTypeQuestion.choices.map((choice) => (
                      <button
                        key={choice.id}
                        className={`button-base ${
                          answers[addictionTypeQuestion.id]?.[subQ.key] ===
                          choice.id
                            ? "button-selected"
                            : ""
                        }`}
                        onClick={() =>
                          handleAnswerChange(
                            addictionTypeQuestion.id,
                            choice.id,
                            subQ.key
                          )
                        }
                      >
                        {choice.choiceText}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Câu hỏi 2-7 */}
          {!shouldSkipQ2toQ7 && (
            <div className="part-section">
              <h2 className="part-title">Chi tiết sử dụng trong 3 tháng qua</h2>
              <p className="instruction-text">
                Vui lòng trả lời các câu hỏi sau cho từng chất bạn đã sử dụng
                trong đời.
              </p>
              {questionsBank.map((q) => (
                <div
                  key={q.id}
                  className="question-text assist-frequency-question"
                >
                  <p>
                    <strong>
                      {q.questionOrder}.{" "}
                      {q.questionText.replace("[SUBSTANCE_PLACEHOLDER]", "")}
                    </strong>
                  </p>
                  {selectedSubstances.map((substance) => {
                    return (
                      <div
                        key={substance.key}
                        className="assist-substance-section"
                        style={{
                          marginBottom: 8,
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "flex-start",
                          gap: 4,
                          maxWidth: 400,
                        }}
                      >
                        <div
                          className="assist-substance-title"
                          style={{
                            fontWeight: 500,
                            fontSize: "0.98rem",
                            textAlign: "left",
                            marginBottom: 2,
                          }}
                        >
                          {substance.text}
                        </div>
                        <div
                          className="question-options-container"
                          style={{
                            width: "100%",
                            display: "flex",
                            flexWrap: "wrap",
                            gap: 6,
                          }}
                        >
                          {q.choices.map((choice) => (
                            <button
                              key={choice.id}
                              className={`button-base ${
                                answers[q.id]?.[substance.key] === choice.id
                                  ? "button-selected"
                                  : ""
                              }`}
                              style={{
                                fontSize: "0.92rem",
                                padding: "3px 10px",
                                minWidth: 80,
                                minHeight: 28,
                              }}
                              onClick={() =>
                                handleAnswerChange(
                                  q.id,
                                  choice.id,
                                  substance.key
                                )
                              }
                            >
                              {choice.choiceText}
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          )}

          {errorMessage && <p className="error-message">{errorMessage}</p>}

          <div className="action-buttons-container">
            <button className="clear-button" onClick={handleClear}>
              Xóa Bài Làm
            </button>
            <button className="submit-button" onClick={handleSubmit}>
              Gửi Bài Làm
            </button>
          </div>
        </div>

        {showPopup && surveyResults && (
          <div className="popup-overlay">
            <div className="popup-content">
              <h2 className="popup-title">Kết Quả Bài Kiểm Tra ASSIST</h2>
              {surveyResults.length > 0 ? (
                <>
                  <p className="popup-text instruction-heading">
                    Điểm và Khuyến nghị theo từng chất:
                  </p>
                  {surveyResults.map((result, index) => (
                    <div
                      key={index}
                      className="popup-text assist-results-substance-item"
                      style={{ marginBottom: 12 }}
                    >
                      <div>
                        <span
                          style={{
                            color: "#007bff", 
                          }}
                        >
                          {result.substanceName}
                        </span >
                        : Tổng điểm: {result.score}
                      </div>
                      <div
                        style={{
                          // Đã sửa màu sắc dựa trên riskLevel từ API (tiếng Việt)
                          color:
                            result.riskLevel === "Thấp"
                              ? "#219653" // Xanh lục
                              : result.riskLevel === "Trung bình"
                              ? "#e2b100" // Vàng
                              : "#d7263d", // Đỏ
                          fontWeight: 600,
                          margin: "2px 0",
                        }}
                      >
                        Mức độ: {getRiskLevelText(result.riskLevel)}
                      </div>
                      <div style={{ marginTop: 2 }}>
                        Khuyến nghị:
                        <span
                          style={{
                            fontWeight: 500,
                            // Đã sửa màu sắc cho văn bản khuyến nghị
                            color:
                              result.riskLevel === "Thấp"
                                ? "#219653"
                                : result.riskLevel === "Trung bình"
                                ? "#e2b100"
                                : "#d7263d",
                            marginLeft: 4,
                          }}
                        >
                          {result.recommendations}
                        </span>
                      </div>
                    </div>
                  ))}
                </>
              ) : (
                <p className="popup-text">
                  Bạn chưa sử dụng bất kỳ chất nào được đề cập trong đời. Kết
                  quả: <span className="risk-level low">Mức độ: Thấp</span>
                </p>
              )}

              <p className="popup-text instruction-text">
                Lưu ý: Kết quả này chỉ mang tính chất sàng lọc ban đầu và không
                thay thế cho đánh giá lâm sàng chuyên sâu.
              </p>

              <div className="popup-actions">
                <button
                  className="popup-button close-button action-button"
                  onClick={() => setShowPopup(false)}
                >
                  Đóng
                </button>
                <button
                  onClick={handleSuggestionClick}
                  // Đặt class động cho nút gợi ý dựa trên mức độ rủi ro tổng thể
                  className={`popup-button suggestion-button action-button ${
                    getOverallRiskLevel === "Thấp"
                      ? "low"
                      : getOverallRiskLevel === "Trung bình"
                      ? "medium"
                      : "high"
                  }`}
                >
                  Gợi ý:{" "}
                  {getOverallRiskLevel === "Thấp" && "Tham gia cộng đồng"}
                  {getOverallRiskLevel === "Trung bình" && "Khóa học"}
                  {getOverallRiskLevel === "Cao" && "Đặt lịch"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default ASSIST;
