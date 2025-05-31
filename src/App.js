import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginForm from './components/LoginForm/LoginForm.jsx';
import RegisterForm from './components/RegisterForm/RegisterForm.jsx';
import BookingForm from './components/BookingForm/BookingForm.jsx';
  import Home from './components/Home/Home.jsx';
  
function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/login" element={<LoginForm />} />
          <Route path="/" element={<Home />} />
          <Route path="/register" element={<RegisterForm />} />
          <Route path="/booking" element={<BookingForm />} />
          {/* Add more routes as needed */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;
