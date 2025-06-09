import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/PageHeader/Header';
import Home from './pages/Home/Home';
import Login from './pages/LoginAndRegister/Login';
import Register from './pages/LoginAndRegister/Register';
import MemberBookingConsultants from './pages/BookingForm/MemberBookingConsultants';
import UserProfile from './pages/UserProfile/UserProfile';
import Courses from './pages/Course/Courses';
import DetailsCourse from './pages/Course/DetailsCourse';
import MemberBookedConsultations from './pages/BookingForm/MemberBookedConsultations';

function App() {
  return (
    <Router>
      <Header />
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
        </Routes>
      </div>
    </Router>
  );
}

export default App;
