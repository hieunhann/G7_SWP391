import React, { useEffect, useState, useMemo } from "react";
import './CRAFFT.css';
import Header from "../../components/Header/Header";
import { useNavigate } from 'react-router-dom';

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
                backgroundColor: '#d4edda', // Màu xanh lá nhạt
                color: '#155724',          // Màu chữ xanh lá đậm
                border: '1px solid #c3e6cb'
            };
        case "Trung bình":
            return {
                backgroundColor: '#fff3cd', // Màu vàng nhạt
                color: '#856404',          // Màu chữ vàng đậm
                border: '1px solid #ffeeba'
            };
        case "Cao":
            return {
                backgroundColor: '#f8d7da', // Màu đỏ nhạt
                color: '#721c24',          // Màu chữ đỏ đậm
                border: '1px solid #f5c6cb'
            };
        default:
            return {}; // Trả về object rỗng nếu không khớp
    }
};
// --- KẾT THÚC HÀM MỚI ---


const CRAFFT = () => {
    const [allQuestions, setAllQuestions] = useState([]);
    const [partAChoices, setPartAChoices] = useState({});
    const [partBChoices, setPartBChoices] = useState({});
    const [questionChoices, setQuestionChoices] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showResultPopup, setShowResultPopup] = useState(false);
    const [resultScore, setResultScore] = useState(0); // Lưu trữ điểm số để hiển thị trong popup
    const [resultRiskLevel, setResultRiskLevel] = useState("Thấp"); // Lưu trữ mức độ rủi ro để hiển thị
    const [resultRecommendation, setResultRecommendation] = useState(""); // Lưu trữ khuyến nghị

    const [showFullPartB, setShowFullPartB] = useState(false);

    const navigate = useNavigate();

    const totalPartADaysForLogic = useMemo(() => {
        const days = (partAChoices[1] || 0) + (partAChoices[2] || 0) + (partAChoices[3] || 0);
        return days;
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

                const initialPartAChoices = {};
                questionsData.filter(q => q.id >= 1 && q.id <= 3).forEach(q => {
                    initialPartAChoices[q.id] = 0;
                });
                setPartAChoices(initialPartAChoices);

                const initialPartBChoices = {};
                questionsData.filter(q => q.id >= 4 && q.id <= 9).forEach(q => {
                    initialPartBChoices[q.id] = 0;
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

    const handlePartAChoice = (questionId, value) => {
        const numericValue = Number(value);
        setPartAChoices((prev) => ({ ...prev, [questionId]: numericValue }));
    };

    const handlePartBChoice = (questionId, score) => {
        setPartBChoices((prev) => ({ ...prev, [questionId]: score }));
    };

    useEffect(() => {
        const shouldShowFullPartB = totalPartADaysForLogic > 0;
        if (shouldShowFullPartB !== showFullPartB) {
            setShowFullPartB(shouldShowFullPartB);
        }
        // Nếu Part B không còn hiển thị, reset các lựa chọn của Part B
        if (!shouldShowFullPartB) {
            const resetPartBChoices = {};
            allQuestions.filter(q => q.id >= 4 && q.id <= 9).forEach(q => {
                resetPartBChoices[q.id] = 0;
            });
            setPartBChoices(resetPartBChoices);
        }
    }, [totalPartADaysForLogic, showFullPartB, allQuestions]);

    const totalPartBScore = useMemo(() => {
        let score = 0;
        Object.entries(partBChoices).forEach(([qId, choiceScore]) => {
            if (Number(qId) >= 4 && Number(qId) <= 9) {
                score += choiceScore;
            }
        });
        return score;
    }, [partBChoices]);


    const handleSubmit = () => {
        const partAQuestionsToSubmit = allQuestions.filter(q => q.id >= 1 && q.id <= 3);
        const allPartAAnswered = partAQuestionsToSubmit.every(q => partAChoices[q.id] !== undefined && partAChoices[q.id] !== null);

        if (!allPartAAnswered) {
            alert("Vui lòng trả lời tất cả các câu hỏi ở Phần A (câu 1-3).");
            return;
        }

        let finalScore = 0;
        let finalRiskLevel = "Thấp"; // Mặc định là Thấp
        let recommendationText = "";

        if (totalPartADaysForLogic === 0) {
            // Nếu tổng số ngày ở Phần A là 0, thì điểm CRAFFT là 0 và mức độ rủi ro là Thấp
            finalScore = 0;
            finalRiskLevel = "Thấp";
            recommendationText = getRecommendation("Thấp", totalPartADaysForLogic);
        } else {
            // Nếu tổng số ngày ở Phần A > 0, cần trả lời Phần B và tính điểm
            const partBQuestionsToAnswer = allQuestions.filter(q => q.id >= 4 && q.id <= 9);
            const allPartBRemainingAnswered = partBQuestionsToAnswer.every(q => partBChoices[q.id] !== undefined);
            if (!allPartBRemainingAnswered) {
                alert("Vui lòng trả lời tất cả các câu hỏi ở Phần B (câu 4-9) vì chúng đang hiển thị.");
                return;
            }
            finalScore = totalPartBScore;
            finalRiskLevel = getRiskLevel(finalScore);
            recommendationText = getRecommendation(finalRiskLevel, totalPartADaysForLogic);
        }

        setResultScore(finalScore);
        setResultRiskLevel(finalRiskLevel);
        setResultRecommendation(recommendationText); // Cập nhật khuyến nghị

        console.log("Trả lời Phần A (câu 1-3):", partAChoices);
        console.log("Trả lời Phần B (câu 4-9):", partBChoices);
        console.log("Tổng điểm CRAFFT của bạn:", finalScore);
        console.log("Mức độ rủi ro:", finalRiskLevel);
        console.log("Khuyến nghị:", recommendationText);

        setShowResultPopup(true);
    };

    const handleClearAnswers = () => {
        const initialPartAChoices = {};
        allQuestions.filter(q => q.id >= 1 && q.id <= 3).forEach(q => {
            initialPartAChoices[q.id] = 0;
        });
        setPartAChoices(initialPartAChoices);

        const initialPartBChoices = {};
        allQuestions.filter(q => q.id >= 4 && q.id <= 9).forEach(q => {
            initialPartBChoices[q.id] = 0;
        });
        setPartBChoices(initialPartBChoices);

        setShowFullPartB(false);
        setShowResultPopup(false);
        setResultScore(0); // Reset điểm số và mức độ rủi ro khi xóa câu trả lời
        setResultRiskLevel("Thấp");
        setResultRecommendation(""); // Reset khuyến nghị
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleClosePopup = () => {
        setShowResultPopup(false);
    };

    const handleSuggestionClick = () => {
        handleClearAnswers(); // Xóa câu trả lời trước khi chuyển hướng
        switch (resultRiskLevel) { // Sử dụng resultRiskLevel đã được tính toán
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

    if (loading) return <p>Đang tải bài kiểm tra...</p>;
    if (error) return <p className="error-message">Lỗi: {error}</p>;

    const partAQuestions = allQuestions.filter(q => q.id >= 1 && q.id <= 3);
    const partBQuestions_Full = allQuestions.filter(q => q.id >= 4 && q.id <= 9);

    return (
        <>
            <Header />
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
                                    <span className="instruction-heading">ĐỌC CÁC HƯỚNG DẪN NÀY TRƯỚC KHI TIẾP TỤNG:</span><br />
                                    • Nếu bạn điền “0” vào TẤT CẢ các ô ở **câu hỏi 1-3** ở trên, **HÃY DỪNG LẠI.**<br />
                                    • Nếu bạn điền “1” hoặc cao hơn vào BẤT KỲ ô nào ở **câu hỏi 1-3** ở trên, HÃY TRẢ LỜI CÁC CÂU HỎI **4-9** (Phần B).
                                </p>
                            </div>

                            {/* Phần B - Các câu hỏi CRAFFT còn lại (bắt đầu từ câu 4) */}
                            {showFullPartB && (
                                <div className="part-section">
                                    <h3 className="part-title">Phần B: Bảng câu hỏi CRAFFT (phiên bản 2.1)</h3>
                                    <p className="instruction-text">Bệnh nhân điền</p>
                                    <p className="instruction-text">Vui lòng trả lời tất cả các câu hỏi một cách trung thực; câu trả lời của bạn sẽ được giữ bí mật.</p>
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
                                            <p className="popup-text">
                                                Mức độ rủi ro của bạn: &nbsp;
                                                {/* Đã thêm inline style tại đây */}
                                                <span
                                                    className={`risk-level ${resultRiskLevel.toLowerCase().replace(' ', '-')}`}
                                                    style={getRiskLevelStyles(resultRiskLevel)}
                                                >
                                                    {resultRiskLevel}
                                                </span>
                                            </p>
                                        </>
                                    ) : (
                                        <>
                                            <p className="popup-text">
                                                Tổng điểm CRAFFT của bạn: <strong>{resultScore}</strong>.
                                            </p>
                                            <p className="popup-text">
                                                Mức độ rủi ro của bạn: &nbsp;
                                                {/* Đã thêm inline style tại đây */}
                                                <span
                                                    className={`risk-level ${resultRiskLevel.toLowerCase().replace(' ', '-')}`}
                                                    style={getRiskLevelStyles(resultRiskLevel)}
                                                >
                                                    {resultRiskLevel}
                                                </span>
                                            </p>
                                        </>
                                    )}
                                    <p className="popup-text recommendation-text">
                                        **Khuyến nghị:** {resultRecommendation}
                                    </p>
                                    <p className="popup-text">
                                        Lưu ý: Kết quả này chỉ mang tính chất sàng lọc ban đầu và không thay thế cho đánh giá lâm sàng chuyên sâu.
                                    </p>
                                    <div className="popup-actions">
                                        <button onClick={handleClosePopup} className="popup-button close-button action-button">
                                            Đóng
                                        </button>
                                        <button onClick={handleSuggestionClick} className="popup-button restart-button action-button">
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