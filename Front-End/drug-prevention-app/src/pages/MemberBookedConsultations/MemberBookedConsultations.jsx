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
        <table className="table table-bordered table-hover">
          <thead className="table-primary text-center align-middle">
            <tr>
              <th>#</th>
              <th>Consultant Name</th>
              <th>Consultant Email</th>
              <th>Consultant Phone</th>
              <th>Booking Time</th>
              <th>Consultation Status</th>
              <th>Detail</th>
            </tr>
          </thead>
          <tbody className="align-middle">
            {data.map((item, idx) => {
              const consultantInfo = getConsultantInfo(item.consultant);
              // Tìm booking_schedule theo booking_id
              const bookingSchedule = (dataJson.booking_schedule || []).find(
                (b) => b.booking_id === item.id
              );
              const status = bookingSchedule
                ? bookingSchedule.status
                : item.status;

              return (
                <tr key={item.id}>
                  <td>{idx + 1}</td>
                  <td style={{ textAlign: "left" }}>{consultantInfo.name}</td>
                  <td style={{ textAlign: "left" }}>{consultantInfo.email}</td>
                  <td style={{ textAlign: "left" }}>{consultantInfo.phone_number}</td>
                  <td style={{ textAlign: "right" }}>{item.time}</td>
                  <td style={{ textAlign: "left" }}>{status}</td>
                  <td>
                    <ButonMemberBooked
                      onCancel={() => handleCancel(item.id)}
                      consultant={item.consultant}
                      consultationName={item.consultationName}
                      time={item.time}
                      status={status}
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
