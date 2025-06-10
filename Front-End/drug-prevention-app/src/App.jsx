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
import { GoogleOAuthProvider } from '@react-oauth/google';

<GoogleOAuthProvider clientId="632195046938-srur4gsnmg8nc7rt0hmt1gvaibdij7g.apps.googleusercontent.com">
  <App /> {/* hoặc component chính */}
</GoogleOAuthProvider>

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
      </div>
    </Router>
  );
}

export default App;
