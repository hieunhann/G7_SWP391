<<<<<<< HEAD
import './App.css'
import LoginForm from './LoginForm/LoginForm';

function App() {
  return (
    <div className="App">
      <h1>Drug Prevention Login</h1>
      <LoginForm />
    </div>
  )
=======
import { useState } from "react";
import "./App.css";
import Header from "./components/PageHeader/Header";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import MemberBookedConsultations from "./pages/MemberBookedConsultations/MemberBookedConsultations";
import Surveys from "./pages/Surveys/Surveys";
import CRAFFT from "./pages/Surveys/CRAFFT";

function App() {
  return (
    <BrowserRouter>
      <div className="app-container">
        <Header />
        <div className="content-container">
          <Routes>
            {/* <Route path="/" element={<h1>Home Page</h1>} /> */}
            <Route path="/booked-consultations" element={<MemberBookedConsultations />} />
            <Route path="/Surveys" element={<Surveys />} />
            <Route path="/CRAFFT" element={<CRAFFT />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
>>>>>>> 869ce11e269c80c7678a05f32119da5217fe2f67
}

export default App;
