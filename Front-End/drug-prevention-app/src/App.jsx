import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/PageHeader/Header'; 
import HomePage from './pages/HomePage/HomePage'; 
import MemberBookedConsultations from './pages/MemberBookedConsultations/MemberBookedConsultations';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app-container">
        <Header />
        <div className="content-container">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/booked-consultations" element={<MemberBookedConsultations />} />
            <Route path="*" element={<div>404 - Không tìm thấy trang</div>} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
