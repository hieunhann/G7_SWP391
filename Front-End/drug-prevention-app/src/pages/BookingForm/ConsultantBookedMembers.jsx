import React, { useEffect, useState } from "react";
import Header from "../../components/Header/Header";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../../Axios/Axios";

const statusOptions = [
  "Tất cả",
  "Chờ xác nhận",
  "Đã xác nhận",
  "Hoàn thành",
  "Đã hủy",
];

const ConsultantBookedMembers = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState("Tất cả");
  const [showLoginPopup, setShowLoginPopup] = useState(false);
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const userId = user.id;
  const navigate = useNavigate();

  useEffect(() => {
    if (!userId) {
      setShowLoginPopup(true);
      setLoading(false);
      return;
    }
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        // Lấy tất cả booking có consultantId là userId hiện tại
        const resBookings = await fetch(
          `http://localhost:5002/Bookings?consultantId=${userId}`
        );
        if (!resBookings.ok)
          throw new Error("Không thể tải danh sách đặt lịch");
        const bookingsData = await resBookings.json();
        // Lấy thông tin member
        const memberIds = [
          ...new Set(bookingsData.map((b) => String(b.memberId))),
        ];
        let membersData = [];
        if (memberIds.length > 0) {
          const resMembers = await fetch(
            `http://localhost:5002/User?${memberIds
              .map((id) => `id=${id}`)
              .join("&")}`
          );
          if (!resMembers.ok)
            throw new Error("Không thể tải thông tin thành viên");
          membersData = await resMembers.json();
        }
        const enrichedBookings = bookingsData.map((b) => ({
          ...b,
          member: membersData.find((m) => String(m.id) === String(b.memberId)),
        }));
        setBookings(enrichedBookings);
      } catch (err) {
        setError(err.message || "Đã xảy ra lỗi khi tải dữ liệu.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [userId, navigate]);

  const handleConfirm = async (bookingId) => {
    if (!window.confirm("Bạn có chắc chắn muốn xác nhận lịch hẹn này?")) return;
    try {
      const res = await fetch(`http://localhost:5002/Bookings/${bookingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "Đã xác nhận" }),
      });
      if (!res.ok) throw new Error("Xác nhận không thành công");
      setBookings((prev) =>
        prev.map((b) =>
          b.id === bookingId ? { ...b, status: "Đã xác nhận" } : b
        )
      );
    } catch (error) {
      console.error(error);
      alert("Xác nhận thất bại!");
    }
  };

  const handleCancel = async (bookingId) => {
    if (!window.confirm("Bạn có chắc chắn muốn hủy lịch hẹn này?")) return;
    try {
      const res = await fetch(`http://localhost:5002/Bookings/${bookingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "Đã hủy" }),
      });
      if (!res.ok) throw new Error("Hủy lịch không thành công");
      setBookings((prev) =>
        prev.map((b) => (b.id === bookingId ? { ...b, status: "Đã hủy" } : b))
      );
    } catch (error) {
      console.error(error);
      alert("Hủy lịch thất bại!");
    }
  };

  const filteredBookings =
    statusFilter === "Tất cả"
      ? bookings
      : bookings.filter((b) => b.status === statusFilter);

  // Sắp xếp bookings theo thứ tự ưu tiên trạng thái
  const statusPriority = {
    "Đã xác nhận": 1,
    "Chờ xác nhận": 2,
    "Hoàn thành": 3,
    "Đã hủy": 4,
  };
  const sortedBookings = [...filteredBookings].sort((a, b) => {
    return (statusPriority[a.status] || 99) - (statusPriority[b.status] || 99);
  });

  return (
    <>
      <Header />
      {/* Có thể thêm popup login nếu muốn */}
      <div className="container py-4">
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
          }}
        >
          <h2 className="mb-4" style={{ color: "#004b8d", fontWeight: 700 }}>
            Danh sách thành viên đã đặt lịch với bạn
          </h2>
          <div className="mb-3 d-flex align-items-center gap-2">
            <label htmlFor="statusFilter" style={{ fontWeight: 500 }}>
              Lọc theo trạng thái:
            </label>
            <select
              id="statusFilter"
              className="form-select"
              style={{ maxWidth: 200 }}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              {statusOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        </div>
        {loading ? (
          <div>Đang tải dữ liệu...</div>
        ) : error ? (
          <div className="text-danger">{error}</div>
        ) : sortedBookings.length === 0 ? (
          <div>Chưa có thành viên nào đặt lịch.</div>
        ) : (
          <div className="table-responsive">
            <table className="table table-bordered table-hover">
              <thead className="table-primary text-center align-middle">
                <tr>
                  <th>#</th>
                  <th>Tên thành viên</th>
                  <th>Email</th>
                  <th>Số điện thoại</th>
                  <th>Thời gian hẹn</th>
                  <th>Trạng thái</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody className="align-middle">
                {sortedBookings.map((booking, idx) => {
                  const member = booking.member || {};
                  const dateObj = new Date(booking.bookingTime);
                  const dateStr = dateObj.toLocaleDateString("vi-VN");
                  const timeStr = dateObj.toLocaleTimeString("vi-VN", {
                    hour: "2-digit",
                    minute: "2-digit",
                  });
                  return (
                    <tr key={booking.id}>
                      <td>{idx + 1}</td>
                      <td>{member.fullName || "Thành viên"}</td>
                      <td>{member.email || ""}</td>
                      <td>{member.phoneNumber || ""}</td>
                      <td>{`${dateStr} ${timeStr}`}</td>
                      <td>{booking.status}</td>
                      <td>
                        <div  style={{ display: "flex", justifyContent: "center", alignItems: "center", }}>
                        {booking.status === "Chờ xác nhận" && (
                          <>
                            <button
                              className="btn btn-success btn-sm me-2"
                              style={{ backgroundColor: "#0070cc" }}
                              onClick={() => handleConfirm(booking.id)}
                            >
                              Xác nhận
                            </button>
                            <button
                              className="btn btn-danger btn-sm"
                              style={{ backgroundColor: "#F06822" }}
                              onClick={() => handleCancel(booking.id)}
                            >
                              Từ Chối
                            </button>
                          </>
                        )}
                          {booking.status === "Đã xác nhận" &&
                            user.googleMeetLink && (
                              <button
                                className="btn btn-success btn-sm"
                                style={{ backgroundColor: "#2DD84E" }} 
                                onClick={() =>
                              window.open(user.googleMeetLink, "_blank")
                                }
                              >
                                Link
                              </button>
                            )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
};

export default ConsultantBookedMembers;
