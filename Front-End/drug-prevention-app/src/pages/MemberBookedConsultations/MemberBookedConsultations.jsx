import "./MemberBookedConsultations.css";
import React, { useEffect, useState } from "react";
import ButonMemberBooked from "../../components/ButonMemberBooked/ButonMemberBooked.jsx";
import dataJson from "../../data/data.json";
import "bootstrap/dist/css/bootstrap.min.css";

const MemberBookedConsultations = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    setData(dataJson.booked);
  }, []);

  //    fetch("http://localhost:5002/api/data") // Đổi URL này thành API thật của bạn
  //     .then((res) => res.json())
  //     .then((json) => {
  //       setData(json.booked);
  //       setConsultants(json.consultants);
  //     });
  // }, []);
  // Lấy thông tin consultant theo tên
  const getConsultantInfo = (name) => {
    return dataJson.consultants.find((c) => c.name === name) || {};
  };

  const handleCancel = (id) => {
    setData((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <div className="member-book-container">
      <p className="page-title">My Booking</p>
      <div className="table-responsive">
        <table className="table">
          <thead>
            <tr>
              <th>STT</th>
              <th>Consultant</th>
              <th>Consultation Name</th>
              <th>Time</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item, idx) => {
              const consultantInfo = getConsultantInfo(item.consultant); // Sửa tại đây
              return (
                <tr key={item.id}>
                  <td>{idx + 1}</td>
                  <td>{item.consultant}</td>
                  <td>{item.consultationName}</td>
                  <td>{item.time}</td>
                  <td>{item.status}</td>
                  <td>
                    <ButonMemberBooked
                      onCancel={() => handleCancel(item.id)}
                      consultant={item.consultant}
                      consultationName={item.consultationName}
                      time={item.time}
                      status={item.status}
                      name={consultantInfo.name}
                      email={consultantInfo.email}
                      phone_number={consultantInfo.phone_number}
                      expertise={consultantInfo.expertise}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MemberBookedConsultations;

