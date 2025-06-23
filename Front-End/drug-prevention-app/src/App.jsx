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
import { GoogleOAuthProvider } from "@react-oauth/google";
import Footer from "./components/Footer/Footer";
import BlogList from "./pages/Blogs/BlogList";
import BlogDetail from "./pages/Blogs/BlogDetail";
import CRAFFT from "./pages/Surveys/CRAFFT";
import Surveys from "./pages/Surveys/Surveys";
import ASSIST from "./pages/Surveys/ASSIST";
import ScheduleManager from "./pages/ScheduleManager/ScheduleManager";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  return (
    <GoogleOAuthProvider clientId="632195046938-srur4gsnmg8nc7rt0hmt1gvaibdij7g.apps.googleusercontent.com">
      <div className="App">
        <Router>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/Surveys" element={<Surveys />} />
            <Route path="/CRAFFT" element={<CRAFFT />} />
            <Route path="/ASSIST" element={<ASSIST />} />
            <Route path="/booking" element={<MemberBookingConsultants />} />
            <Route path="/UserProfile" element={<UserProfile />} />
            <Route path="/Courses" element={<Courses />} />
            <Route path="/Courses/lesson/:id" element={<DetailsCourse />} />
            <Route path="/MyBooking" element={<MemberBookedConsultations />} />
            <Route path="/Courses/lesson/:id/feedback" element={<FeedbackCourse />} />
            <Route path="/blogs" element={<BlogList />} />
            <Route path="/blog/:id" element={<BlogDetail />} />
            <Route path="ScheduleManager" element={<ScheduleManager />} />
          </Routes>
          <Footer />
        </Router>

        <ToastContainer 
          position="top-right"
          autoClose={4000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
      </div>
    </GoogleOAuthProvider>
  );
}

export default App;
