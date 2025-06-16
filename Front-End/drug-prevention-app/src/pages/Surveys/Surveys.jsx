import "./Surveys.css";
import "bootstrap/dist/css/bootstrap.min.css";
import React from "react";
import { Link } from "react-router-dom";

const Surveys = () => {
  return (
    <div className="container py-5">
      <h2 className="text-center mb-5">Khảo sát đánh giá</h2>
      
      <div className="row justify-content-center gap-4">
        <div className="col-md-5">
          <div className="card h-100">
            <img 
              src="https://iris.who.int/bitstream/handle/10665/44320/9789241599382_eng.pdf.jpg?sequence=40" 
              className="card-img-top" 
              alt="ASSIST Survey"
              style={{ height: '200px', objectFit: 'cover' }}
            />
            <div className="card-body d-flex flex-column">
              <h5 className="card-title">ASSIST Survey</h5>
              <p className="card-text">
                Assist means to help or support someone in completing a task or reaching a goal. 
                It can involve giving advice, offering physical help,
                or providing resources to make something easier or more successful.
              </p>
              <Link to="/Surveys" className="btn btn-primary mt-auto">
                Bắt đầu khảo sát
              </Link>
            </div>
          </div>
        </div>

        <div className="col-md-5">
          <div className="card h-100">
            <img 
              src="https://www.afterschoolnetwork.org/sites/main/files/imagecache/lightbox/main-images/migo_vmk_400x400.jpg" 
              className="card-img-top" 
              alt="CRAFFT Survey"
              style={{ height: '200px', objectFit: 'cover' }}
            />
            <div className="card-body d-flex flex-column">
              <h5 className="card-title">CRAFFT Survey</h5>
              <p className="card-text">
                Assist means to help or support someone in completing a task or reaching a goal. 
                It can involve giving advice, offering physical help, or providing resources to make something easier or more successful.
              </p>
              <Link to="/CRAFFT" className="btn btn-primary mt-auto">
                Bắt đầu khảo sát
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Surveys;
