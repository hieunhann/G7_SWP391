import React, { useEffect, useState, useMemo } from "react";
import './CRAFFT.css';

const PORT = 5002;

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

const CRAFFT = () => {
  const [allQuestions, setAllQuestions] = useState([]);
  const [partAChoices, setPartAChoices] = useState({}); // Lưu trữ câu trả lời số ngày của Phần A (id: giá trị)
  const [partBChoices, setPartBChoices] = useState({}); // Lưu trữ câu trả lời Có/Không của Phần B (id: điểm số)
  const [questionChoices, setQuestionChoices] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showResultPopup, setShowResultPopup] = useState(false); 

  const [showFullPartB, setShowFullPartB] = useState(false);

  // Tính tổng số ngày ở Phần A (chỉ câu 1, 2, 3) để quyết định hiển thị Phần B đầy đủ
  const totalPartADaysForLogic = useMemo(() => {
    // Đảm bảo chỉ tính các câu 1, 2, 3 cho Phần A
    return (partAChoices[1] || 0) + (partAChoices[2] || 0) + (partAChoices[3] || 0);
  }, [partAChoices]);

  useEffect(() => {
    const fetchTestData = async () => {
      try {
        setLoading(true);
        setError(null);

        const resQuestions = await fetch(
          `http://localhost:${PORT}/test_questions`
        );
        if (!resQuestions.ok) throw new Error("Không thể tải câu hỏi"); // Failed to load questions
        const questionsData = await resQuestions.json();
        setAllQuestions(questionsData);

        const resChoices = await fetch(`http://localhost:${PORT}/test_choices`);
        if (!resChoices.ok) throw new Error("Không thể tải lựa chọn"); // Failed to load choices
        const choicesData = await resChoices.json();
        setQuestionChoices(choicesData);

        // Khởi tạo partAChoices cho câu 1-3 với giá trị 0
        const initialPartAChoices = {};
        questionsData.filter(q => q.id >= 1 && q.id <= 3).forEach(q => { 
            initialPartAChoices[q.id] = 0; 
        });
        setPartAChoices(initialPartAChoices);

        // Khởi tạo partBChoices cho câu 4 (CAR) với giá trị mặc định là 0 (Không)
        const initialPartBChoices = {};
        const carQuestion = questionsData.find(q => q.id === 4); // Tìm câu hỏi ID 4
        if (carQuestion) {
            initialPartBChoices[carQuestion.id] = 0; // Mặc định là 'Không' (điểm 0)
        }
        setPartBChoices(initialPartBChoices);

      } catch (err) {
        setError(err.message || "Lỗi khi tải dữ liệu bài kiểm tra"); // Error fetching test data
      } finally {
        setLoading(false);
      }
    };

    fetchTestData();
  }, []);

  // Hàm xử lý thay đổi cho Phần A (chỉ nhập số ngày cho câu 1-3)
  const handlePartAChoice = (questionId, value) => {
    const numericValue = Math.max(0, Number(value)); // Đảm bảo không âm
    setPartAChoices((prev) => ({ ...prev, [questionId]: numericValue }));
  };
    

  // Hàm xử lý thay đổi cho Phần B (Có/Không cho câu 4-9)
  const handlePartBChoice = (questionId, score) => {
    setPartBChoices((prev) => ({ ...prev, [questionId]: score }));
  };

  // Logic để xác định liệu có hiển thị toàn bộ Phần B (câu 5-9) hay không
  // (Câu 4 luôn hiển thị trong Phần B)
  useEffect(() => {
    // Lấy câu hỏi CAR (ID 4) để kiểm tra lựa chọn của nó
    const carQuestionAnsweredYes = partBChoices[4] === 1; // Kiểm tra nếu câu 4 là 'Có'

    // Logic hiển thị Phần B đầy đủ:
    // 1. totalPartADaysForLogic > 0 (tức là có sử dụng chất ở Phần A)
    // HOẶC
    // 2. carQuestionAnsweredYes (tức là đã trả lời 'Có' cho câu CAR)
    const shouldShowFullPartB = totalPartADaysForLogic > 0 || carQuestionAnsweredYes;
    
    if (shouldShowFullPartB !== showFullPartB) {
        setShowFullPartB(shouldShowFullPartB);
    }

    // Nếu chuyển từ hiển thị Phần B đầy đủ sang không hiển thị,
    // thì đặt lại các câu trả lời Phần B từ câu 5 trở đi.
    // Câu 4 sẽ được giữ lại vì nó luôn hiển thị.
    if (!shouldShowFullPartB && showFullPartB) { 
        setPartBChoices(prev => {
            const newChoices = { ...prev };
            // Xóa các câu hỏi từ 5 đến 9
            for (let i = 5; i <= 9; i++) {
                delete newChoices[i];
            }
            return newChoices;
        });
    }
  }, [partAChoices, totalPartADaysForLogic, showFullPartB, partBChoices]);


  // Tính tổng điểm cho Phần B (tất cả các câu hỏi Có/Không, tức là câu 4-9)
  const totalPartBScore = useMemo(() => {
    // Tính điểm cho tất cả các câu hỏi từ 4 đến 9
    return Object.entries(partBChoices).reduce((acc, [qId, score]) => {
      if (Number(qId) >= 4 && Number(qId) <= 9) { // Bắt đầu tính điểm từ câu 4
        return acc + score;
      }
      return acc;
    }, 0);
  }, [partBChoices]);

  // Hàm xử lý khi người dùng nhấn nút "SUBMIT TEST" (Gửi bài kiểm tra)
  const handleSubmit = () => {
    // 1. Kiểm tra Phần A: Đảm bảo tất cả 3 câu hỏi Phần A đã được nhập (có giá trị, kể cả 0)
    const partAQuestionsToSubmit = allQuestions.filter(q => q.id >= 1 && q.id <= 3); 
    const allPartAAnswered = partAQuestionsToSubmit.every(q => partAChoices[q.id] !== undefined && partAChoices[q.id] !== null);
    
    if (!allPartAAnswered) {
        alert("Vui lòng trả lời tất cả các câu hỏi ở Phần A (câu 1-3).");
        return;
    }

    // Nếu Part B đầy đủ đang hiển thị, cần trả lời các câu 5-9
    // (Câu 4 luôn hiển thị, nên không cần kiểm tra riêng ở đây)
    if (showFullPartB) { 
        const partBQuestionsToAnswer = allQuestions.filter(q => q.id >= 5 && q.id <= 9); 
        const allPartBRemainingAnswered = partBQuestionsToAnswer.every(q => partBChoices[q.id] !== undefined);
        if (!allPartBRemainingAnswered) {
            alert("Vui lòng trả lời tất cả các câu hỏi còn lại ở Phần B (câu 5-9) vì chúng đang hiển thị.");
            return;
        }
    }

    const level = getRiskLevel(totalPartBScore);
    console.log("Trả lời Phần A:", partAChoices); // Part A answers
    console.log("Trả lời Phần B:", partBChoices); // Part B answers
    console.log("Tổng điểm Phần B:", totalPartBScore); // Total Part B score
    console.log("Mức độ rủi ro:", level); // Risk Level

    setShowResultPopup(true);
  };

  // Hàm để xóa tất cả các câu trả lời và đặt lại bài kiểm tra
  const handleClearAnswers = () => {
    // Đặt lại câu trả lời Phần A về 0 (chỉ cho 3 câu đầu)
    const initialPartAChoices = {};
    allQuestions.filter(q => q.id >= 1 && q.id <= 3).forEach(q => {
        initialPartAChoices[q.id] = 0;
    });
    setPartAChoices(initialPartAChoices);

    // Đặt lại câu trả lời Phần B: Khởi tạo lại câu 4 về 0, và xóa các câu khác
    const initialPartBChoices = {};
    const carQuestion = allQuestions.find(q => q.id === 4);
    if (carQuestion) {
        initialPartBChoices[carQuestion.id] = 0; // Mặc định 'Không' cho câu 4
    }
    setPartBChoices(initialPartBChoices);

    setShowFullPartB(false);
    setShowResultPopup(false); 
  };

  // Hàm đóng cửa sổ popup kết quả
  const handleClosePopup = () => {
    setShowResultPopup(false);
  };

  // Hàm làm lại bài kiểm tra từ đầu (đặt lại toàn bộ và đóng popup)
  const handleStartOver = () => {
    handleClearAnswers(); 
    setShowResultPopup(false); 
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) return <p>Đang tải bài kiểm tra...</p>; // Loading test...
  if (error) return <p className="error-message">Lỗi: {error}</p>; // Error: {error}

  // Phân loại câu hỏi Phần A (1-3) và Phần B (4-9) để render
  const partAQuestions = allQuestions.filter(q => q.id >= 1 && q.id <= 3); 
  const partBQuestions_CAR = allQuestions.find(q => q.id === 4); // Câu hỏi CAR (ID 4)
  const partBQuestions_Remaining = allQuestions.filter(q => q.id >= 5 && q.id <= 9); // Các câu hỏi Phần B còn lại (5-9)

  return (
    <div className="test-wrapper">
      {allQuestions.length === 0 && !loading ? (
        <p>Không có câu hỏi nào</p> // No questions available
      ) : (
        <div className="questions-container">
          <h2 className="test-title">BÀI KIỂM TRA CRAFFT</h2> {/* CRAFFT TEST */}

          {/* Phần A */}
          <div className="part-section">
            <h3 className="part-title">Phần A: Trong 12 THÁNG QUA, bạn đã:</h3> {/* Part A: During the PAST 12 MONTHS, on how many days did you: */}
            {partAQuestions.map((q) => ( // Render chỉ câu hỏi Phần A (1-3)
              <div key={q.id} className="question-text">
                <p>
                  <b>
                    {q.id}. {q.question_text}
                  </b>
                  <span className="instruction-text-inline"> (Điền “0” nếu không có.)</span> {/* (Put “0” if none.) */}
                </p>
                <div className="input-days-container">
                  <input
                    type="number"
                    min="0"
                    className="days-input"
                    value={partAChoices[q.id] || 0}
                    onChange={(e) => handlePartAChoice(q.id, e.target.value)}
                    placeholder="0"
                  />
                  <span className="days-label"> # số ngày</span> {/* # of days */}
                </div>
              </div>
            ))}
            <p className="instructions-partA">
                <span className="instruction-heading">ĐỌC CÁC HƯỚNG DẪN NÀY TRƯỚC KHI TIẾP TỤC:</span><br/> {/* READ THESE INSTRUCTIONS BEFORE CONTINUING: */}
                • Nếu bạn điền “0” vào TẤT CẢ các ô ở **câu hỏi 1-3** ở trên, sau đó hãy nộp bài.<br/> {/* If you put “0” in ALL of the boxes in **question 1-3** above, ANSWER QUESTION **4 (CAR)**, THEN STOP. */}
                • Nếu bạn điền “1” hoặc cao hơn vào BẤT KỲ ô nào ở **câu hỏi 1-3** ở trên, HÃY TRẢ LỜI CÁC CÂU HỎI 4-9. {/* If you put “1” or higher in ANY of the boxes in **question 1-3** above, OR if you answer **YES to question 4 (CAR)**, ANSWER QUESTIONS 5-9. */}
            </p>
          </div>

          {/* Phần B - Câu hỏi CRAFFT (bắt đầu từ câu 4) */}
          <div className="part-section">
            <h3 className="part-title">Phần B: Bảng câu hỏi CRAFFT (phiên bản 2.1)</h3> {/* Part B: The CRAFFT Questionnaire (version 2.1) */}
            <p className="instruction-text">Vui lòng trả lời tất cả các câu hỏi một cách trung thực; câu trả lời của bạn sẽ được giữ bí mật.</p> {/* Please answer all questions honestly; your answers will be kept confidential. */}
            <div className="choices-header">
                <span className="header-label">Không</span> {/* No */}
                <span className="header-label">Có</span> {/* Yes */}
            </div>

            {/* Render câu hỏi 4 (CAR) luôn luôn */}
            {partBQuestions_CAR && (
                <div key={partBQuestions_CAR.id} className="question-text question-partB">
                    <p>
                        <b>
                            {partBQuestions_CAR.id}. {partBQuestions_CAR.question_text}
                        </b>
                    </p>
                    <div className="choices-container">
                        {questionChoices
                            .filter((c) => Number(c.question_id) === Number(partBQuestions_CAR.id))
                            .map((choice) => (
                                <button
                                    key={choice.id}
                                    onClick={() => handlePartBChoice(partBQuestions_CAR.id, choice.score)}
                                    className={`button-base ${partBChoices[partBQuestions_CAR.id] === choice.score ? 'button-selected' : ''}`}
                                >
                                    {choice.choice_text}
                                </button>
                            ))}
                    </div>
                </div>
            )}

            {/* Render các câu hỏi Phần B còn lại (5-9) chỉ khi showFullPartB là true */}
            {showFullPartB && partBQuestions_Remaining.map((q) => ( 
                <div key={q.id} className="question-text question-partB">
                    <p>
                        <b>
                            {q.id}. {q.question_text}
                        </b>
                    </p>
                    <div className="choices-container">
                        {questionChoices
                            .filter((c) => Number(c.question_id) === Number(q.id))
                            .map((choice) => (
                                <button
                                    key={choice.id}
                                    onClick={() => handlePartBChoice(q.id, choice.score)}
                                    className={`button-base ${partBChoices[q.id] === choice.score ? 'button-selected' : ''}`}
                                >
                                    {choice.choice_text}
                                </button>
                            ))}
                    </div>
                </div>
            ))}
          </div> 
        </div> 
      )} 

      <hr className="divider" /> 
      
      <div className="action-buttons-container">
        <button
            onClick={handleClearAnswers}
            className="clear-button"
        >
            Xóa tất cả câu trả lời
        </button>
        <button
            onClick={handleSubmit}
            className="submit-button"
        >
            GỬI BÀI KIỂM TRA
        </button>
      </div>

      {showResultPopup && (
        <div className="popup-overlay">
          <div className="popup-content">
            <h3 className="popup-title">Kết quả bài kiểm tra</h3> {/* Test Results */}
            <p className="popup-text">Tổng điểm CRAFFT của bạn: <strong>{totalPartBScore}</strong></p> {/* Your total CRAFFT score: */}
            <p className="popup-text">Mức độ rủi ro: <strong className={`risk-level ${getRiskLevel(totalPartBScore).toLowerCase()}`}>{getRiskLevel(totalPartBScore)}</strong></p> {/* Risk Level: */}
            <div className="popup-actions">
              <button onClick={handleClosePopup} className="popup-button close-button">
                Đóng
              </button>
              <button onClick={handleStartOver} className="popup-button restart-button">
                Làm bài kiểm tra lại từ đầu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CRAFFT;