
import React, { useState, useMemo } from 'react';

import { useNavigate } from 'react-router-dom';
import './ASSIST.css';
import Header from "../../components/Header/Header";

// Dữ liệu tĩnh cho câu hỏi, đáp án, substances
const questions = [
  {
    id: "101",
    category_id: 2,
    question_text: "Trong đời bạn, bạn đã từng sử dụng chất nào sau đây chưa?",
    question_order: 1,
    type: "Q1_SCREENING",
    sub_questions: [
      { key: "a", text: "Cần sa (ma túy, bồ đà, cỏ, nhựa cần, v.v.)" },
      { key: "b", text: "Cocain (kẹo, đá, v.v.)" },
      { key: "c", text: "Thuốc kích thích kê đơn chỉ để tìm cảm giác, dùng quá liều, hoặc không được kê đơn cho bạn. (Ritalin, Adderall, thuốc giảm cân, v.v.)" },
      { key: "d", text: "Ma túy đá (meth, crystal, speed, ecstasy, molly, v.v.)" },
      { key: "e", text: "Chất hít (nitrous, keo, dung môi sơn, poppers, whippets, v.v.)" },
      { key: "f", text: "Thuốc an thần chỉ để tìm cảm giác, dùng quá liều, hoặc không được kê đơn cho bạn. (thuốc ngủ, Valium, Xanax, thuốc trấn an, benzos, v.v.)" },
      { key: "g", text: "Chất gây ảo giác (LSD, acid, nấm, PCP, Special K, ecstasy, v.v.)" },
      { key: "h", text: "Opioid đường phố (heroin, thuốc phiện, v.v.)" },
      { key: "i", text: "Opioid kê đơn chỉ để tìm cảm giác, dùng quá liều, hoặc không được kê đơn cho bạn. (Fentanyl, Oxycodone, OxyContin, Percocet, Vicodin, methadone, Buprenorphine, v.v.)" },
      { key: "j", text: "Bất kỳ loại ma túy nào khác để 'phê'. Vui lòng ghi rõ:" }
    ]
  },
  { id: "102", category_id: 2, question_text: "Trong ba tháng qua, bạn đã sử dụng [SUBSTANCE_PLACEHOLDER] bao nhiêu lần?", question_order: 2, type: "Q_SUBSTANCE_SPECIFIC" },
  { id: "103", category_id: 2, question_text: "Trong ba tháng qua, bạn đã có cảm giác thèm muốn hoặc thôi thúc mạnh mẽ muốn sử dụng [SUBSTANCE_PLACEHOLDER] bao nhiêu lần?", question_order: 3, type: "Q_SUBSTANCE_SPECIFIC" },
  { id: "104", category_id: 2, question_text: "Trong ba tháng qua, việc sử dụng [SUBSTANCE_PLACEHOLDER] của bạn đã dẫn đến các vấn đề về sức khỏe, xã hội, pháp lý hoặc tài chính bao nhiêu lần?", question_order: 4, type: "Q_SUBSTANCE_SPECIFIC" },
  { id: "105", category_id: 2, question_text: "Trong ba tháng qua, bạn đã không làm được những điều bình thường mong đợi ở bạn vì việc sử dụng [SUBSTANCE_PLACEHOLDER] bao nhiêu lần?", question_order: 5, type: "Q_SUBSTANCE_SPECIFIC" },
  { id: "106", category_id: 2, question_text: "Đã bao giờ bạn bè, người thân hoặc bất kỳ ai khác bày tỏ lo ngại về việc sử dụng [SUBSTANCE_PLACEHOLDER] của bạn chưa?", question_order: 6, type: "Q_SUBSTANCE_SPECIFIC" },
  { id: "107", category_id: 2, question_text: "Bạn đã bao giờ thử và thất bại trong việc kiểm soát, cắt giảm hoặc ngừng sử dụng [SUBSTANCE_PLACEHOLDER] chưa?", question_order: 7, type: "Q_SUBSTANCE_SPECIFIC" },
  { id: "108", category_id: 2, question_text: "Bạn đã bao giờ sử dụng ma túy bằng cách tiêm chích chưa? (CHỈ SỬ DỤNG PHI Y TẾ)", question_order: 8, type: "Q_INJECTION" },
  { id: "109", category_id: 2, question_text: "Trong ba tháng qua, bạn đã tiêm chích ma túy bao nhiêu lần?", question_order: 9, type: "Q_INJECTION_FREQ" }
];

const choices = [
  { id: "101", question_id: 101, choice_text: "Không", score: 0, sub_question_key: "any" },
  { id: "102", question_id: 101, choice_text: "Có", score: 3, sub_question_key: "any" },
  { id: "103", question_id: 102, choice_text: "Chưa bao giờ", score: 0, sub_question_key: "any" },
  { id: "104", question_id: 102, choice_text: "Một hoặc hai lần", score: 2, sub_question_key: "any" },
  { id: "105", question_id: 102, choice_text: "Hàng tháng", score: 3, sub_question_key: "any" },
  { id: "106", question_id: 102, choice_text: "Hàng tuần", score: 4, sub_question_key: "any" },
  { id: "107", question_id: 102, choice_text: "Hàng ngày hoặc gần như hàng ngày", score: 6, sub_question_key: "any" },
  { id: "108", question_id: 103, choice_text: "Chưa bao giờ", score: 0, sub_question_key: "any" },
  { id: "109", question_id: 103, choice_text: "Một hoặc hai lần", score: 3, sub_question_key: "any" },
  { id: "110", question_id: 103, choice_text: "Hàng tháng", score: 4, sub_question_key: "any" },
  { id: "111", question_id: 103, choice_text: "Hàng tuần", score: 5, sub_question_key: "any" },
  { id: "112", question_id: 103, choice_text: "Hàng ngày hoặc gần như hàng ngày", score: 6, sub_question_key: "any" },
  { id: "113", question_id: 104, choice_text: "Chưa bao giờ", score: 0, sub_question_key: "any" },
  { id: "114", question_id: 104, choice_text: "Một hoặc hai lần", score: 4, sub_question_key: "any" },
  { id: "115", question_id: 104, choice_text: "Hàng tháng", score: 5, sub_question_key: "any" },
  { id: "116", question_id: 104, choice_text: "Hàng tuần", score: 6, sub_question_key: "any" },
  { id: "117", question_id: 104, choice_text: "Hàng ngày hoặc gần như hàng ngày", score: 7, sub_question_key: "any" },
  { id: "118", question_id: 105, choice_text: "Chưa bao giờ", score: 0, sub_question_key: "any" },
  { id: "119", question_id: 105, choice_text: "Một hoặc hai lần", score: 5, sub_question_key: "any" },
  { id: "120", question_id: 105, choice_text: "Hàng tháng", score: 6, sub_question_key: "any" },
  { id: "121", question_id: 105, choice_text: "Hàng tuần", score: 7, sub_question_key: "any" },
  { id: "122", question_id: 105, choice_text: "Hàng ngày hoặc gần như hàng ngày", score: 8, sub_question_key: "any" },
  { id: "123", question_id: 106, choice_text: "Không, chưa bao giờ", score: 0, sub_question_key: "any" },
  { id: "124", question_id: 106, choice_text: "Có, trong 3 tháng qua", score: 6, sub_question_key: "any" },
  { id: "125", question_id: 106, choice_text: "Có, nhưng không phải trong 3 tháng qua", score: 3, sub_question_key: "any" },
  { id: "126", question_id: 107, choice_text: "Không, chưa bao giờ", score: 0, sub_question_key: "any" },
  { id: "127", question_id: 107, choice_text: "Có, trong 3 tháng qua", score: 6, sub_question_key: "any" },
  { id: "128", question_id: 107, choice_text: "Có, nhưng không phải trong 3 tháng qua", score: 3, sub_question_key: "any" },
  { id: "129", question_id: 108, choice_text: "Không, chưa bao giờ", score: 0, sub_question_key: "any" },
  { id: "130", question_id: 108, choice_text: "Có, trong 3 tháng qua", score: 1, sub_question_key: "any" },
  { id: "131", question_id: 108, choice_text: "Có, nhưng không phải trong 3 tháng qua", score: 0, sub_question_key: "any" },
  { id: "132", question_id: 109, choice_text: "Một lần mỗi tuần hoặc ít hơn", score: 0, sub_question_key: "any" },
  { id: "133", question_id: 109, choice_text: "Hơn một lần mỗi tuần", score: 0, sub_question_key: "any" }
];

const substances = [
  { key: "a", name: "Cần sa (marijuana, pot, grass, hash, v.v.)", is_cannabis: true, id: "715d" },
  { key: "b", name: "Cocain (kẹo, đá, v.v.)", id: "02d6" },
  { key: "c", name: "Thuốc kích thích kê đơn (Ritalin, Adderall, thuốc giảm cân, v.v.)", id: "f1bd" },
  { key: "d", name: "Ma túy đá (meth, crystal, speed, ecstasy, molly, v.v.)", id: "204f" },
  { key: "e", name: "Chất hít (nitrous, keo, dung môi sơn, poppers, whippets, v.v.)", id: "637d" },
  { key: "f", name: "Thuốc an thần (thuốc ngủ, Valium, Xanax, thuốc trấn an, benzos, v.v.)", id: "dceb" },
  { key: "g", name: "Chất gây ảo giác (LSD, acid, nấm, PCP, Special K, ecstasy, v.v.)", id: "dc64" },
  { key: "h", name: "Opioid đường phố (heroin, thuốc phiện, v.v.)", id: "fae8" },
  { key: "i", name: "Opioid kê đơn (Fentanyl, Oxycodone, OxyContin, Percocet, Vicodin, methadone, Buprenorphine, v.v.)", id: "8875" },
  { key: "j", name: "Bất kỳ loại ma túy nào khác để 'phê'", id: "130e" }
];

const ASSIST = () => {
    const [answers, setAnswers] = useState({});
    const [showPopup, setShowPopup] = useState(false);
    const [results, setResults] = useState(null);
    const [errorMessage, setErrorMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    // const q1Question: Lấy câu hỏi 1 (screening) từ danh sách câu hỏi
    const q1Question = useMemo(() => {
        const foundQ = questions.find(q => Number(q.id) === 101);
        return foundQ;
    }, [questions]);

    // const qInjectionQuestion: Lấy câu hỏi tiêm chích (Q8)
    const qInjectionQuestion = useMemo(() => {
        const foundQ = questions.find(q => Number(q.id) === 108);
        return foundQ;
    }, [questions]);

    // const qInjectionFreqQuestion: Lấy câu hỏi tần suất tiêm chích (Q9)
    const qInjectionFreqQuestion = useMemo(() => {
        const foundQ = questions.find(q => Number(q.id) === 109);
        return foundQ;
    }, [questions]);

    // const qSubstanceSpecificQuestions: Lấy danh sách các câu hỏi liên quan đến từng chất (Q2-Q7)
    const qSubstanceSpecificQuestions = useMemo(() =>
        questions.filter(q => q.type === "Q_SUBSTANCE_SPECIFIC").sort((a, b) => Number(a.question_order) - Number(b.question_order)),
        [questions]
    );

    // const mainQuestions: Gom các câu hỏi chính (Q1 và Q8) theo thứ tự
    const mainQuestions = useMemo(() => {
        const orderedQuestions = [];
        if (q1Question) orderedQuestions.push(q1Question);
        if (qInjectionQuestion) orderedQuestions.push(qInjectionQuestion);
        return orderedQuestions.sort((a, b) => Number(a.question_order) - Number(b.question_order));
    }, [q1Question, qInjectionQuestion]);


    // const getChoicesForQuestion: Lấy danh sách đáp án cho một câu hỏi
    const getChoicesForQuestion = (questionId) =>
        choices.filter(c => Number(c.question_id) === Number(questionId) && c.sub_question_key === "any");

    // const handleAnswerChange: Cập nhật đáp án khi người dùng chọn
    const handleAnswerChange = (questionId, choiceId, subQuestionKey = null) => {
        setAnswers(prev => {
            const newAnswers = { ...prev };
            if (subQuestionKey) {
                newAnswers[questionId] = { ...(newAnswers[questionId] || {}), [subQuestionKey]: choiceId };
            } else {
                newAnswers[questionId] = choiceId;
            }
            return newAnswers;
        });
        setErrorMessage('');
    };

    // const selectedSubstances: Lấy danh sách các chất đã chọn "Có" ở câu 1
    const selectedSubstances = useMemo(() => {
        if (!questions[0] || !answers[questions[0].id]) return [];
        return questions[0].sub_questions
            .filter(sq => sq.key !== "other_drugs")
            .map(sq => {
                const answerId = answers[questions[0].id]?.[sq.key];
                const choice = choices.find(c => Number(c.id) === Number(answerId));
                return choice && choice.score === 3 ? substances.find(s => s.key === sq.key) : null;
            })
            .filter(Boolean);
    }, [answers]);

    // const shouldSkipQ2toQ7: Kiểm tra có cần hiển thị các câu hỏi 2-7 không (nếu chưa chọn chất nào ở câu 1 thì ẩn)
    const shouldSkipQ2toQ7 = useMemo(() => {
        if (!questions[0] || !answers[questions[0].id]) return true;
        return !questions[0].sub_questions.some(sq => {
            if (sq.key === "other_drugs") return false;
            const answerId = answers[questions[0].id]?.[sq.key];
            const choice = choices.find(c => Number(c.id) === Number(answerId));
            return choice && choice.score === 3;
        });
    }, [answers]);

    // const shouldSkipQ6toQ7ForSubstance: Kiểm tra có cần ẩn câu 6,7 cho chất nào đó không (nếu câu 2 của chất đó là "Chưa bao giờ")
    const shouldSkipQ6toQ7ForSubstance = (substanceKey) => {
        const q2AnswerId = answers[102]?.[substanceKey];
        const q2Choice = choices.find(c => Number(c.id) === Number(q2AnswerId));
        return q2Choice && q2Choice.choice_text === "Chưa bao giờ";
    };

    // const shouldShowInjectionQuestions: Kiểm tra có hiển thị câu hỏi phụ về tiêm chích không (nếu Q8 chọn "Có, trong 3 tháng qua")
    const shouldShowInjectionQuestions = useMemo(() => {
        const q8AnswerId = answers[qInjectionQuestion?.id];
        const q8Choice = choices.find(c => Number(c.id) === Number(q8AnswerId));
        const shouldShow = q8Choice && q8Choice.choice_text === "Có, trong 3 tháng qua";
        return shouldShow;
    }, [answers, qInjectionQuestion, choices]);

    // const getRiskLevelText: Đổi mã mức độ thành tiếng Việt
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
                navigateTo = '/ViewCommunicationPrograms';
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
                <div className="questions-container">
                    <h1 className="test-title">Bài Kiểm Tra Sàng Lọc Mức Độ Liên Quan Đến Chất Gây Nghiện (ASSIST)</h1>
                    <p className="instruction-text">
                        Chào mừng bạn đến với bài kiểm tra sàng lọc ASSIST. Chúng tôi sẽ hỏi một số câu hỏi về kinh nghiệm sử dụng các chất gây nghiện của bạn trong đời và trong ba tháng qua. Các chất này có thể được hút, nuốt, hít, tiêm hoặc dùng dưới dạng thuốc viên.
                    </p>
                    <p className="instruction-text instruction-heading">
                        Vui lòng trả lời thành thật nhất có thể.
                    </p>
                    {/* Câu hỏi 1 */}
                    {questions[0] && (
                        <div className="question-text">
                            <p><strong>1. {questions[0].question_text}</strong></p>
                            {questions[0].sub_questions.map((subQ, index) => subQ.key === "other_drugs" ? null : (
                                <div key={subQ.key} className="assist-sub-question-row">
                                    <span className="assist-sub-question-text">{`1.${index + 1}. ${subQ.text}`}</span>
                                    <div className="assist-sub-question-options">
                                        {getChoicesForQuestion(questions[0].id).map(choice => (
                                            <button
                                                key={choice.id}
                                                className={`button-base ${answers[questions[0].id]?.[subQ.key] === choice.id ? 'button-selected' : ''}`}
                                                onClick={() => handleAnswerChange(questions[0].id, choice.id, subQ.key)}
                                            >
                                                {choice.choice_text}
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
                                Vui lòng trả lời các câu hỏi sau cho từng chất bạn đã sử dụng trong đời.
                            </p>
                            {questions.filter(q => q.type === "Q_SUBSTANCE_SPECIFIC").map((q) => (
                                <div key={q.id} className="question-text assist-frequency-question">
                                    <p><strong>{q.question_order}. {q.question_text.replace('[SUBSTANCE_PLACEHOLDER]', '')}</strong></p>
                                    {selectedSubstances.map(substance => {
                                        // Luôn hiển thị substance cho mọi câu hỏi 2-7, KHÔNG skip với shouldSkipQ6toQ7ForSubstance
                                        return (
                                            <div key={substance.key} className="assist-substance-section" style={{ marginBottom: 8, display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 4, maxWidth: 400 }}>
                                                <div className="assist-substance-title" style={{ fontWeight: 500, fontSize: "0.98rem", textAlign: "left", marginBottom: 2 }}>
                                                    {substance.name}
                                                </div>
                                                <div className="question-options-container" style={{ width: "100%", display: "flex", flexWrap: "wrap", gap: 6 }}>
                                                    {getChoicesForQuestion(q.id).map(choice => (
                                                        <button
                                                            key={choice.id}
                                                            className={`button-base ${answers[q.id]?.[substance.key] === choice.id ? 'button-selected' : ''}`}
                                                            style={{ fontSize: "0.92rem", padding: "3px 10px", minWidth: 80, minHeight: 28 }}
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
                                            <div key={index} className="popup-text assist-results-substance-item" style={{marginBottom: 12}}>
                                            <div><span>{res.substance}:</span> Tổng điểm: {res.score}</div>
                                            <div style={{
                                                color: res.riskLevel === 'low' ? '#219653' : res.riskLevel === 'medium' ? '#e2b100' : '#d7263d',
                                                fontWeight: 600,
                                                margin: '2px 0'
                                            }}>
                                                Mức độ: {getRiskLevelText(res.riskLevel)}
                                            </div>
                                            <div style={{marginTop: 2}}>
                                                Khuyến nghị:
                                                <span style={{fontWeight: 500, color: res.riskLevel === 'low' ? '#219653' : res.riskLevel === 'medium' ? '#e2b100' : '#d7263d', marginLeft: 4}}>
                                                    {res.recommendation}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </>
                            ) : (
                                <p className="popup-text">Bạn chưa sử dụng bất kỳ chất nào được đề cập trong đời. Kết quả: <span className="risk-level low">Mức độ: Thấp</span></p>
                            )}

                            {results.injectionStatus && (
                                <div className="popup-text assist-results-substance-item" style={{marginBottom: 12}}>
                                    <div><span>Tiêm chích ma túy</span></div>
                                    <div style={{
                                        color: results.injectionStatus.level === 'low' ? '#219653' : results.injectionStatus.level === 'medium' ? '#e2b100' : '#d7263d',
                                        fontWeight: 600,
                                        margin: '2px 0'
                                    }}>
                                        Mức độ: {getRiskLevelText(results.injectionStatus.level)}
                                    </div>
                                    <div style={{marginTop: 2}}>
                                        Khuyến nghị:
                                        <span style={{fontWeight: 500, color: results.injectionStatus.level === 'low' ? '#219653' : results.injectionStatus.level === 'medium' ? '#e2b100' : '#d7263d', marginLeft: 4}}>
                                            {results.injectionStatus.recommendation}
                                        </span>
                                    </div>
                                </div>
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