import "./MemberBookedConsultations.css";
import "bootstrap/dist/css/bootstrap.min.css";
import React from "react";
import ButonMemberBooked from "../../components/ButonMemberBooked/ButonMemberBooked.jsx";

const MemberBookedConsultations = () => {
  return (
    <div className="container">
      <table className="table">
        <thead>
          <tr className="table-header">
            <th>STT</th>
            <th>Chuyên Viên Tư Vấn</th>
            <th>Tên tư vấn</th>
            <th>Thời gian</th>
            <th>Trạng thái</th>
            <th>Hành động</th>

          </tr>
        </thead>
        <tbody>
          <tr className="table-row">
            <td >1</td>
            <td>Tạ Hiểu Nhân</td>
            <td>Tư vấn tâm lý</td>
            <td>10:00 01/06/2025</td>
            <td>Đã đặt</td>
            <td><ButonMemberBooked /></td>

          </tr>
          <tr className="table-row">
            <td>2</td>
            <td>Tạ Hiểu Nhân</td>
            <td>Tư vấn sức khỏe</td>
            <td>14:00 03/06/2025</td>
            <td>Đã xác nhận</td>
            <td><ButonMemberBooked /></td>
    
          </tr>
          <tr className="table-row">
            <td>3</td>
            <td>Tạ Hiểu Nhân</td>
            <td>Tư vấn pháp lý</td>
            <td>09:00 05/06/2025</td>
            <td>Chờ xác nhận</td>
            <td><ButonMemberBooked /></td>

          </tr>
        </tbody>
      </table>
    </div>
    
  );
};

export default MemberBookedConsultations;
