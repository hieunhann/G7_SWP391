import "./App.css";
import "./App.css";
// package imports
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
// component imports
import Header from "./components/Header/Header.jsx"; // Đường dẫn chính xác cho Header
import Home from "./pages/Home/Home.jsx";
import Surveys from "./pages/Surveys/Surveys.jsx"; // Đảm bảo tệp này là Surveys.jsx trong thư mục Surveys
import CRAFFT from "./pages/Surveys/CRAFFT.jsx"; // Đảm bảo tệp này là CRAFFT.jsx trong thư mục Surveys
import MemberBookedConsultations from "./pages/BookingForm/MemberBookedConsultations.jsx";
import Login from "./pages/LoginAndRegister/Login.jsx";
import Register from "./pages/LoginAndRegister/Register.jsx";
import MemberBookingConsultants from "./pages/BookingForm/MemberBookingConsultants.jsx";
import UserProfile from "./pages/UserProfile/UserProfile.jsx"; // Giả định tệp là UserProfile.jsx trong thư mục UserProfile
import Courses from "./pages/Course/Courses.jsx"; // Tên thư mục là 'Course', không phải 'Courses'
import DetailsCourse from "./pages/Course/DetailsCourse.jsx"; // Tên thư mục là 'Course', không phải 'Courses'
import FeedbackCourse from "./pages/Course/FeedbackCourse.jsx"; // Tên thư mục là 'Course', không phải 'Courses'
import CommunityActivities from "./pages/CommunityActivities/CommunityActivities.jsx";      // Giả định tệp là CommunityActivities.jsx trong thư mục CommunityActivities import RegisterActivity from "./pages/CommunityActivities/RegisterActivity.jsx"
import ASSIST from "./pages/Surveys/ASSIST.jsx";


// (Phần còn lại của hàm App và export default App)
  
function App() {
  return (
    <Router>
      <div className="app-container">
        
        <div className="content-container">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/Surveys" element={<Surveys />} />
            <Route path="/CRAFFT" element={<CRAFFT />} />
            <Route path="/ASSIST" element={<ASSIST />} />

            <Route path="/CommunityActivities" element={<CommunityActivities />} /> 

            <Route path="/booked-consultations" element={<MemberBookedConsultations />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/booking" element={<MemberBookingConsultants />} />
            <Route path="/UserProfile" element={<UserProfile />} />
            <Route path="/Courses" element={<Courses />} />
            <Route path="/Courses/lesson/:id" element={<DetailsCourse />} />
            <Route path="/MyBooking" element={<MemberBookedConsultations />} />
            <Route path="/Courses/lesson/:id/feedback" element={<FeedbackCourse />} />
            <Route path="*" element={<div>404 - Không tìm thấy trang</div>} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;