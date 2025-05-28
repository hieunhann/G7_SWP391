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

  // Hàm lấy thông tin consultant theo tên
  const getConsultantInfo = (name) => {
    return dataJson.consultants.find((c) => c.name === name) || {};
  };

  const handleCancel = (id) => {
    setData((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <div className="member-book-container">
      <p className="page-title">My Booking</p>

      <table className="table">
        <thead>
          <tr className="table-header">
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
            const consultantInfo = getConsultantInfo(item.consultant);
            return (
              <tr className="table-row" key={item.id}>
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
  );
};

export default MemberBookedConsultations;
