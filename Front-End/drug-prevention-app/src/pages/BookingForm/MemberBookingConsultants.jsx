import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  CalendarDays,
  Users,
  Clock,
  StickyNote,
  CheckCircle,
} from "lucide-react";
import Header from "../../components/Header/Header";
import NotifyLogin from "../../components/NotifyLogin/NotifyLogin";
import api from "../../Axios/Axios";
import { toast } from "react-toastify";


const MORNING_SLOTS = ["09:00", "09:30", "10:00", "10:30", "11:00", "11:30"];
const AFTERNOON_SLOTS = ["13:00", "13:30", "14:00", "14:30", "15:00", "15:30"];
const TIME_SLOTS = [...MORNING_SLOTS, ...AFTERNOON_SLOTS];


const toMinutes = (t) => {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
};


const stepLabels = [
  { icon: CalendarDays, label: "Chọn ngày" },
  { icon: Users, label: "Chuyên viên" },
  { icon: Clock, label: "Khung giờ" },
  { icon: StickyNote, label: "Ghi chú" },
  { icon: CheckCircle, label: "Xác nhận" },
];


const MemberBookingConsultants = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState("");
  const [consultants, setConsultants] = useState([]);
  const [selectedConsultant, setSelectedConsultant] = useState(null);
  const [workingSlots, setWorkingSlots] = useState([]);
  const [bookedSlots, setBookedSlots] = useState([]);
  const [selectedTime, setSelectedTime] = useState("");
  const [notes, setNotes] = useState("");
  const [showLoginPopup, setShowLoginPopup] = useState(false);


  const user = JSON.parse(localStorage.getItem("user") || "null");
  const userId = user?.id;
  const today = new Date().toISOString().split("T")[0];


  useEffect(() => {
    if (!userId) setShowLoginPopup(true);
  }, [userId]);


  useEffect(() => {
    const fetchConsultants = async () => {
      if (!selectedDate || !userId) return;
      try {
        const res = await api.get(`/getConsultantByDay/${selectedDate}`);
        const raw = res.data.data || [];
        const unique = Array.from(
          new Map(raw.map((c) => [c.consultantId, c])).values()
        );
        const formatted = unique.map((c) => ({
          id: c.consultantId,
          fullName: `${c.lastName} ${c.firstName}`,
          avatar:
            c.avatar ||
            "https://th.bing.com/th/id/OIP.docqTxMiIrutR7inz9A_RgHaLH?w=121&h=181&c=7&r=0&o=7&dpr=1.5&pid=1.7&rm=3",
        }));
        setConsultants(formatted);
      } catch {
        toast.error("Không thể tải tư vấn viên");
        setConsultants([]);
      }
      setSelectedConsultant(null);
      setWorkingSlots([]);
      setBookedSlots([]);
      setSelectedTime("");
    };
    fetchConsultants();
  }, [selectedDate]);


  useEffect(() => {
    const fetchSlots = async () => {
      if (!selectedConsultant || !selectedDate) return;
      try {
        const bookings = await api.get("/bookings/findAllBookings");
        const booked = bookings.data.data
          .filter(
            (b) =>
              b.consultantId === selectedConsultant &&
              b.bookingTime.startsWith(selectedDate)
          )
          .map((b) => b.bookingTime.substring(11, 16));
        setBookedSlots(booked);


        const res = await api.get(
          `/getScheduleByConsultantId/${selectedConsultant}`
        );
        const schedules = res.data.data.filter(
          (s) => s.day.slice(0, 10) === selectedDate
        );


        let slotSet = new Set();
        schedules.forEach(({ startTime, endTime }) => {
          TIME_SLOTS.forEach((t) => {
            const mins = toMinutes(t);
            if (mins >= toMinutes(startTime) && mins <= toMinutes(endTime))
              slotSet.add(t);
          });
        });


        setWorkingSlots([...slotSet]);
      } catch {
        toast.error("Lỗi tải slot");
        setBookedSlots([]);
        setWorkingSlots([]);
      }
    };
    fetchSlots();
  }, [selectedConsultant, selectedDate]);


  const handleBooking = async (e) => {
    e.preventDefault();
    const payload = {
      memberId: userId,
      consultantId: selectedConsultant,
      bookingTime: new Date(`${selectedDate}T${selectedTime}:00`).toISOString(),
      notes,
      status: "Chờ xác nhận",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    try {
      await api.post("/bookings/", payload);
      toast.success(`Đặt lịch thành công lúc ${selectedTime}`);
      setStep(1);
      setSelectedDate("");
      setSelectedConsultant(null);
      setSelectedTime("");
      setNotes("");
    } catch {
      toast.error("Đặt lịch thất bại");
    }
  };


  const renderTimeSlots = (slots, title) => (
    <div className="mb-4">
      <h4 className="text-sm font-medium text-gray-700 mb-1">{title}</h4>
      <div className="flex flex-wrap gap-2">
        {slots.map((slot) => {
          const isDisabled =
            !workingSlots.includes(slot) || bookedSlots.includes(slot);
          return (
            <button
              key={slot}
              type="button"
              disabled={isDisabled}
              onClick={() => setSelectedTime(slot)}
              className={`px-4 py-2 rounded-xl border text-sm shadow-sm transition-all duration-150 ease-in-out ${
                isDisabled
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                  : selectedTime === slot
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-blue-600 border-blue-300 hover:bg-blue-50 hover:border-blue-500"
              }`}
            >
              {slot}
            </button>
          );
        })}
      </div>
    </div>
  );


  const handleNextStep = () => {
    switch (step) {
      case 1:
        if (!selectedDate) {
          toast.warning("Vui lòng chọn ngày trước khi tiếp tục.");
          return;
        }
        toast.info("Bạn đã chọn ngày: " + selectedDate);
        break;
      case 2:
        if (!selectedConsultant) {
          toast.warning("Vui lòng chọn chuyên viên trước khi tiếp tục.");
          return;
        }
        const consultant = consultants.find((c) => c.id === selectedConsultant);
        toast.info("Bạn đã chọn chuyên viên: " + (consultant?.fullName || ""));
        break;
      case 3:
        if (!selectedTime) {
          toast.warning("Vui lòng chọn khung giờ trước khi tiếp tục.");
          return;
        }
        toast.info("Bạn đã chọn khung giờ: " + selectedTime);
        break;
      case 4:
        toast.info("Xác nhận thông tin đặt lịch.");
        break;
      default:
        break;
    }
    setStep(step + 1);
  };


  return (
    <>
      <Header />
      <NotifyLogin
        show={showLoginPopup}
        onCancel={() => navigate("/")}
        message="Hãy đăng nhập để đặt lịch!"
        cancelText="Hủy"
        confirmText="Đăng nhập"
        redirectTo="/login"
      />
      {!showLoginPopup && (
        <div className="min-h-screen flex justify-center items-start p-4">
          <div className="w-full max-w-3xl bg-white/50 backdrop-blur rounded-3xl shadow-xl p-6 md:p-10">
            <h2 className="text-2xl md:text-3xl font-bold text-center text-[#004b8d] mb-6">
              Đặt Lịch Tư Vấn
            </h2>


            {/* Step Indicator */}
            <div className="flex justify-between items-center mb-6 text-sm font-medium">
              {stepLabels.map(({ icon: Icon, label }, i) => (
                <div
                  key={i}
                  className={`flex-1 text-center py-2 px-1 rounded-full mx-1 flex flex-col items-center gap-1 ${
                    step === i + 1
                      ? "bg-[#004b8d] text-white"
                      : "bg-gray-200 text-gray-600"
                  }`}
                >
                  <Icon size={18} />
                  <span>{label}</span>
                </div>
              ))}
            </div>


            <form onSubmit={handleBooking} className="space-y-6">
              {step === 1 && (
                <div>
                  <label className="block font-semibold text-[#004b8d] mb-1">
                    Chọn ngày:
                  </label>
                  <input
                    type="date"
                    className="w-full border border-blue-300 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    min={today}
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                  />
                </div>
              )}


              {step === 2 && (
                <div>
                  <label className="block font-semibold text-[#004b8d] mb-2">
                    Chọn chuyên viên:
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {consultants.map((c) => (
                      <div
                        key={c.id}
                        onClick={() => setSelectedConsultant(c.id)}
                        className={`p-3 rounded-2xl border cursor-pointer flex flex-col items-center gap-2 transition ${
                          selectedConsultant === c.id
                            ? "border-blue-600 bg-blue-50 shadow-md"
                            : "border-gray-300 hover:border-blue-400 hover:shadow-sm"
                        }`}
                      >
                        <img
                          src={c.avatar}
                          alt="avatar"
                          className="w-16 h-16 rounded-full object-cover"
                        />
                        <p className="text-blue-700 font-medium text-sm text-center">
                          {c.fullName}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}


              {step === 3 && (
                <div>
                  <label className="block font-semibold text-[#004b8d] mb-2">
                    Chọn khung giờ:
                  </label>
                  {renderTimeSlots(MORNING_SLOTS, "Buổi sáng (9h - 11h30)")}
                  {renderTimeSlots(AFTERNOON_SLOTS, "Buổi chiều (13h - 15h30)")}
                </div>
              )}


              {step === 4 && (
                <div>
                  <label className="block font-semibold text-[#004b8d] mb-1">
                    Ghi chú:
                  </label>
                  <textarea
                    rows="3"
                    placeholder="Nhập ghi chú..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full border border-blue-300 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300"
                  />
                </div>
              )}


              {step === 5 && (
                <div className="text-sm space-y-2">
                  <p>
                    <strong>Ngày:</strong> {selectedDate}
                  </p>
                  <p>
                    <strong>Chuyên viên:</strong>{" "}
                    {
                      consultants.find((c) => c.id === selectedConsultant)
                        ?.fullName
                    }
                  </p>
                  <p>
                    <strong>Khung giờ:</strong> {selectedTime}
                  </p>
                  <p>
                    <strong>Ghi chú:</strong> {notes || "Không có"}
                  </p>
                </div>
              )}


              <div className="flex justify-between gap-4">
                {step > 1 && (
                  <button
                    type="button"
                    className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded-xl"
                    onClick={() => setStep(step - 1)}
                  >
                    Quay lại
                  </button>
                )}
                {step < 5 && (
                  <button
                    type="button"
                    className="flex-1 bg-gradient-to-r from-[#004b8d] to-[#0070cc] text-white font-semibold py-2 px-4 rounded-xl hover:opacity-90"
                    onClick={handleNextStep}
                  >
                    Tiếp theo
                  </button>
                )}
                {step === 5 && (
                  <button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold py-2 px-4 rounded-xl hover:opacity-90"
                  >
                    Xác nhận
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};


export default MemberBookingConsultants;



