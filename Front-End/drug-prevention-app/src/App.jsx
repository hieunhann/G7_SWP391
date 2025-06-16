import './styles/global.css';
import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home/Home";
import Login from "./pages/LoginAndRegister/Login";
import Register from "./pages/LoginAndRegister/Register";
import MemberBookingConsultants from "./pages/BookingForm/MemberBookingConsultants";
import UserProfile from "./pages/UserProfile/UserProfile";
import Courses from "./pages/Course/Courses";
import DetailsCourse from "./pages/Course/DetailsCourse";
import MemberBookedConsultations from "./pages/BookingForm/MemberBookedConsultations";
import FeedbackCourse from "./pages/Course/FeedbackCourse";
import Header from "./components/Header/Header";
import Footer from "./components/Footer/Footer";
import ViewCommunicationPrograms from "./pages/ViewCommunicationPrograms/ViewCommunicationPrograms";
import ScheduleManager from "./pages/ScheduleManager/ScheduleManager";
import ViewBookedMembers from "./pages/ViewBookedMembers/ViewBookedMembers";


function App() {
  return (
    <div className="App">
      <Router>
        <Header />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/booking" element={<MemberBookingConsultants />} />
          <Route path="/UserProfile" element={<UserProfile />} />
          <Route path="/Courses" element={<Courses />} />
          <Route path="/Courses/lesson/:id" element={<DetailsCourse />} />
          <Route path="/MyBooking" element={<MemberBookedConsultations />} />
          <Route path="/ScheduleManager" element={<ScheduleManager />} />
          <Route
            path="/ViewBookedMembers"
            element={<ViewBookedMembers />}
          />
          <Route
            path="/ViewCommunicationPrograms"
            element={<ViewCommunicationPrograms />}
          />
          <Route
            path="/Courses/lesson/:id/feedback"
            element={<FeedbackCourse />}
          />
          <Route path="*" element={<div>404 - Không tìm thấy trang</div>} />
        </Routes>
        <Footer />
      </Router>
    </div>
  );
}

export default App;
