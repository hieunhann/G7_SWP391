import React, { useEffect, useState } from "react";
import api from "../../Axios/Axios";
import { format } from "date-fns";
import { FaClock, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import Sidebar from "../../components/Sidebar/Sidebar";

const ScheduleOfConsultant = () => {
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedDate, setSelectedDate] = useState("");

  const itemsPerPage = 6;
  const consultant = JSON.parse(localStorage.getItem("user"));
  const consultantId = consultant?.id;

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        const response = await api.get(`/getScheduleByConsultantId/${consultantId}`);
        setSchedule(response.data.data || []);
      } catch (error) {
        console.error("Error fetching schedule:", error);
      } finally {
        setLoading(false);
      }
    };

    if (consultantId) {
      fetchSchedule();
    }
  }, [consultantId]);

  const groupedSchedule = schedule.reduce((acc, item) => {
    const date = item.day;
    if (!acc[date]) acc[date] = [];
    acc[date].push(item);
    return acc;
  }, {});

  const sortedDates = Object.keys(groupedSchedule).sort((a, b) => new Date(a) - new Date(b));

  const filteredDates = selectedDate
    ? sortedDates.filter((date) => format(new Date(date), "yyyy-MM-dd") === selectedDate)
    : sortedDates;

  const totalPages = Math.ceil(filteredDates.length / itemsPerPage);
  const startIdx = (currentPage - 1) * itemsPerPage;
  const currentDates = filteredDates.slice(startIdx, startIdx + itemsPerPage);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br ">
      <Sidebar />
      <div className="flex-1 ml-[13vw] p-6">
        <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-3xl font-bold text-blue-800 text-center mb-8">
            🗓️ Lịch làm việc cá nhân
          </h2>

          {/* Bộ lọc ngày */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <label htmlFor="date-filter" className="text-gray-700 font-medium">
                Lọc theo ngày:
              </label>
              <input
                id="date-filter"
                type="date"
                className="border border-gray-300 rounded-md px-4 py-2"
                value={selectedDate}
                onChange={(e) => {
                  setSelectedDate(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
            <button
              onClick={() => {
                setSelectedDate("");
                setCurrentPage(1);
              }}
              className="text-sm text-blue-600 hover:underline"
            >
              🧹 Xoá bộ lọc
            </button>
          </div>

          {/* Nội dung chính */}
          {loading ? (
            <p className="text-center text-gray-500">Đang tải lịch làm việc...</p>
          ) : currentDates.length === 0 ? (
            <p className="text-center text-gray-500">Không có lịch làm việc nào.</p>
          ) : (
            currentDates.map((date) => (
              <div key={date} className="mb-6 border border-gray-200 rounded-xl p-4 bg-blue-50">
                <h3 className="text-xl font-semibold text-blue-700 mb-3">
                  📅 {format(new Date(date), "EEEE, dd/MM/yyyy")}
                </h3>
                <div className="flex flex-wrap gap-3">
                  {groupedSchedule[date].map((slot, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 px-4 py-2 bg-white border border-blue-200 rounded-full shadow-sm hover:bg-blue-100 transition"
                    >
                      <FaClock className="text-blue-600" />
                      <span className="text-blue-800 font-medium text-sm">
                        {slot.startTime} - {slot.endTime}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}

          {/* Pagination */}
          {totalPages > 1 && !selectedDate && (
            <div className="flex justify-center items-center gap-4 mt-8">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="flex items-center gap-1 px-3 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50"
              >
                <FaChevronLeft /> Trước
              </button>
              <span className="text-gray-700 font-medium text-sm">
                Trang {currentPage} / {totalPages}
              </span>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="flex items-center gap-1 px-3 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50"
              >
                Sau <FaChevronRight />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ScheduleOfConsultant;
