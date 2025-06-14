<<<<<<< HEAD
import "./App.css";
// package imports
import { BrowserRouter, Route, Routes } from "react-router-dom";
// compoment imports
import Header from "./components/Header/Header";
import MemberBookedConsultations from "./pages/MemberBookedConsultations/MemberBookedConsultations";
import Surveys from "./pages/Surveys/Surveys";
import CRAFFT from "./pages/Surveys/CRAFFT";
import HomePage from "./pages/HomePage/HomePage";

function App() {
  return (
    <BrowserRouter>
      <div className="app-container">
        <Header />
        <div className="content-container">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/Surveys" element={<Surveys />} />
            <Route path="/CRAFFT" element={<CRAFFT />} />
            <Route
              path="/booked-consultations"
              element={<MemberBookedConsultations />}
            />
            <Route path="*" element={<div>404 - Không tìm thấy trang</div>} />
          </Routes>
        </div>
=======
import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home/Home';
import Login from './pages/LoginAndRegister/Login';
import Register from './pages/LoginAndRegister/Register';
import MemberBookingConsultants from './pages/BookingForm/MemberBookingConsultants';
import UserProfile from './pages/UserProfile/UserProfile';
import Courses from './pages/Course/Courses';
import DetailsCourse from './pages/Course/DetailsCourse';
import MemberBookedConsultations from './pages/BookingForm/MemberBookedConsultations';
import FeedbackCourse from './pages/Course/FeedbackCourse';
function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/booking" element={<MemberBookingConsultants />} />
          <Route path="/UserProfile" element={<UserProfile />} />
          <Route path="/Courses" element={<Courses />} />
          <Route path="/Courses/lesson/:id" element={<DetailsCourse />} />
          <Route path="/MyBooking" element={<MemberBookedConsultations />} />
          <Route path="/Courses/lesson/:id/feedback" element={<FeedbackCourse />} />
        </Routes>
>>>>>>> 3e3cbbe1313f92b1a1afcfa43332f89b3354d8e0
      </div>
    </BrowserRouter>
  );
}

export default App;
