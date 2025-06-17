import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import './ASSIST.css';
import Header from "../../components/Header/Header";

const API_URL = 'http://localhost:5002';

const ASSIST = () => {
    const [questions, setQuestions] = useState([]);
    const [choices, setChoices] = useState([]);
    const [substances, setSubstances] = useState([]);
    const [answers, setAnswers] = useState({});
    const [showPopup, setShowPopup] = useState(false);
    const [results, setResults] = useState(null);
    const [errorMessage, setErrorMessage] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    const navigate = useNavigate();

    useEffect(() => {
        const fetchTestData = async () => {
            try {
                setIsLoading(true);
                const [questionsRes, choicesRes, substancesRes] = await Promise.all([
                    fetch(`${API_URL}/test_questions`),
                    fetch(`${API_URL}/test_choices`),
                    fetch(`${API_URL}/assist_substances`)
                ]);

                const allQuestions = await questionsRes.json();
                const allChoices = await choicesRes.json();
                const assistSubstances = await substancesRes.json();

                const assistQuestions = allQuestions.filter(q => Number(q.category_id) === 2);
                const assistChoices = allChoices.filter(c =>
                    assistQuestions.some(q => Number(q.id) === Number(c.question_id))
                );

                setQuestions(assistQuestions.sort((a, b) => Number(a.question_order) - Number(b.question_order)));
                setChoices(assistChoices);
                setSubstances(assistSubstances);

            } catch (error) {
                console.error("Lỗi khi tải dữ liệu:", error);
                setErrorMessage("Không thể tải dữ liệu bài kiểm tra. Vui lòng thử lại.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchTestData();
    }, []);

    const q1Question = useMemo(() => {
        const foundQ = questions.find(q => Number(q.id) === 101);
        return foundQ;
    }, [questions]);

    const qInjectionQuestion = useMemo(() => {
        const foundQ = questions.find(q => Number(q.id) === 108);
        return foundQ;
    }, [questions]);

    const qInjectionFreqQuestion = useMemo(() => {
        const foundQ = questions.find(q => Number(q.id) === 109);
        return foundQ;
    }, [questions]);

    // Xóa định nghĩa qInjectionDaysQuestion (Q10)

    const qSubstanceSpecificQuestions = useMemo(() =>
        questions.filter(q => q.type === "Q_SUBSTANCE_SPECIFIC").sort((a, b) => Number(a.question_order) - Number(b.question_order)),
        [questions]
    );

    const mainQuestions = useMemo(() => {
        const orderedQuestions = [];
        if (q1Question) {
            orderedQuestions.push(q1Question);
        }
        if (qInjectionQuestion) {
            orderedQuestions.push(qInjectionQuestion);
        }
        return orderedQuestions.sort((a, b) => Number(a.question_order) - Number(b.question_order));
    }, [q1Question, qInjectionQuestion]);


    const getChoicesForQuestion = (questionId, subQuestionKey = null) => {
        if (!Array.isArray(choices)) {
            return [];
        }

        if (Number(questionId) === 101) {
            const filteredChoices = choices.filter(c =>
                Number(c.question_id) === 101 && c.sub_question_key === "any"
            );
            return filteredChoices;
        }
        else {
            const filteredChoices = choices.filter(c =>
                Number(c.question_id) === Number(questionId) &&
                c.sub_question_key === "any"
            );
            return filteredChoices;
        }
    };


    const handleAnswerChange = (questionId, choiceId, subQuestionKey = null) => {
        setAnswers(prev => {
            const newAnswers = { ...prev };
            if (subQuestionKey) {
                if (!newAnswers[questionId]) {
                    newAnswers[questionId] = {};
                }
                newAnswers[questionId][subQuestionKey] = choiceId;
            } else {
                newAnswers[questionId] = choiceId;
            }
            return newAnswers;
        });
        setErrorMessage('');
    };

    const selectedSubstances = useMemo(() => {
        if (!q1Question || !answers[q1Question.id]) {
            return [];
        }
        const selected = [];
        for (const subKey of (q1Question.sub_questions || []).map(sq => sq.key)) {
            if (subKey === "other_drugs") {
                continue;
            }
            const answerId = answers[q1Question.id]?.[subKey];
            const choice = choices.find(c => Number(c.id) === Number(answerId));
            if (choice && choice.score === 3) {
                selected.push(substances.find(s => s.key === subKey));
            }
        }
        return selected.filter(Boolean);
    }, [answers, q1Question, choices, substances]);

    const shouldSkipQ2toQ7 = useMemo(() => {
        if (!q1Question || !answers[q1Question.id]) return true;
        const anySubstanceSelected = (q1Question.sub_questions || []).some(sq => {
            if (sq.key === "other_drugs") return false;
            const answerId = answers[q1Question.id]?.[sq.key];
            const choice = choices.find(c => Number(c.id) === Number(answerId));
            return choice && choice.score === 3;
        });
        return !anySubstanceSelected;
    }, [answers, q1Question, choices]);

    const shouldSkipQ6toQ7ForSubstance = (substanceKey) => {
        const q2AnswerId = answers[102]?.[substanceKey];
        const q2Choice = choices.find(c => Number(c.id) === Number(q2AnswerId));
        return q2Choice && q2Choice.choice_text === "Chưa bao giờ";
    };

    const shouldShowInjectionQuestions = useMemo(() => {
        const q8AnswerId = answers[qInjectionQuestion?.id];
        const q8Choice = choices.find(c => Number(c.id) === Number(q8AnswerId));
        const shouldShow = q8Choice && q8Choice.choice_text === "Có, trong 3 tháng qua";
        return shouldShow;
    }, [answers, qInjectionQuestion, choices]);

    const getRiskLevelText = (riskLevel) => {
        switch (riskLevel) {
            case 'low': return 'Thấp';
            case 'medium': return 'Trung bình';
            case 'high': return 'Cao';
            default: return riskLevel;
        }
    };

    const calculateAssistScores = () => {
        let totalResults = [];
        let injectionStatus = null;

        selectedSubstances.forEach(substance => {
            let substanceScore = 0;
            qSubstanceSpecificQuestions.forEach(q => {
                if ((Number(q.id) === 106 || Number(q.id) === 107) && shouldSkipQ6toQ7ForSubstance(substance.key)) {
                    return;
                }
                const answerId = answers[q.id]?.[substance.key];
                const choice = choices.find(c => Number(c.id) === Number(answerId));
                if (choice) {
                    substanceScore += choice.score;
                }
            });

            let riskLevel = '';
            let recommendation = '';

            const isCannabis = substance.is_cannabis;
            const thresholdLow = isCannabis ? 4 : 3;
            const thresholdMedium = 26;

            if (substanceScore >= 0 && substanceScore <= thresholdLow) {
                riskLevel = 'low';
                recommendation = 'Tư vấn ngắn gọn (Brief education)';
            } else if (substanceScore > thresholdLow && substanceScore <= thresholdMedium) {
                riskLevel = 'medium';
                recommendation = 'Can thiệp ngắn (Brief intervention)';
            } else if (substanceScore > thresholdMedium) {
                riskLevel = 'high';
                recommendation = 'Can thiệp ngắn (Brief intervention), cân nhắc giới thiệu điều trị';
            }

            totalResults.push({
                substance: substance.name,
                score: substanceScore,
                riskLevel: riskLevel,
                recommendation: recommendation
            });
        });

        if (shouldShowInjectionQuestions) {
            const q9AnswerId = answers[qInjectionFreqQuestion?.id];
            const q9Choice = choices.find(c => Number(c.id) === Number(q9AnswerId));

            if (q9Choice) {
                const freqIsOncePerWeekOrLess = q9Choice.choice_text === "Một lần mỗi tuần hoặc ít hơn";
                // Do không có Q10, logic tiêm chích chỉ dựa vào Q9
                if (freqIsOncePerWeekOrLess) {
                    injectionStatus = {
                        level: 'medium',
                        recommendation: 'Can thiệp ngắn (Brief intervention) do tiêm chích (tần suất thấp)'
                    };
                } else {
                    injectionStatus = {
                        level: 'high',
                        recommendation: 'Can thiệp ngắn (Brief intervention), cân nhắc giới thiệu điều trị do tiêm chích (tần suất cao)'
                    };
                }
            } else {
                injectionStatus = {
                    level: 'high',
                    recommendation: 'Can thiệp ngắn (Brief intervention), cân nhắc giới thiệu điều trị (cần hoàn thành câu hỏi tần suất tiêm chích)'
                };
            }
        }

        setResults({ substanceScores: totalResults, injectionStatus: injectionStatus });
        setShowPopup(true);
    };

    const getOverallRiskLevel = useMemo(() => {
        if (!results) return 'low';

        let overallLevel = 'low';

        if (results.substanceScores.length > 0) {
            for (const res of results.substanceScores) {
                if (res.riskLevel === 'high') {
                    return 'high';
                }
                if (res.riskLevel === 'medium') {
                    overallLevel = 'medium';
                }
            }
        }

        if (results.injectionStatus) {
            if (results.injectionStatus.level === 'high') {
                return 'high';
            }
            if (results.injectionStatus.level === 'medium' && overallLevel === 'low') {
                overallLevel = 'medium';
            }
        }
        return overallLevel;
    }, [results]);


    const handleSubmit = () => {
        setErrorMessage('');
        let allAnswered = true;

        // Kiểm tra Q1
        if (q1Question) {
            const q1Answers = answers[q1Question.id];
            if (!q1Answers || (q1Question.sub_questions || []).some(sq => {
                if (sq.key === "other_drugs") return false; // Skip "other_drugs" for checking
                const isAnswered = !!q1Answers[sq.key];
                return !isAnswered;
            })) {
                allAnswered = false;
            }
        }

        // Kiểm tra Q2-Q7
        if (!shouldSkipQ2toQ7) {
            selectedSubstances.forEach(substance => {
                qSubstanceSpecificQuestions.forEach(q => {
                    if ((Number(q.id) === 106 || Number(q.id) === 107) && shouldSkipQ6toQ7ForSubstance(substance.key)) {
                        return; // Skip if condition met
                    }
                    const isSubstanceQuestionAnswered = answers[q.id] && answers[q.id][substance.key];
                    if (!isSubstanceQuestionAnswered) {
                        allAnswered = false;
                    }
                });
            });
        }

        // Kiểm tra câu hỏi tiêm chích (Q8, Q9)
        if (qInjectionQuestion) {
            const q8AnswerId = answers[qInjectionQuestion.id];

            if (!q8AnswerId) {
                allAnswered = false;
            } else if (shouldShowInjectionQuestions) { // Chỉ kiểm tra Q9 nếu Q8 là "Có, trong 3 tháng qua"
                const q9Answer = answers[qInjectionFreqQuestion?.id];

                if (!qInjectionFreqQuestion || !q9Answer) { // Chỉ kiểm tra Q9
                    allAnswered = false;
                }
            }
        }

        if (!allAnswered) {
            setErrorMessage("Vui lòng trả lời tất cả các câu hỏi được yêu cầu trước khi gửi.");
            return;
        }

        calculateAssistScores();
    };

    const handleClear = () => {
        setAnswers({});
        setResults(null);
        setShowPopup(false);
        setErrorMessage('');
    };

    // Hàm này sẽ được gọi khi nhấn nút "Gợi ý" trong popup
    const handleSuggestionClick = () => {
        const overallRisk = getOverallRiskLevel;
        let navigateTo = '';

        switch (overallRisk) {
            case 'low':
                navigateTo = '/CommunityActivities';
                break;
            case 'medium':
                navigateTo = '/Courses';
                break;
            case 'high':
                navigateTo = '/booking';
                break;
            default:
                navigateTo = '/';
        }

        if (navigateTo) {
            navigate(navigateTo);
        }
        setShowPopup(false); // Đóng popup sau khi chuyển hướng
    };


    if (isLoading) {
        return <div className="test-wrapper">Đang tải dữ liệu...</div>;
    }

    if (errorMessage && !questions.length) {
        return <div className="test-wrapper error-message">{errorMessage}</div>;
    }

    return (
        <>
            <Header />
            <div className="test-wrapper">
                <h1 className="test-title">Bài Kiểm Tra Sàng Lọc Mức Độ Liên Quan Đến Chất Gây Nghiện (ASSIST)</h1>
                <p className="instruction-text">
                    Chào mừng bạn đến với bài kiểm tra sàng lọc ASSIST. Chúng tôi sẽ hỏi một số câu hỏi về kinh nghiệm sử dụng các chất gây nghiện của bạn trong đời và trong ba tháng qua. Các chất này có thể được hút, nuốt, hít, tiêm hoặc dùng dưới dạng thuốc viên.
                </p>
                <p className="instruction-text instruction-heading">
                    Vui lòng trả lời thành thật nhất có thể.
                </p>

                <div className="questions-container">
                    {/* Câu hỏi 1: Sàng lọc chất */}
                    {q1Question && (
                        <div className="question-text">
                            <p><strong>1. {q1Question.question_text}</strong></p>
                            {(q1Question.sub_questions || []).map((subQ, index) => {
                                if (subQ.key === "other_drugs") {
                                    return null;
                                }
                                return (
                                    <div key={subQ.key} className="assist-sub-question-row">
                                        <span className="assist-sub-question-text">{`1.${index + 1}. ${subQ.text}`}</span>
                                        <div className="assist-sub-question-options">
                                            {getChoicesForQuestion(q1Question.id).map(choice => (
                                                <button
                                                    key={choice.id}
                                                    className={`button-base ${answers[q1Question.id]?.[subQ.key] === choice.id ? 'button-selected' : ''}`}
                                                    onClick={() => handleAnswerChange(q1Question.id, choice.id, subQ.key)}
                                                >
                                                    {choice.choice_text}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* Các câu hỏi từ 2 đến 7 (hiển thị động theo từng chất đã chọn) */}
                    {!shouldSkipQ2toQ7 && (
                        <div className="part-section">
                            <h2 className="part-title">Chi tiết sử dụng trong 3 tháng qua</h2>
                            <p className="instruction-text">
                                Vui lòng trả lời các câu hỏi sau cho từng chất bạn đã sử dụng trong đời.
                            </p>
                            {selectedSubstances.map(substance => (
                                <div key={substance.key} className="assist-substance-section">
                                    <h3 className="assist-substance-title">Chất: {substance.name}</h3>
                                    {qSubstanceSpecificQuestions.map((q) => {
                                        if ((Number(q.id) === 106 || Number(q.id) === 107) && shouldSkipQ6toQ7ForSubstance(substance.key)) {
                                            return null;
                                        }
                                        const qChoices = getChoicesForQuestion(q.id);

                                        const questionNumber = q.question_order;

                                        return (
                                            <div key={q.id} className="question-text assist-frequency-question">
                                                <p><strong>{questionNumber}. {q.question_text.replace('[SUBSTANCE_PLACEHOLDER]', `**${substance.name}**`)}</strong></p>
                                                <div className="question-options-container">
                                                    {qChoices.map(choice => (
                                                        <button
                                                            key={choice.id}
                                                            className={`button-base ${answers[q.id]?.[substance.key] === choice.id ? 'button-selected' : ''}`}
                                                            onClick={() => handleAnswerChange(q.id, choice.id, substance.key)}
                                                        >
                                                            {choice.choice_text}
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

                    {/* Câu hỏi 8: Tiêm chích */}
                    {qInjectionQuestion && (
                        <div className="question-text assist-injection-questions">
                            <p><strong>{qInjectionQuestion.question_order}. {qInjectionQuestion.question_text}</strong></p>
                            <div className="question-options-container">
                                {getChoicesForQuestion(qInjectionQuestion.id).map(choice => (
                                    <button
                                        key={choice.id}
                                        className={`button-base ${answers[qInjectionQuestion.id] === choice.id ? 'button-selected' : ''}`}
                                        onClick={() => handleAnswerChange(qInjectionQuestion.id, choice.id)}
                                    >
                                        {choice.choice_text}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {shouldShowInjectionQuestions && (
                        <div className="part-section">
                            <h2 className="part-title">Câu hỏi phụ về tiêm chích</h2>
                            {qInjectionFreqQuestion && (
                                <div className="question-text assist-injection-questions">
                                    <p><strong>{qInjectionFreqQuestion.question_order}. {qInjectionFreqQuestion.question_text}</strong></p>
                                    <div className="question-options-container">
                                        {getChoicesForQuestion(qInjectionFreqQuestion.id).map(choice => (
                                            <button
                                                key={choice.id}
                                                className={`button-base ${answers[qInjectionFreqQuestion.id] === choice.id ? 'button-selected' : ''}`}
                                                onClick={() => handleAnswerChange(qInjectionFreqQuestion.id, choice.id)}
                                            >
                                                {choice.choice_text}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                            {/* Xóa phần render qInjectionDaysQuestion (Q10) */}
                        </div>
                    )}

                    {errorMessage && <p className="error-message">{errorMessage}</p>}

                    <div className="action-buttons-container">
                        <button className="clear-button" onClick={handleClear}>Xóa Bài Làm</button>
                        <button className="submit-button" onClick={handleSubmit}>Gửi Bài Làm</button>
                    </div>
                </div>

                {showPopup && results && (
                    <div className="popup-overlay">
                        <div className="popup-content">
                            <h2 className="popup-title">Kết Quả Bài Kiểm Tra ASSIST</h2>
                            {results.substanceScores.length > 0 ? (
                                <>
                                    <p className="popup-text instruction-heading">Điểm và Khuyến nghị theo từng chất:</p>
                                    {results.substanceScores.map((res, index) => (
                                        <p key={index} className="popup-text assist-results-substance-item">
                                            <span>{res.substance}:</span> Tổng điểm: {res.score} - Mức độ: <span className={`risk-level ${res.riskLevel}`}>{getRiskLevelText(res.riskLevel)}</span>
                                            <br />Khuyến nghị: <span className={`risk-level ${res.riskLevel}`}>{res.recommendation}</span>
                                        </p>
                                    ))}
                                </>
                            ) : (
                                <p className="popup-text">Bạn chưa sử dụng bất kỳ chất nào được đề cập trong đời. Kết quả: <span className="risk-level low">Mức độ: Thấp</span></p>
                            )}

                            {results.injectionStatus && (
                                <p className="popup-text">
                                    <span>Tiêm chích ma túy:</span> Mức độ: <span className={`risk-level ${results.injectionStatus.level}`}>{getRiskLevelText(results.injectionStatus.level)}</span>
                                    <br />Khuyến nghị: <span className={`risk-level ${results.injectionStatus.level}`}>{results.injectionStatus.recommendation}</span>
                                </p>
                            )}

                            <p className="popup-text instruction-text">
                                Lưu ý: Kết quả này chỉ mang tính chất sàng lọc ban đầu và không thay thế cho đánh giá lâm sàng chuyên sâu.
                            </p>

                            <div className="popup-actions">
                                <button className="popup-button close-button action-button" onClick={() => setShowPopup(false)}>Đóng</button>
                                <button
                                    onClick={handleSuggestionClick}
                                    className={`popup-button suggestion-button action-button ${getOverallRiskLevel}`}
                                >
                                    Gợi ý: {getOverallRiskLevel === "low" && "Tham gia cộng đồng"}
                                    {getOverallRiskLevel === "medium" && "Khóa học"}
                                    {getOverallRiskLevel === "high" && "Đặt lịch"}
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