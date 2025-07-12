import React from "react";
import { useNavigate } from "react-router-dom";

const NotifyBooking = ({ onClose }) => {
  const navigate = useNavigate();

  const goHome = () => {
    navigate("/");
  };

  const goToBooked = () => {
    navigate("/booked");
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-xl p-8 max-w-xl w-full shadow-2xl relative">
        <button
          className="absolute top-2 right-3 text-gray-400 hover:text-gray-600 text-xl font-bold"
          onClick={onClose}
        >
          &times;
        </button>
        <h2 className="text-2xl md:text-3xl font-bold text-green-600 mb-4 text-center">
          Đặt lịch thành công!
        </h2>
        <p className="text-gray-700 text-base leading-relaxed text-center">
          Đơn đặt lịch của bạn đã được gửi thành công và đang chờ tư vấn viên duyệt.
        </p>
        <p className="mt-4 text-gray-800 font-semibold text-center">
          Vui lòng kiểm tra lịch hẹn hoặc quay về trang chủ để tiếp tục sử dụng dịch vụ.
        </p>
        <div className="flex justify-center gap-4 mt-6">
          <button
            onClick={goHome}
            className="bg-gray-800 hover:bg-black text-white py-2 px-5 rounded-xl transition"
          >
            Về trang chủ
          </button>
          <button
            onClick={goToBooked}
            className="bg-teal-600 hover:bg-teal-700 text-white py-2 px-5 rounded-xl transition"
          >
            Xem lịch đã đặt
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotifyBooking;
