import api from "../Axios/Axios";

const bookingServices = {
  getListBookingByMemberId: async (userId) => {
    try {
      // Lấy danh sách bookings từ backend Spring Boot
      const resBookings = await api.get(
        `/bookings/getListBookingByMemberId/${userId}`
      );
      const bookingsData = Array.isArray(resBookings.data)
        ? resBookings.data
        : resBookings.data && Array.isArray(resBookings.data.data)
        ? resBookings.data.data
        : [];

      console.log("bookingsData:", bookingsData); // Thêm dòng này để kiểm tra dữ liệu bookingsData

      // Không cần gọi lại API lấy consultant nữa, chỉ setBookings trực tiếp
      return bookingsData;
    } catch (err) {
      throw new Error(err.message || "Đã xảy ra lỗi khi tải dữ liệu.");
    }
  },
  getListBookingByConsultantId: async (userId) => {
    try {
      // Lấy danh sách bookings từ backend Spring Boot
      const resBookings = await api.get(
        `/bookings/getListBookingByConsultantId/${userId}`
      );
      const bookingsData = Array.isArray(resBookings.data)
        ? resBookings.data
        : resBookings.data && Array.isArray(resBookings.data.data)
        ? resBookings.data.data
        : [];

      console.log("bookingsData:", bookingsData); // Thêm dòng này để kiểm tra dữ liệu bookingsData

      // Không cần gọi lại API lấy consultant nữa, chỉ setBookings trực tiếp
      return bookingsData;
    } catch (err) {
      throw new Error(err.message || "Đã xảy ra lỗi khi tải dữ liệu.");
    }
  },
};

export default bookingServices;
