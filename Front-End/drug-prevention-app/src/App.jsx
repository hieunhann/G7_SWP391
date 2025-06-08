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
      </div>
    </BrowserRouter>
  );
}

export default App;
