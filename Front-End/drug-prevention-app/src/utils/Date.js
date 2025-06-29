export const getBookingDate = (dateString) => {
  const dateObj = new Date(dateString);
  return `${dateObj.toLocaleDateString("vi-VN")} ${dateObj.toLocaleTimeString(
    "vi-VN",
    {
      hour: "2-digit",
      minute: "2-digit",
    }
  )}`;
};
