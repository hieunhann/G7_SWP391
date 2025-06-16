// import React, { useEffect, useState } from "react";
// import axios from "axios";

// const ViewBookedMembers = () => {
//   const [bookings, setBookings] = useState([]);
//   const [consultants, setConsultants] = useState([]);
//   const [loading, setLoading] = useState(true);

//   const [searchTerm, setSearchTerm] = useState("");
//   const [statusFilter, setStatusFilter] = useState("Tất cả");
//   const [startDate, setStartDate] = useState("");
//   const [endDate, setEndDate] = useState("");

//   // Giả sử consultantId là ID của consultant đã đăng nhập
//   const consultantId = "1"; // Thay đổi ID theo người dùng hiện tại

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const [bookingRes, consultantRes] = await Promise.all([
//           axios.get(
//             `http://localhost:3001/bookings?consultantId=${consultantId}`
//           ), // Lấy booking theo consultant
//           axios.get("http://localhost:3001/consultants"),
//         ]);

//         setBookings(bookingRes.data);
//         setConsultants(consultantRes.data);
//         setLoading(false);
//       } catch (error) {
//         console.error("Lỗi khi tải dữ liệu:", error);
//         setLoading(false);
//       }
//     };

//     fetchData();
//   }, [consultantId]);

//   const handleViewDetail = (booking) => {
//     const consultant = consultants.find(
//       (c) => c.ConsultantID === booking.ConsultantID
//     );
//     const consultantName = consultant ? consultant.Name : "Không rõ";

//     alert(
//       `Chi tiết Lịch hẹn:\n\n` +
//         `Họ tên: ${booking.MemberName}\n` +
//         `Email: ${booking.Email}\n` +
//         `SĐT: ${booking.Phone_number}\n` +
//         `Thời gian đặt: ${new Date(booking.Booking_time).toLocaleString()}\n` +
//         `Trạng thái: ${booking.Status}\n` +
//         `Mô tả: ${booking.Description}\n` +
//         `Lịch tư vấn: ${booking.Day_of_week} (${booking.Start_time} - ${booking.End_time})\n` +
//         `Chuyên gia: ${consultantName}`
//     );
//   };

//   const filteredBookings = bookings.filter((b) => {
//     const matchesSearch =
//       b.MemberName.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       b.Email.toLowerCase().includes(searchTerm.toLowerCase());

//     const matchesStatus =
//       statusFilter === "Tất cả" || b.Status === statusFilter;

//     const bookingDate = new Date(b.Booking_time);
//     const start = startDate ? new Date(startDate) : null;
//     const end = endDate ? new Date(endDate) : null;

//     if (start) start.setHours(0, 0, 0, 0);
//     if (end) end.setHours(23, 59, 59, 999);

//     const matchesDate =
//       (!start || bookingDate >= start) && (!end || bookingDate <= end);

//     return matchesSearch && matchesStatus && matchesDate;
//   });

//   const uniqueStatuses = ["Tất cả", "Pending", "Confirmed", "Completed"];

//   if (loading)
//     return <div className="text-center mt-5">Đang tải dữ liệu...</div>;

//   return (
//     <div className="container mt-5">
//       <h2 className="mb-4 text-primary">Danh sách lịch hẹn</h2>

//       {/* Tìm kiếm, lọc trạng thái, lọc ngày */}
//       <div className="mb-3 d-flex flex-wrap gap-3 align-items-center">
//         <input
//           type="text"
//           className="form-control"
//           placeholder="Tìm theo họ tên hoặc email..."
//           value={searchTerm}
//           onChange={(e) => setSearchTerm(e.target.value)}
//           style={{ maxWidth: "300px" }}
//         />
//         <select
//           className="form-select"
//           value={statusFilter}
//           onChange={(e) => setStatusFilter(e.target.value)}
//           style={{ maxWidth: "200px" }}
//         >
//           {uniqueStatuses.map((status) => (
//             <option key={status} value={status}>
//               {status}
//             </option>
//           ))}
//         </select>

//         <div>
//           <label htmlFor="startDate" className="form-label mb-0">
//             Từ ngày:
//           </label>
//           <input
//             type="date"
//             id="startDate"
//             className="form-control"
//             value={startDate}
//             onChange={(e) => setStartDate(e.target.value)}
//           />
//         </div>

//         <div>
//           <label htmlFor="endDate" className="form-label mb-0">
//             Đến ngày:
//           </label>
//           <input
//             type="date"
//             id="endDate"
//             className="form-control"
//             value={endDate}
//             onChange={(e) => setEndDate(e.target.value)}
//           />
//         </div>
//       </div>

//       <table className="table table-bordered table-hover">
//         <thead className="table-primary">
//           <tr>
//             <th>#</th>
//             <th>Họ tên</th>
//             <th>Email</th>
//             <th>SĐT</th>
//             <th>Thời gian đặt</th>
//             <th>Trạng thái</th>
//             <th>Mô tả</th>
//             <th>Lịch tư vấn</th>
//             <th>Chuyên gia</th>
//             <th>Hành động</th>
//           </tr>
//         </thead>
//         <tbody>
//           {filteredBookings.length > 0 ? (
//             filteredBookings.map((b, index) => {
//               const consultant = consultants.find(
//                 (c) => c.ConsultantID === b.ConsultantID
//               );
//               return (
//                 <tr key={b.BookingID}>
//                   <td>{index + 1}</td>
//                   <td>{b.MemberName}</td>
//                   <td>{b.Email}</td>
//                   <td>{b.Phone_number}</td>
//                   <td>{new Date(b.Booking_time).toLocaleString()}</td>
//                   <td>
//                     <span
//                       className={`badge bg-${
//                         b.Status === "Pending"
//                           ? "warning"
//                           : b.Status === "Confirmed"
//                           ? "info"
//                           : "success"
//                       }`}
//                     >
//                       {b.Status}
//                     </span>
//                   </td>

//                   <td>{b.Description}</td>
//                   <td>{`${b.Day_of_week} (${b.Start_time} - ${b.End_time})`}</td>
//                   <td>{consultant ? consultant.Name : "Không rõ"}</td>
//                   <td>
//                     <button
//                       className="btn btn-sm btn-primary"
//                       onClick={() => handleViewDetail(b)}
//                     >
//                       Xem chi tiết
//                     </button>
//                   </td>
//                 </tr>
//               );
//             })
//           ) : (
//             <tr>
//               <td colSpan="10" className="text-center">
//                 Không có kết quả phù hợp.
//               </td>
//             </tr>
//           )}
//         </tbody>
//       </table>
//     </div>
//   );
// };

// export default ViewBookedMembers;
