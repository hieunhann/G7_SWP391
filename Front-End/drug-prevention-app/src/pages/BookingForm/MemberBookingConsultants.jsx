import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../components/PageHeader/Header";
import NotifyLogin from "../../components/NotifyLogin/NotifyLogin";

const allTimeSlots = [
  "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "13:00", "13:30", "14:00", "14:30", "15:00", "15:30"
];

const toMinutes = (timeStr) => {
  const [h, m] = timeStr.split(":").map(Number);
  return h * 60 + m;
};

const getVietnameseDayOfWeek = (dateStr) => {
  const days = [
    "Chủ Nhật", "Thứ Hai", "Thứ Ba", "Thứ Tư",
    "Thứ Năm", "Thứ Sáu", "Thứ Bảy"
  ];
  const d = new Date(dateStr);
  return days[d.getDay()];
};

const MemberBookingConsultants = () => {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState("");
  const [availableConsultants, setAvailableConsultants] = useState([]);
  const [selectedConsultant, setSelectedConsultant] = useState("");
  const [bookedSlots, setBookedSlots] = useState([]);
  const [workingSlots, setWorkingSlots] = useState([]);
  const [selectedTime, setSelectedTime] = useState("");
  const [notes, setNotes] = useState("");
  const [showLoginPopup, setShowLoginPopup] = useState(false);
  const [loading, setLoading] = useState(true);
  const [popup, setPopup] = useState({ message: "", type: "" });

  const todayStr = new Date().toISOString().split("T")[0];

  useEffect(() => {
    if (popup.message) {
      const timer = setTimeout(() => {
        setPopup({ message: "", type: "" });
      }, 7000);
      return () => clearTimeout(timer);
    }
  }, [popup]);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "null");
    const userId = user?.id;

    if (!userId) {
      setShowLoginPopup(true);
      setLoading(false);
      return;
    }

    const fetchAvailableConsultants = async () => {
      if (!selectedDate) return setAvailableConsultants([]);

      // Sử dụng hàm mới để lấy đúng thứ tiếng Việt
      const dayOfWeek = getVietnameseDayOfWeek(selectedDate);

      try {
        const res = await fetch(`http://localhost:5002/Schedule?dayOfWeek=${encodeURIComponent(dayOfWeek)}`);
        const schedules = await res.json();
        const consultantIds = [...new Set(schedules.map(s => s.consultantId))];

        const usersRes = await fetch(`http://localhost:5002/User`);
        const users = await usersRes.json();
        // Ép kiểu id về string để so sánh chắc chắn
        const consultants = users.filter(u => consultantIds.includes(String(u.id)));

        setAvailableConsultants(consultants);
      } catch (err) {
        console.error("Không thể tải danh sách tư vấn viên:", err);
        setAvailableConsultants([]);
      }

      setSelectedConsultant("");
      setSelectedTime("");
      setBookedSlots([]);
      setWorkingSlots([]);
    };

    fetchAvailableConsultants();
  }, [selectedDate]);

  useEffect(() => {
    const fetchSlots = async () => {
      if (!selectedConsultant || !selectedDate) return;

      // Sử dụng hàm mới để lấy đúng thứ tiếng Việt
      const dayOfWeek = getVietnameseDayOfWeek(selectedDate);

      try {
        const bookingsRes = await fetch(`http://localhost:5002/Bookings?consultantId=${selectedConsultant}`);
        const bookings = await bookingsRes.json();
        const booked = bookings
          .filter(b => b.bookingTime.startsWith(selectedDate))
          .map(b => b.bookingTime.substring(11, 16));
        setBookedSlots(booked);

        const scheduleRes = await fetch(`http://localhost:5002/Schedule?consultantId=${selectedConsultant}&dayOfWeek=${encodeURIComponent(dayOfWeek)}`);
        const schedule = await scheduleRes.json();

        if (schedule.length > 0) {
          const { startTime, endTime } = schedule[0];
          const start = startTime.substring(0, 5);
          const end = endTime.substring(0, 5);

          const validSlots = allTimeSlots.filter(slot => {
            const mins = toMinutes(slot);
            return mins >= toMinutes(start) && mins < toMinutes(end);
          });

          setWorkingSlots(validSlots);
        } else {
          setWorkingSlots([]);
        }
      } catch (err) {
        console.error("Lỗi tải lịch làm việc hoặc đặt lịch:", err);
        setBookedSlots([]);
        setWorkingSlots([]);
      }

      setSelectedTime("");
    };

    fetchSlots();
  }, [selectedConsultant, selectedDate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedDate || !selectedTime || !selectedConsultant) {
      setPopup({ message: "Vui lòng chọn ngày, tư vấn viên và giờ.", type: "error" });
      return;
    }

    const bookingTime = `${selectedDate}T${selectedTime}:00`;

    try {
      const res = await fetch("http://localhost:5002/Bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          memberId: JSON.parse(localStorage.getItem("user")).id,
          consultantId: selectedConsultant,
          bookingTime,
          notes,
          status: "Chờ xác nhận",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        })
      });

      if (res.ok) {
        setPopup({ message: `Đặt lịch thành công lúc ${selectedTime}`, type: "success" });
        setBookedSlots(prev => [...prev, selectedTime]);
        setSelectedTime("");
        setNotes("");
      } else {
        setPopup({ message: "Đặt lịch thất bại. Vui lòng thử lại.", type: "error" });
      }
    } catch (err) {
      console.error("Lỗi khi đặt lịch:", err);
      setPopup({ message: "Có lỗi xảy ra khi đặt lịch.", type: "error" });
    }
  };

  return (
    <>
      <Header />
      <NotifyLogin
        show={showLoginPopup}
        onCancel={() => navigate("/")}
        message="Hãy đăng nhập để có thể đặt lịch tư vấn nhé!!!"
        cancelText="Hủy"
        confirmText="Tiếp tục"
        redirectTo="/login"
      />

      {!showLoginPopup && (
        <div className="container mt-5 mb-5 d-flex justify-content-center">
          <div className="card shadow p-5" style={{ maxWidth: "700px", width: "100%" }}>
            <h2 className="text-center mb-4" style={{ color: "#004b8d" }}>Đặt Lịch Tư Vấn</h2>

            <form onSubmit={handleSubmit} className="d-flex flex-column gap-4">
              <div>
                <label className="form-label" style={{ color: "#004b8d" }}>Chọn ngày:</label>
                <input
                  type="date"
                  className="form-control"
                  value={selectedDate}
                  min={todayStr}
                  onChange={e => setSelectedDate(e.target.value)}
                  required
                />
              </div>

              {selectedDate && (
                <div>
                  <label className="form-label" style={{ color: "#004b8d" }}>Chọn tư vấn viên (đang làm việc):</label>
                  <div className="row g-3 justify-content-center">
                    {availableConsultants.map(c => (
                      <div
                        key={c.id}
                        className={`col-6 col-md-4 text-center`}
                        style={{ cursor: "pointer" }}
                        onClick={() => setSelectedConsultant(c.id)}
                      >
                        <div
                          className={`border rounded p-3 h-100 d-flex flex-column align-items-center justify-content-center ${selectedConsultant === c.id ? "border-primary" : "border-transparent"}`}
                          style={{ boxShadow: "0 2px 6px rgba(0,0,0,0.1)", transition: "border-color 0.3s" }}
                        >
                          <img
                            src={c.avatar || "/avatars/default.jpg"}
                            alt={c.fullname}
                            className="rounded-circle mb-3"
                            width="70"
                            height="70"
                            style={{ objectFit: "cover" }}
                          />
                          <div className="fw-semibold text-primary" style={{ wordBreak: "break-word" }}>
                            {c.fullname}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedConsultant && (
                <div>
                  <label className="form-label" style={{ color: "#004b8d" }}>Chọn thời gian:</label>

                  <div className="d-flex justify-content-center gap-2 mb-3">
                    {allTimeSlots
                      .filter(slot => slot >= "09:00" && slot <= "11:30")
                      .map(slot => {
                        const notWorking = !workingSlots.includes(slot);
                        const alreadyBooked = bookedSlots.includes(slot);
                        const disabled = notWorking || alreadyBooked;

                        return (
                          <button
                            key={slot}
                            type="button"
                            className={`btn ${disabled ? "btn-secondary" : selectedTime === slot ? "btn-primary" : "btn-outline-primary"} btn-sm`}
                            disabled={disabled}
                            onClick={() => setSelectedTime(slot)}
                            style={{ minWidth: "60px" }}
                          >
                            {slot}
                          </button>
                        );
                      })}
                  </div>

                  <div className="d-flex justify-content-center gap-2">
                    {allTimeSlots
                      .filter(slot => slot >= "13:00" && slot <= "15:30")
                      .map(slot => {
                        const notWorking = !workingSlots.includes(slot);
                        const alreadyBooked = bookedSlots.includes(slot);
                        const disabled = notWorking || alreadyBooked;

                        return (
                          <button
                            key={slot}
                            type="button"
                            className={`btn ${disabled ? "btn-secondary" : selectedTime === slot ? "btn-primary" : "btn-outline-primary"} btn-sm`}
                            disabled={disabled}
                            onClick={() => setSelectedTime(slot)}
                            style={{ minWidth: "60px" }}
                          >
                            {slot}
                          </button>
                        );
                      })}
                  </div>
                </div>
              )}

              <div>
                <label className="form-label" style={{ color: "#004b8d" }}>Ghi chú thêm:</label>
                <textarea
                  className="form-control"
                  rows="3"
                  placeholder="Nhập ghi chú nếu có..."
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                />
              </div>

              <button
                type="submit"
                className="btn text-white w-100 mt-3"
                style={{
                  background: 'linear-gradient(90deg, #004b8d, #0070cc)',
                  border: 'none',
                  padding: '12px',
                  fontSize: '16px',
                  borderRadius: '6px'
                }}
              >
                Xác nhận đặt lịch
              </button>
            </form>
          </div>
        </div>
      )}

      {popup.message && (
        <div
          style={{
            position: "fixed",
            bottom: "20px",
            left: "50%",
            transform: "translateX(-50%)",
            padding: "12px 24px",
            color: "white",
            borderRadius: "6px",
            backgroundColor: popup.type === "success" ? "#28a745" : "#dc3545",
            boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
            zIndex: 9999,
            minWidth: "250px",
            textAlign: "center",
            fontWeight: "600",
            userSelect: "none",
          }}
        >
          {popup.message}
        </div>
      )}
    </>
  );
};

export default MemberBookingConsultants;
