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
    const [partAChoices, setPartAChoices] = useState({}); // Lưu trữ câu trả lời số ngày của Phần A (câu 1-3)
    const [partBChoices, setPartBChoices] = useState({}); // Lưu trữ câu trả lời Có/Không của Phần B (từ câu 4-9)
    const [questionChoices, setQuestionChoices] = useState([]); // Chứa tất cả các lựa chọn từ backend

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showResultPopup, setShowResultPopup] = useState(false);

    const [showFullPartB, setShowFullPartB] = useState(false); // Trạng thái quyết định hiển thị các câu 4-9

    // Tính tổng số ngày ở Phần A (chỉ câu 1, 2, 3) để quyết định hiển thị Phần B đầy đủ
    const totalPartADaysForLogic = useMemo(() => {
        // Đảm bảo chỉ tính các câu 1, 2, 3
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
                if (!resQuestions.ok) throw new Error("Không thể tải câu hỏi");
                const questionsData = await resQuestions.json();
                setAllQuestions(questionsData);

                const resChoices = await fetch(`http://localhost:${PORT}/test_choices`);
                if (!resChoices.ok) throw new Error("Không thể tải lựa chọn");
                const choicesData = await resChoices.json();
                setQuestionChoices(choicesData);

                // Khởi tạo partAChoices cho câu 1-3 với 0
                const initialPartAChoices = {};
                questionsData.filter(q => q.id >= 1 && q.id <= 3).forEach(q => {
                    initialPartAChoices[q.id] = 0; // Mặc định là 0 số ngày
                });
                setPartAChoices(initialPartAChoices);

                // Khởi tạo partBChoices cho câu 4-9 với 0 (mặc định "No" cho câu 4, hoặc 0 điểm cho các câu khác)
                const initialPartBChoices = {};
                questionsData.filter(q => q.id >= 4 && q.id <= 9).forEach(q => {
                    initialPartBChoices[q.id] = 0; // Mặc định là 0 (score của "No")
                });
                setPartBChoices(initialPartBChoices);

            } catch (err) {
                setError(err.message || "Lỗi khi tải dữ liệu bài kiểm tra");
            } finally {
                setLoading(false);
            }
        };

        fetchTestData();
    }, []);

    // Hàm xử lý thay đổi cho Phần A (nhập số ngày cho câu 1-3)
    const handlePartAChoice = (questionId, value) => {
        const numericValue = Number(value); // Ép kiểu về số
        setPartAChoices((prev) => ({ ...prev, [questionId]: numericValue }));
    };

    // Hàm xử lý thay đổi cho Phần B (Có/Không cho câu 4-9)
    const handlePartBChoice = (questionId, score) => {
        setPartBChoices((prev) => ({ ...prev, [questionId]: score }));
    };

    // Logic để xác định liệu có hiển thị toàn bộ Phần B (câu 4-9) hay không
    // Phần B chỉ hiển thị nếu có số ngày > 0 ở bất kỳ câu 1-3 nào
    useEffect(() => {
        const shouldShowFullPartB = totalPartADaysForLogic > 0;

        if (shouldShowFullPartB !== showFullPartB) {
            setShowFullPartB(shouldShowFullPartB);
        }

        // Nếu chuyển từ hiển thị Phần B đầy đủ sang không hiển thị,
        // thì đặt lại các câu trả lời Phần B từ câu 4 trở đi.
        if (!shouldShowFullPartB && showFullPartB) {
            // Đặt lại các câu trả lời Phần B về 0
            const resetPartBChoices = {};
            allQuestions.filter(q => q.id >= 4 && q.id <= 9).forEach(q => {
                resetPartBChoices[q.id] = 0; 
            });
            setPartBChoices(resetPartBChoices);
        }
    }, [totalPartADaysForLogic, showFullPartB, allQuestions]);


    // Tính tổng điểm cho Phần B (tất cả các câu hỏi Có/Không từ câu 4-9)
    const totalPartBScore = useMemo(() => {
        let score = 0;
        // Điểm từ các câu 4-9, lấy từ partBChoices
        Object.entries(partBChoices).forEach(([qId, choiceScore]) => {
            if (Number(qId) >= 4 && Number(qId) <= 9) { // Chỉ tính điểm cho các câu 4-9
                score += choiceScore;
            }
        });
        return score;
    }, [partBChoices]); // Phụ thuộc vào thay đổi của partBChoices

    // Hàm xử lý khi người dùng nhấn nút "GỬI BÀI KIỂM TRA"
    const handleSubmit = () => {
        // 1. Kiểm tra Phần A: Đảm bảo tất cả 3 câu hỏi Phần A đã được trả lời
        const partAQuestionsToSubmit = allQuestions.filter(q => q.id >= 1 && q.id <= 3);
        const allPartAAnswered = partAQuestionsToSubmit.every(q => partAChoices[q.id] !== undefined && partAChoices[q.id] !== null);

        if (!allPartAAnswered) {
            alert("Vui lòng trả lời tất cả các câu hỏi ở Phần A (câu 1-3).");
            return;
        }

        // 2. Nếu Part B đầy đủ đang hiển thị, cần trả lời các câu 4-9
        if (showFullPartB) {
            const partBQuestionsToAnswer = allQuestions.filter(q => q.id >= 4 && q.id <= 9);
            const allPartBRemainingAnswered = partBQuestionsToAnswer.every(q => partBChoices[q.id] !== undefined);
            if (!allPartBRemainingAnswered) {
                alert("Vui lòng trả lời tất cả các câu hỏi ở Phần B (câu 4-9) vì chúng đang hiển thị.");
                return;
            }
        }

        const level = getRiskLevel(totalPartBScore);
        console.log("Trả lời Phần A (câu 1-3):", partAChoices);
        console.log("Trả lời Phần B (câu 4-9):", partBChoices);
        console.log("Tổng điểm CRAFFT của bạn:", totalPartBScore);
        console.log("Mức độ rủi ro:", level);

        setShowResultPopup(true);
    };

    // Hàm để xóa tất cả các câu trả lời và đặt lại bài kiểm tra
    const handleClearAnswers = () => {
        // Đặt lại câu trả lời Phần A (câu 1-3) về 0
        const initialPartAChoices = {};
        allQuestions.filter(q => q.id >= 1 && q.id <= 3).forEach(q => {
            initialPartAChoices[q.id] = 0;
        });
        setPartAChoices(initialPartAChoices);

        // Đặt lại câu trả lời Phần B (câu 4-9) về 0
        const initialPartBChoices = {};
        allQuestions.filter(q => q.id >= 4 && q.id <= 9).forEach(q => {
            initialPartBChoices[q.id] = 0;
        });
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

    if (loading) return <p>Đang tải bài kiểm tra...</p>;
    if (error) return <p className="error-message">Lỗi: {error}</p>;

    // Phân loại câu hỏi Phần A (1-3) và Phần B (4-9) để render
    const partAQuestions = allQuestions.filter(q => q.id >= 1 && q.id <= 3);
    const partBQuestions_Full = allQuestions.filter(q => q.id >= 4 && q.id <= 9); // Bao gồm câu 4

    return (
        <div className="test-wrapper">
            {allQuestions.length === 0 && !loading ? (
                <p>Không có câu hỏi nào</p>
            ) : (
                <> 
                    <div className="questions-container">
                        <h2 className="test-title">BÀI KIỂM TRA CRAFFT</h2>

                        {/* Phần A */}
                        <div className="part-section">
                            <h3 className="part-title">Phần A: Trong 12 THÁNG QUA, bạn đã bao nhiêu ngày:</h3>
                            {partAQuestions.map((q) => (
                                <div key={q.id} className="question-text">
                                    <p>
                                        <b>
                                            {q.id}. {q.question_text}
                                        </b>
                                        <span className="instruction-text-inline"> (Điền “0” nếu không có.)</span>
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
                                        <span className="days-label"> # số ngày</span>
                                    </div>
                                </div>
                            ))}
                            <p className="instructions-partA">
                                <span className="instruction-heading">ĐỌC CÁC HƯỚNG DẪN NÀY TRƯỚC KHI TIẾP TỤC:</span><br />
                                • Nếu bạn điền “0” vào TẤT CẢ các ô ở **câu hỏi 1-3** ở trên, **HÃY DỪNG LẠI.**<br />
                                • Nếu bạn điền “1” hoặc cao hơn vào BẤT KỲ ô nào ở **câu hỏi 1-3** ở trên, HÃY TRẢ LỜI CÁC CÂU HỎI **4-9** (Phần B).
                            </p>
                        </div>

                        {/* Phần B - Các câu hỏi CRAFFT còn lại (bắt đầu từ câu 4) */}
                        {showFullPartB && ( // Chỉ hiển thị Phần B nếu điều kiện được đáp ứng
                            <div className="part-section">
                                <h3 className="part-title">Phần B: Bảng câu hỏi CRAFFT (phiên bản 2.1)</h3>
                                <p className="instruction-text">Bệnh nhân điền</p>
                                <p className="instruction-text">Vui lòng trả lời tất cả các câu hỏi một cách trung thực; câu trả lời của bạn sẽ được giữ bí mật.</p>
                                <div className="choices-header">
                                    <span className="header-label">Không</span>
                                    <span className="header-label">Có</span>
                                </div>

                                {partBQuestions_Full.map((q) => ( // Render các câu hỏi Phần B (4-9)
                                    <div key={q.id} className="question-text question-partB">
                                        <p>
                                            <b>
                                                {q.id}. {q.question_text}
                                            </b>
                                        </p>
                                        <div className="choices-container">
                                            {/*
                                                Lấy lựa chọn từ questionChoices. Nếu không có (ví dụ, backend thiếu dữ liệu cho câu 4),
                                                sử dụng mảng mặc định cho câu 4 để đảm bảo nút luôn hiển thị.
                                            */}
                                            {(q.id === 4 && questionChoices.filter((c) => Number(c.question_id) === Number(q.id)).length === 0
                                                ? [
                                                      { id: 'default_no_4', choice_text: "Không", score: 0 },
                                                      { id: 'default_yes_4', choice_text: "Có", score: 1 }
                                                  ]
                                                : questionChoices.filter((c) => Number(c.question_id) === Number(q.id))
                                            ).map((choice) => (
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
                        )} {/* Đóng thẻ Phần B section */}

                    </div> {/* Đóng thẻ questions-container */}

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
                                <h3 className="popup-title">Kết quả bài kiểm tra</h3>
                                <p className="popup-text">Tổng điểm CRAFFT của bạn: <strong>{totalPartBScore}</strong></p>
                                <p className="popup-text">Mức độ rủi ro: <strong className={`risk-level ${getRiskLevel(totalPartBScore).toLowerCase()}`}>{getRiskLevel(totalPartBScore)}</strong></p>
                                <div className="popup-actions">
                                    <button onClick={handleClosePopup} className="popup-button close-button action-button">
                                        Đóng
                                    </button>
                                    <button onClick={handleStartOver} className="popup-button restart-button action-button">
                                        Làm bài kiểm tra lại từ đầu
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </> 
            )} {/* Đóng khối điều kiện allQuestions.length === 0 */}
        </div>
    );
};

export default CRAFFT;