import "./Surveys.css";
import "bootstrap/dist/css/bootstrap.min.css";
import React from "react";
import Header from "../../components/Header/Header";
import { Link } from "react-router-dom";
// import Header from "../../components/PageHeader/Header";

const Surveys = () => {
  return (
    <>
      <Header />
    <div className="container ">

      <div className="card card_ASSIST" style={{ width: "18rem" }}>
        {/* <img src="https://iris.who.int/bitstream/handle/10665/44320/9789241599382_eng.pdf.jpg?sequence=40" className="card-img-top" alt="..." /> */}
        <div className="card-body">
          <h5 className="card-title">ASSIST Survey</h5>
          <p className="card-text">
            Assist means to help or support someone in completing a task or reaching a goal. 
            It can involve giving advice, offering physical help,
            or providing resources to make something easier or more successful.
          </p>
          <Link to="/ASSIST" className="btn btn-primary">
            Go survey
          </Link>
        </div>
      </div>

      <div className="card card_CRAFFT" style={{ width: "18rem" }}>
        {/* <img src="https://www.afterschoolnetwork.org/sites/main/files/imagecache/lightbox/main-images/migo_vmk_400x400.jpg" className="card-img-top" alt="..." /> */}
        <div className="card-body">
          <h5 className="card-title">CRAFFT Survey</h5>
          <p className="card-text">
            Assist means to help or support someone in completing a task or reaching a goal. 
            It can involve giving advice, offering physical help, or providing resources to make something easier or more successful.
          </p>
          <Link to="/CRAFFT" className="btn btn-primary">
            Go survey
          </Link>
        </div>
      </div>
    </div>
    </>
  );
};

export default Surveys;
