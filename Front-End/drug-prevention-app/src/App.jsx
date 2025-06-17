import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { GoogleOAuthProvider } from '@react-oauth/google';
import Home from "./pages/Home/Home";
import Login from "./pages/LoginAndRegister/Login";
import Register from "./pages/LoginAndRegister/Register";
import Header from "./components/Header/Header";
import Footer from "./components/Footer/Footer";
import ViewCommunicationPrograms from "./pages/ViewCommunicationPrograms/ViewCommunicationPrograms";
import ScheduleManager from "./pages/ScheduleManager/ScheduleManager";
import ViewBookedMembers from "./pages/ViewBookedMembers/ViewBookedMembers";
import BlogList from "./pages/Blog/BlogList";
import BlogDetail from "./pages/Blog/BlogDetail";

const GOOGLE_CLIENT_ID = "632195046938-srur4gsnmg8nc7rt0hmt1gvaibdij7g.apps.googleusercontent.com";

function App() {
  return (
    <div className="App">
      <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
        <Router>
          <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-grow">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/ScheduleManager" element={<ScheduleManager />} />
                <Route path="/blogs" element={<BlogList />} />
                <Route path="/blog/:id" element={<BlogDetail />} />
                <Route path="/ViewBookedMembers" element={<ViewBookedMembers />} />
                <Route path="/ViewCommunicationPrograms" element={<ViewCommunicationPrograms />} />
                <Route path="*" element={<div>404 - Không tìm thấy trang</div>} />
              </Routes>
            </main>
            <Footer />
          </div>
        </Router>
      </GoogleOAuthProvider>
    </div>
  );
}

export default App;
