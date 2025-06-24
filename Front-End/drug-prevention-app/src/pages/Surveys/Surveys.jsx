import "./Surveys.css";
import "bootstrap/dist/css/bootstrap.min.css";
import React from "react";
import Header from "../../components/Header/Header";
import { Link } from "react-router-dom";

const Surveys = () => {
  return (
    <>
      <Header />
      <div className="survey-container container">

        <div className="survey-card card" style={{ width: "18rem" }}>
          <img
            src="https://iris.who.int/bitstream/handle/10665/44320/9789241599382_eng.pdf.jpg?sequence=40"
            className="card-img-top"
            alt="ASSIST"
          />
          <div className="card-body">
            <h5 className="survey-title card-title text-center">Khảo sát ASSIST</h5>
            <p className="survey-description card-text">
              ASSIST là bộ công cụ sàng lọc do WHO khuyến nghị, giúp phát hiện mức độ sử dụng các chất gây nghiện và đưa ra khuyến nghị phù hợp cho từng cá nhân.
            </p>
            <Link to="/ASSIST" className="btn btn-primary survey-button">
              Làm khảo sát
            </Link>
          </div>
        </div>

        <div className="survey-card card" style={{ width: "18rem" }}>
          <img
            src="https://www.afterschoolnetwork.org/sites/main/files/imagecache/lightbox/main-images/migo_vmk_400x400.jpg"
            className="card-img-top"
            alt="CRAFFT"
          />
          <div className="card-body">
            <h5 className="survey-title card-title text-center">Khảo sát CRAFFT</h5>
            <p className="survey-description card-text">
              CRAFFT là công cụ đánh giá nguy cơ lạm dụng rượu, thuốc và chất kích thích dành cho thanh thiếu niên, giúp phát hiện sớm các vấn đề liên quan.
            </p>
            <Link to="/CRAFFT" className="btn btn-primary survey-button">
              Làm khảo sát
            </Link>
          </div>
        </div>

      </div>
    </>
  );
};

export default Surveys;
