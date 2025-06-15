import React, { useEffect, useState } from "react";
// import Header from "../../components/PageHeader/Header";
import Header from "../../components/Header/Header";
import { useNavigate } from "react-router-dom";
import NotifyLogin from "../../components/NotifyLogin/NotifyLogin";

const statusOptions = ["Tất cả", "Chờ xác nhận", "Đã xác nhận", "Hoàn thành", "Đã hủy"];

const MemberBookedConsultations = () => {
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

        const resBookings = await fetch(`http://localhost:5002/Bookings?memberId=${userId}`);
        if (!resBookings.ok) throw new Error("Không thể tải danh sách đặt lịch");
        const bookingsData = await resBookings.json();

        const consultantIds = [...new Set(bookingsData.map((b) => String(b.consultantId)))];
        if (consultantIds.length === 0) {
          setBookings([]);
          setLoading(false);
          return;
        }

        const resConsultants = await fetch(
          `http://localhost:5002/User?${consultantIds.map(id => `id=${id}`).join("&")}`
        );
        if (!resConsultants.ok) throw new Error("Không thể tải thông tin chuyên gia tư vấn");
        const consultantsData = await resConsultants.json();

        const enrichedBookings = bookingsData.map((b) => ({
          ...b,
          consultant: consultantsData.find((c) => String(c.id) === String(b.consultantId))
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

  const handleCancel = async (bookingId) => {
    if (!window.confirm("Bạn có chắc chắn muốn hủy lịch hẹn này không?")) return;
    try {
      const res = await fetch(`http://localhost:5002/Bookings/${bookingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "Đã hủy" }),
      });
      if (!res.ok) throw new Error("Hủy không thành công");
      setBookings((prev) =>
        prev.map((b) =>
          b.id === bookingId ? { ...b, status: "Đã hủy" } : b
        )
      );
    } catch (error) {
      console.error(error);
      alert("Hủy thất bại!");
    }
  };

  const filteredBookings =
    statusFilter === "Tất cả"
      ? bookings
      : bookings.filter((b) => b.status === statusFilter);

  return (
    <>
      <Header />
      <NotifyLogin
        show={showLoginPopup}
        onCancel={() => navigate("/")}
        message="Hãy đăng nhập để có thể xem lịch tư vấn nhé!!!"
        cancelText="Hủy"
        confirmText="Tiếp tục"
        redirectTo="/login"
      />
      {error !== "Hãy đăng nhập để xem lịch hẹn của bạn nhé!!!" && (
        <div className="container py-4">
          <h2 className="mb-4" style={{ color: "#004b8d", fontWeight: 700 }}>
            Danh sách lịch hẹn với chuyên gia tư vấn
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
              onChange={e => setStatusFilter(e.target.value)}
            >
              {statusOptions.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>
          {loading ? (
            <div>Đang tải dữ liệu...</div>
          ) : error && error !== "Hãy đăng nhập để xem lịch hẹn của bạn nhé!!!" ? (
            <div className="text-danger">{error}</div>
          ) : filteredBookings.length === 0 ? (
            <div>Bạn chưa có lịch hẹn nào.</div>
          ) : (
            <div className="table-responsive">
              <table className="table table-bordered table-hover">
                <thead className="table-primary text-center align-middle">
                  <tr>
                    <th>#</th>
                    <th>Tên chuyên gia</th>
                    <th>Email</th>
                    <th>Số điện thoại</th>
                    <th>Thời gian hẹn</th>
                    <th>Trạng thái</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody className="align-middle">
                  {filteredBookings.map((booking, idx) => {
                    const consultant = booking.consultant || {};
                    const dateObj = new Date(booking.bookingTime);
                    const dateStr = dateObj.toLocaleDateString("vi-VN");
                    const timeStr = dateObj.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
                    return (
                      <tr key={booking.id}>
                        <td>{idx + 1}</td>
                        <td>{consultant.fullName || "Chuyên gia tư vấn"}</td>
                        <td>{consultant.email || ""}</td>
                        <td>{consultant.phoneNumber || ""}</td>
                        <td>{`${dateStr} ${timeStr}`}</td>
                        <td>{booking.status}</td>
                        <td>
                          {booking.status === "Chờ xác nhận" && (
                            <button
                              className="btn btn-danger btn-sm"
                              onClick={() => handleCancel(booking.id)}
                            >
                              Hủy
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default MemberBookedConsultations;
