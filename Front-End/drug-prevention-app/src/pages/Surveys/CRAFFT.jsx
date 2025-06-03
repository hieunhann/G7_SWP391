import "./CRAFFT.css";
import "bootstrap/dist/css/bootstrap.min.css";
import React, { useState } from "react";
import dataJson from "../../data/data.json";
import ButtonChecks from "../../components/ButtonChecks/ButtonChecks.jsx";

const CRAFFT = () => {
  const questions = dataJson.test_questions;
  const choices = dataJson.test_choices;
  const [answers, setAnswers] = useState({});

  // Lấy đáp án Yes/No cho từng câu hỏi
  const getOptions = (questionId) =>
    choices
      .filter((c) => c.Question_id === questionId)
      .map((c) => ({
        label: c.Choice_text,
        value: c.Score,
      }));

  const handleChange = (questionId, value) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Submit successfully" );
  };

  return (
    <>
      <div className="crafft-page-title">
        <h2 >CRAFFT Test</h2>

      </div>
      
      <div className="container mt-4 crafft-container">
        <form onSubmit={handleSubmit}>
          <div className="crafft-card" style={{ maxWidth: "1500px", margin: "0 auto" }}>
            <div className="crafft-card-body">
              {questions.map((q) => (
                <div key={q.ID} style={{ marginBottom: 24 }}>
                  <div style={{ marginBottom: 8, fontWeight: "bold" , textAlign: "left" }}>
                    {q.Question_text}
                  </div>
                  <ButtonChecks
                    name={`question_${q.ID}`}
                    options={getOptions(q.ID)}
                    value={answers[q.ID]}
                    onChange={(val) => handleChange(q.ID, val)}
                    inputClass="crafft-form-check-input"
                    labelClass="crafft-form-check-label"

                  />
                </div>
              ))}
              <button type="submit" className="crafft-btn">
                Submit
              </button>
            </div>
          </div>
        </form>
      </div>
    </>
  );
};

export default CRAFFT;
