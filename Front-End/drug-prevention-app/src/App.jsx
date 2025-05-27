import { useState } from "react";
import "./App.css";
import Header from "./components/PageHeader/Header";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import MemberBookedConsultations from "./pages/MemberBookedConsultations/MemberBookedConsultations";

function App() {
  return (
    <BrowserRouter>
      <div className="app-container">
        <Header />
        <div className="content-container">
          <Routes>
            {/* <Route path="/" element={<h1>Home Page</h1>} /> */}
            <Route
              path="/booked-consultations"
              element={<MemberBookedConsultations />}
            />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
