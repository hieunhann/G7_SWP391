import React, { useEffect, useState } from "react";
import Header from "../../components/Header/Header";
import { useNavigate } from "react-router-dom";
import NotifyLogin from "../../components/Notify/NotifyLogin";
import api from "../../Axios/Axios";
import bookingServices from "../../apis/BookingAPIs";
import { getBookingDate } from "../../utils/Date";
import Sidebar from "../../components/Sidebar/Sidebar";

const statusOptions = [
  "Tất cả",
  "Chờ xác nhận",
  "Đã xác nhận",
  "Hoàn thành",
  "Đã hủy",
];

const BookedView = () => {
  // Xử lý xác nhận lịch hẹn
  const handleConfirm = async (bookingId) => {
    if (!window.confirm("Bạn có chắc chắn muốn xác nhận lịch hẹn này?")) return;
    try {
      const response = await api.put(`/bookings/setStatusConsultation/${bookingId}/Đã xác nhận`);
      if (!response.data) throw new Error("Xác nhận không thành công");
      setBookings((prev) =>
        prev.map((b) =>
          b.id === bookingId ? { ...b, status: "Đã xác nhận" } : b
        )
      );
    } catch (error) {
      alert("Xác nhận không thành công!");
    }
  };

  // Xử lý hủy lịch hẹn
  const handleCancel = async (bookingId) => {
    if (!window.confirm("Bạn có chắc chắn muốn hủy lịch hẹn này không?")) return;
    try {
      const response = await api.put(`/bookings/setStatusConsultation/${bookingId}/Đã hủy`);
      if (!response.data) throw new Error("Hủy thất bại!");
      setBookings((prev) =>
        prev.map((b) =>
          b.id === bookingId ? { ...b, status: "Đã hủy" } : b
        )
      );
    } catch (error) {
      alert("Hủy thất bại!");
    }
  };

  // Xử lý hoàn thành tư vấn
  const handleDone = async (bookingId) => {
    if (!window.confirm("Xác nhận đã hoàn thành tư vấn?")) return;
    try {
      const response = await api.put(`/bookings/setStatusConsultation/${bookingId}/Hoàn thành`);
      if (!response.data) throw new Error("Cập nhật không thành công");
      setBookings((prev) =>
        prev.map((b) =>
          b.id === bookingId ? { ...b, status: "Hoàn thành" } : b
        )
      );
    } catch (error) {
      alert("Cập nhật thất bại!");
    }
  };
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState("Tất cả");
  const [showLoginPopup, setShowLoginPopup] = useState(false);
  const [tableConfig, setTableConfig] = useState(null);
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const userId = user.id;
  const navigate = useNavigate();

  const consultantTableConfig = {
    headers: [
      "Tên thành viên",
      "Email",
      "Số điện thoại",
      "Thời gian hẹn",
      "Ghi chú của thành viên",
      "Trạng thái",
      "Thao tác",
    ],
    fields: [
      {
        name: "memberName",
        value: (booking) =>
          `${booking.member?.firstName || ""} ${
            booking.member?.lastName || ""
          }`,
      },
      { name: "memberEmail", value: "member.email" },
      { name: "memberPhone", value: "member.phoneNumber" },
      {
        name: "bookingTime",
        value: (booking) => getBookingDate(booking.bookingTime),
      },
      { name: "note", value: "note" },
      { name: "status", value: "status" },
      {
        name: "actions",
        value: (booking) => {
          return (
            <>
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
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
                      onClick={() => handleCancel(booking.id)}
                    >
                      Từ Chối
                    </button>
                  </>
                )}
                {booking.status === "Đã xác nhận" &&
                  booking.consultant.googleMeetLink && (
                    <>
                      <button
                        className="btn btn-success btn-sm me-2"
                        style={{ backgroundColor: "#2DD84E", border: "none" }}
                        onClick={() =>
                          window.open(booking.consultant.googleMeetLink)
                        }
                      >
                        Link
                      </button>
                      <button
                        className="btn btn-warning btn-sm"
                        onClick={() => handleDone(booking.id)}
                      >
                        Xác nhận hoàn thành
                      </button>
                    </>
                  )}
              </div>
            </>
          );
        },
      },
    ],
  };

  const memberTableConfig = {
    headers: [
      "Tên chuyên viên tư vấn",
      "Email",
      "Số điện thoại",
      "Thời gian hẹn",
      "Ghi chú",
      "Trạng thái",
      "Thao tác",
    ],
    fields: [
      {
        name: "consultantName",
        value: (booking) =>
          `${booking.consultant?.firstName || ""} ${
            booking.consultant?.lastName || ""
          }`,
      },
      { name: "consultantEmail", value: "consultant.email" },
      { name: "consultantPhone", value: "consultant.phoneNumber" },
      {
        name: "bookingTime",
        value: (booking) => getBookingDate(booking.bookingTime),
        style: {
          textAlign: "right",
        },
      },
      { name: "note", value: "note" },
      { name: "status", value: "status" },
      {
        name: "actions",
        value: (booking) => (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            {booking.status === "Chờ xác nhận" && (
              <button
                className="btn btn-danger btn-sm"
                style={{ marginRight: 8 }}
                onClick={() => handleCancel(booking.id)}
              >
                Hủy
              </button>
            )}
            {booking.status === "Đã xác nhận" && (
              <button
                className="btn btn-success btn-sm"
                onClick={() =>
                  window.open(
                    booking.googleMeetLink || "https://meet.google.com/",
                    "_blank"
                  )
                }
              >
                Link
              </button>
            )}
          </div>
        ),
      },
    ],
  };

  useEffect(() => {
    if (!userId) {
      setShowLoginPopup(true);
      setLoading(false);
      return;
    }
    if (user.role?.toLowerCase() === "consultant") {
      setTableConfig(consultantTableConfig);
    } else {
      setTableConfig(memberTableConfig);
    }

    fetchData();
  }, [userId, navigate]);

  const getValueByPath = (obj, path) => {
    return path.split(".").reduce((acc, part) => acc && acc[part], obj);
  };
  const fetchData = async () => {
    if (!userId) {
      setError("Hãy đăng nhập để xem lịch hẹn của bạn nhé!!!");
      setLoading(false);
      return;
    } else {
      try {
        setLoading(true);
        setError(null);

        console.log("Fetching bookings for user.role: ", user);
        var data = [];
        if (user.role?.toLowerCase() !== "consultant") {
          data = await bookingServices.getListBookingByMemberId(userId);
        } else {
          data = await bookingServices.getListBookingByConsultantId(userId);
        }

        if (Array.isArray(data)) {
          setBookings(data);
        }
      } catch (error) {
        setError(
          error.message ||
            "Đã xảy ra lỗi khi tải dữ liệu. Vui lòng thử lại sau."
        );
      } finally {
        setLoading(false);
      }
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
      <NotifyLogin
        show={showLoginPopup}
        onCancel={() => navigate("/")}
        message="Hãy đăng nhập để có thể xem lịch tư vấn nhé!!!"
        cancelText="Hủy"
        confirmText="Tiếp tục"
        redirectTo="/login"
      />
      <div className="flex">
        <Sidebar />
        <div className="flex-1 ml-[150px]">
          <main className="pt-4 pb-5 mb-4 container">
            {error !== "Hãy đăng nhập để xem lịch hẹn của bạn nhé!!!" && (
              <div className="container pt-4 pb-5 mb-4 ">
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-start",
                  }}
                >
                  <h2 className="text-4xl font-extrabold text-left text-[#004b8d] mb-8 border-b-4 border-[#0070cc] pb-2">
                    {user.role?.toLowerCase() !== "consultant"
                      ? "Danh sách lịch hẹn với chuyên gia tư vấn"
                      : "Danh sách thành viên đã đặt lịch với bạn"}
                  </h2>
                  {/* Ô đếm trạng thái và bộ lọc nằm cùng hàng */}
                  <div className="mb-4 w-100 d-flex gap-3 align-items-center" style={{ justifyContent: "flex-start", flexWrap: "wrap" }}>
                    {user.role?.toLowerCase() === "consultant" &&
                      (() => {
                        const statusCounts = {
                          "Chờ xác nhận": 0,
                          "Đã xác nhận": 0,
                          "Hoàn thành": 0,
                          "Đã hủy": 0,
                        };
                        const statusColors = {
                          "Chờ xác nhận": "#0070cc",
                          "Đã xác nhận": "#ffc107",
                          "Hoàn thành": "#2DD84E",
                          "Đã hủy": "#dc3545",
                        };
                        bookings.forEach((b) => {
                          if (statusCounts.hasOwnProperty(b.status)) {
                            statusCounts[b.status]++;
                          }
                        });
                        return Object.entries(statusCounts).map(([status, count]) => (
                          <div
                            key={status}
                            className="px-3 py-2 rounded shadow-sm border"
                            style={{
                              background: "#f8f9fa",
                              minWidth: 120,
                              textAlign: "center",
                              borderColor: statusColors[status],
                              marginBottom: 8,
                            }}
                          >
                            <div style={{ fontWeight: 600, color: statusColors[status] }}>{status}</div>
                            <div style={{ fontSize: 22, fontWeight: 700, color: statusColors[status] }}>{count}</div>
                          </div>
                        ));
                      })()}
                    {/* Bộ lọc trạng thái nằm cùng hàng */}
                    <div className="d-flex align-items-center gap-2" style={{ marginLeft: 16 }}>
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
                </div>
                {loading ? (
                  <div>Đang tải dữ liệu...</div>
                ) : error &&
                  error !== "Hãy đăng nhập để xem lịch hẹn của bạn nhé!!!" ? (
                  <div className="text-danger">{error}</div>
                ) : sortedBookings.length === 0 ? (
                  <div>Bạn chưa có lịch hẹn nào.</div>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-bordered table-hover">
                      <thead className="table-primary text-center align-middle">
                        <tr>
                          <th>#</th>
                          {tableConfig &&
                            tableConfig.headers
                              .filter(
                                (header) =>
                                  !(user.role?.toLowerCase() !== "consultant" && header === "Ghi chú của thành viên")
                              )
                              .map((header, idx) => <th key={header}>{header}</th>)}
                        </tr>
                      </thead>
                      <tbody className="align-middle">
                        {sortedBookings.map((booking, idx) => {
                          // ...existing code...
                          return (
                            <tr key={booking.id || idx}>
                              <td>{idx + 1}</td>
                              {tableConfig &&
                                tableConfig.fields
                                  .filter(
                                    (field) =>
                                      !(user.role?.toLowerCase() !== "consultant" && field.name === "note" && tableConfig.headers.includes("Ghi chú của thành viên"))
                                  )
                                  .map((field) => (
                                    <td key={field.name} style={field.style || {}}>
                                      {typeof field.value === "string"
                                        ? getValueByPath(booking, field.value)
                                        : field.value(booking)}
                                    </td>
                                  ))}
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </main>
        </div>
      </div>
    </>
  );
};

export default BookedView;
