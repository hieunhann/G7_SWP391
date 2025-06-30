import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { FaUserTie, FaCalendarAlt, FaClock, FaUserEdit, FaTrash, FaSearch, FaFilter, FaListAlt } from 'react-icons/fa';
import Header from '../../components/Header/Header';

const API_URL = "http://localhost:8080";

// Tạo options cho select giờ
const timeOptions = [];
for (let h = 0; h < 24; h++) {
  ["00", "30"].forEach((m) => {
    const hourStr = h.toString().padStart(2, "0");
    timeOptions.push(`${hourStr}:${m}`);
  });
}

// Component chọn giờ
function TimeSelect({ name, value, onChange }) {
  return (
    <select
      className="form-control"
      name={name}
      value={value}
      onChange={onChange}
      required
    >
      <option value="">Chọn giờ</option>
      {timeOptions.map((time) => (
        <option key={time} value={time}>
          {time}
        </option>
      ))}
    </select>
  );
}

function ScheduleManager() {
  const [users, setUsers] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [selectedUser, setSelectedUser] = useState("");
  const [form, setForm] = useState({
    consultant_id: "",
    day_of_week: "",
    start_time: "",
    end_time: "",
  });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [roleFilter, setRoleFilter] = useState("");
  const [userSearch, setUserSearch] = useState("");
  const [scheduleSearch, setScheduleSearch] = useState("");
  const [shiftFilter, setShiftFilter] = useState("");
  const [dayFilter, setDayFilter] = useState("");
  const [toast, setToast] = useState({ show: false, type: '', message: '' });
  const [quickUserSearch, setQuickUserSearch] = useState("");

  const daysOfWeek = [
    "Chủ Nhật",
    "Thứ 2",
    "Thứ 3",
    "Thứ 4",
    "Thứ 5",
    "Thứ 6",
    "Thứ 7",
  ];

  // Fetch data từ API
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [userResponse, scheduleResponse] = await Promise.all([
          axios.get(`${API_URL}/api/users`),
          axios.get(`${API_URL}/api/schedules`)
        ]);
        setUsers(userResponse.data);
        setSchedules(scheduleResponse.data);
        console.log('USERS:', userResponse.data);
      } catch (error) {
        console.error("Error fetching data:", error);
        setToast({ show: true, type: 'error', message: 'Có lỗi xảy ra khi tải dữ liệu.' });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Auto-hide toast message
  useEffect(() => {
    if (toast.show) {
      const timer = setTimeout(() => {
        setToast({ show: false, type: '', message: '' });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toast.show]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSelectUser = (e) => {
    setSelectedUser(e.target.value);
    setForm(prev => ({
      ...prev,
      consultant_id: e.target.value,
    }));
  };

  const resetFilters = () => {
    setUserSearch("");
    setRoleFilter("");
    setShiftFilter("");
    setDayFilter("");
  };

  // Xác định ca làm việc
  const getShift = (start) => {
    if (!start) return "";
    const [h] = start.split(":").map(Number);
    if (h < 12) return "Sáng";
    if (h < 18) return "Chiều";
    return "Tối";
  };

  // Xử lý submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate giờ
    if (form.start_time >= form.end_time) {
      setToast({ show: true, type: 'error', message: 'Giờ kết thúc phải lớn hơn giờ bắt đầu.' });
      return;
    }
    
    // Validate role - chỉ cho phép Staff và Consultant
    const consultant = users.find(u => u.id === Number(form.consultant_id));
    if (!consultant || !['Staff', 'Consultant'].includes(consultant.role)) {
      setToast({ show: true, type: 'error', message: 'Chỉ có thể tạo lịch cho Staff hoặc Consultant.' });
      return;
    }
  
    // Check trùng lịch
    if (isScheduleConflict({ ...form, consultant_id: Number(form.consultant_id) })) {
      setToast({ show: true, type: 'error', message: 'Lịch bị trùng với ca đã có!' });
      return;
    }
  
    // Chuẩn bị dữ liệu gửi lên API
    const scheduleData = {
      consultant: { id: Number(form.consultant_id) },
      dayOfWeek: form.day_of_week,
      startTime: form.start_time + ":00",
      endTime: form.end_time + ":00"
    };
  
    setLoading(true);
    try {
      let response;
      if (editingId) {
        response = await axios.put(`${API_URL}/api/schedules/${editingId}`, scheduleData);
        setToast({ show: true, type: 'success', message: 'Cập nhật lịch thành công!' });
      } else {
        response = await axios.post(`${API_URL}/api/schedules`, scheduleData);
        setToast({ show: true, type: 'success', message: 'Thêm lịch thành công!' });
      }
      
      // Refresh danh sách lịch
      const updatedSchedules = await axios.get(`${API_URL}/api/schedules`);
      setSchedules(updatedSchedules.data);
      
      // Reset form
      setForm({
        consultant_id: selectedUser,
        day_of_week: "",
        start_time: "",
        end_time: "",
      });
      setEditingId(null);
    } catch (error) {
      console.error("Error saving schedule:", error);
      const errorMsg = error.response?.data?.message || 
                      error.response?.data?.error || 
                      'Có lỗi xảy ra khi lưu lịch.';
      setToast({ show: true, type: 'error', message: errorMsg });
    } finally {
      setLoading(false);
    }
  };

  // Xử lý chỉnh sửa lịch
  const handleEdit = (schedule) => {
    setForm({
      consultant_id: String(schedule.consultant?.id),
      day_of_week: schedule.dayOfWeek,
      start_time: schedule.startTime?.slice(0, 5), // Lấy HH:mm từ HH:mm:ss
      end_time: schedule.endTime?.slice(0, 5)     // Lấy HH:mm từ HH:mm:ss
    });
    setSelectedUser(String(schedule.consultant?.id)); // Đảm bảo dropdown chọn đúng nhân sự
    setEditingId(schedule.id);
  };

  // Xử lý xóa lịch
  const handleDelete = async (id) => {
    if (window.confirm("Xác nhận xóa lịch này?")) {
      setLoading(true);
      try {
        await axios.delete(`${API_URL}/api/schedules/${id}`);
        const updatedSchedules = await axios.get(`${API_URL}/api/schedules`);
        setSchedules(updatedSchedules.data);
        setToast({ show: true, type: 'success', message: 'Xóa lịch thành công!' });
      } catch (error) {
        console.error("Error deleting schedule:", error);
        setToast({ show: true, type: 'error', message: 'Có lỗi xảy ra khi xóa lịch.' });
      } finally {
        setLoading(false);
      }
    }
  };

  // Kiểm tra lịch trùng
  const isScheduleConflict = (newSchedule) => {
    return schedules.some(s => {
      if (
        s.consultant?.id !== newSchedule.consultant_id ||
        s.dayOfWeek !== newSchedule.day_of_week ||
        (editingId && s.id === editingId)
      ) {
        return false;
      }
      
      const normalizeTime = (time) => time?.endsWith(":00") ? time.slice(0, -3) : time;
      const sStart = normalizeTime(s.startTime);
      const sEnd = normalizeTime(s.endTime);
      const newStart = normalizeTime(newSchedule.start_time);
      const newEnd = normalizeTime(newSchedule.end_time);
      
      return !(newEnd <= sStart || newStart >= sEnd);
    });
  };

  // Lọc danh sách user - chỉ lấy Staff và Consultant
  const filteredUsers = useMemo(() => {
    const searchValue = quickUserSearch.trim() !== "" ? quickUserSearch : userSearch;
    return users
      .filter(u => ['Staff', 'Consultant'].includes(u.role))
      .filter(u => (roleFilter === "" ? true : u.role === roleFilter))
      .filter(u => 
        searchValue === "" ? true : 
        [u.id?.toString(), u.name, u.username, u.email, u.phoneNumber].some(
          val => (val || '').toLowerCase().includes(searchValue.toLowerCase())
        )
      );
  }, [users, roleFilter, userSearch, quickUserSearch]);

  // Lọc danh sách lịch - chỉ hiển thị lịch của Staff và Consultant
  const filteredSchedules = useMemo(() => {
    return schedules
      .filter(s => {
        const consultant = users.find(u => u.id === s.consultant?.id);
        // Chỉ hiển thị lịch của Staff/Consultant
        if (!consultant || !['Staff', 'Consultant'].includes(consultant.role)) return false;
        
        if (selectedUser && s.consultant?.id !== Number(selectedUser)) return false;
        if (scheduleSearch) {
          const values = [
            s.dayOfWeek,
            s.startTime,
            s.endTime,
            consultant?.name || "",
            consultant?.email || "",
            consultant?.phoneNumber || ""
          ];
          return values.some(val => 
            String(val).toLowerCase().includes(scheduleSearch.toLowerCase())
          );
        }
        if (shiftFilter && getShift(s.startTime) !== shiftFilter) return false;
        if (dayFilter && s.dayOfWeek !== dayFilter) return false;
        return true;
      })
      .sort((a, b) => daysOfWeek.indexOf(a.dayOfWeek) - daysOfWeek.indexOf(b.dayOfWeek));
  }, [schedules, selectedUser, scheduleSearch, users, shiftFilter, dayFilter]);

  // Tính thời lượng ca làm việc
  function calcDuration(start, end) {
    if (!start || !end) return '';
    const [sh, sm] = start.split(":").map(Number);
    const [eh, em] = end.split(":").map(Number);
    let duration = (eh + em/60) - (sh + sm/60);
    if (duration < 0) duration += 24;
    return Math.round(duration * 10) / 10;
  }

  return (
    <>
      <Header />
      {/* Overlay loading */}
      {loading && (
        <div className="fixed inset-0 bg-white bg-opacity-70 flex items-center justify-center z-50">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-400 border-t-transparent"></div>
        </div>
      )}
      
      <div className="max-w-2xl mx-auto px-2 py-6">
        {/* Header */}
        <div className="mb-6 text-center">
          <h2 className="text-xl md:text-2xl font-bold text-blue-700 flex items-center justify-center gap-2">
            <FaListAlt className="text-blue-500" /> Quản lý lịch Staff & Consultant
          </h2>
        </div>
        {/* Bộ lọc & Thêm/Sửa lịch */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {/* Bộ lọc nhân sự */}
          <div className="bg-white border border-gray-100 rounded-lg p-4 flex flex-col min-h-[320px] shadow-sm">
            <h3 className="text-base font-semibold text-blue-600 mb-3 flex items-center gap-1">
              <FaFilter className="text-blue-400" /> Bộ lọc
            </h3>
            <div className="flex flex-col gap-2 flex-1">
              <input
                type="text"
                className="border border-gray-200 rounded px-2 py-1 text-sm focus:outline-blue-200"
                placeholder="Tìm kiếm nhanh (Tên)"
                value={quickUserSearch}
                onChange={e => setQuickUserSearch(e.target.value)}
              />
            
              <select
                className="border border-gray-200 rounded px-2 py-1 text-sm"
                value={roleFilter}
                onChange={e => setRoleFilter(e.target.value)}
              >
                <option value="">Tất cả vai trò</option>
                <option value="Consultant">Consultant</option>
                <option value="Staff">Staff</option>
              </select>
              <select
                className="border border-gray-200 rounded px-2 py-1 text-sm"
                value={shiftFilter}
                onChange={e => setShiftFilter(e.target.value)}
              >
                <option value="">Tất cả ca</option>
                <option value="Sáng">Sáng</option>
                <option value="Chiều">Chiều</option>
                <option value="Tối">Tối</option>
              </select>
              <select
                className="border border-gray-200 rounded px-2 py-1 text-sm"
                value={dayFilter}
                onChange={e => setDayFilter(e.target.value)}
              >
                <option value="">Tất cả ngày</option>
                {daysOfWeek.map(day => <option key={day} value={day}>{day}</option>)}
              </select>
              <div className="flex-1"></div>
              <button
                onClick={resetFilters}
                className="mt-2 w-full bg-gray-100 hover:bg-gray-200 text-gray-700 rounded px-2 py-1 text-sm font-medium border border-gray-200 transition"
              >
                Đặt lại bộ lọc
              </button>
            </div>
          </div>
          {/* Thêm/Sửa lịch làm việc */}
          <div className="bg-white border border-gray-100 rounded-lg p-4 flex flex-col min-h-[320px] shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-3 w-full">
              <h3 className="flex flex-row items-center gap-1 whitespace-nowrap text-base font-semibold text-blue-600 mb-0 md:mb-0 min-w-fit">
                <FaCalendarAlt className="text-blue-400" /> Thêm / Sửa lịch
              </h3>
              <select
                className="border border-gray-200 rounded px-2 py-1 text-sm w-full md:w-auto"
                value={selectedUser}
                onChange={handleSelectUser}
                required
              >
                <option value="">-- Chọn Staff/Consultant --</option>
                {filteredUsers.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.role})
                  </option>
                ))}
              </select>
              {selectedUser && (
                <form className="flex flex-col md:flex-row gap-2 md:gap-3 flex-1 items-center w-full" onSubmit={handleSubmit}>
                  <select
                    className="border border-gray-200 rounded px-2 py-1 text-sm w-full md:w-auto"
                    name="day_of_week"
                    value={form.day_of_week}
                    onChange={handleChange}
                    required
                  >
                    <option value="">-- Chọn ngày --</option>
                    {daysOfWeek.map((day) => (
                      <option key={day} value={day}>{day}</option>
                    ))}
                  </select>
                  <TimeSelect
                    name="start_time"
                    value={form.start_time}
                    onChange={handleChange}
                  />
                  <TimeSelect
                    name="end_time"
                    value={form.end_time}
                    onChange={handleChange}
                  />
                  <button 
                    type="submit" 
                    className="bg-blue-600 hover:bg-blue-700 text-white rounded px-3 py-1 text-sm font-medium transition min-w-fit"
                    disabled={loading}
                  >
                    {editingId ? "Cập nhật" : "Thêm mới"}
                  </button>
                  <button 
                    type="button" 
                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 rounded px-3 py-1 text-sm font-medium border border-gray-200 transition min-w-fit"
                    onClick={() => {
                      setForm({ 
                        consultant_id: selectedUser, 
                        day_of_week: "", 
                        start_time: "", 
                        end_time: "" 
                      });
                      setEditingId(null);
                    }}
                  >
                    Làm mới
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
        {/* Bảng lịch */}
        <div className="w-full mb-8">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-base font-semibold text-blue-600 flex items-center gap-1">
              <FaCalendarAlt className="text-blue-400" /> Lịch làm việc
            </h3>
            <span className="text-xs text-gray-500">Tổng số lịch: {filteredSchedules.length}</span>
          </div>
          <div className="bg-white border border-gray-100 rounded-lg p-3 shadow-sm">
            <div className="overflow-x-auto">
              <table className="min-w-full text-xs md:text-sm border-collapse">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-2 py-1 border-b text-left font-semibold">Nhân sự</th>
                    <th className="px-2 py-1 border-b text-left font-semibold">Thứ</th>
                    <th className="px-2 py-1 border-b text-left font-semibold">Bắt đầu</th>
                    <th className="px-2 py-1 border-b text-left font-semibold">Kết thúc</th>
                    <th className="px-2 py-1 border-b text-left font-semibold">Tổng thời lượng (giờ)</th>
                    <th className="px-2 py-1 border-b text-left font-semibold">Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSchedules.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center text-gray-400 py-4">Không có lịch nào.</td>
                    </tr>
                  ) : (
                    filteredSchedules.map((s) => {
                      const consultant = users.find(u => u.id === s.consultant?.id);
                      return (
                        <tr key={s.id}>
                          <td className="px-2 py-1 border-b">
                            {consultant?.name || "?"}
                            <span className="text-xs text-gray-500 ml-1">({consultant?.role || "?"})</span>
                          </td>
                          <td className="px-2 py-1 border-b">{s.dayOfWeek}</td>
                          <td className="px-2 py-1 border-b">{s.startTime?.slice(0, 5)}</td>
                          <td className="px-2 py-1 border-b">{s.endTime?.slice(0, 5)}</td>
                          <td className="px-2 py-1 border-b">{calcDuration(s.startTime, s.endTime)}</td>
                          <td className="px-2 py-1 border-b whitespace-nowrap">
                            <div className="flex flex-row gap-1">
                              <button
                                className="bg-yellow-400 hover:bg-yellow-500 text-white rounded px-2 py-1 text-xs font-medium transition"
                                onClick={() => handleEdit(s)}
                                disabled={loading}
                              >
                                Sửa
                              </button>
                              <button
                                className="bg-red-500 hover:bg-red-600 text-white rounded px-2 py-1 text-xs font-medium transition"
                                onClick={() => handleDelete(s.id)}
                                disabled={loading}
                              >
                                Xóa
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        {/* Thời khóa biểu */}
        <div className="w-full mb-8">
          <h3 className="text-base font-semibold text-blue-600 flex items-center gap-1 mb-2">
            <FaCalendarAlt className="text-blue-400" /> Thời khóa biểu
          </h3>
          <div className="bg-white border border-gray-100 rounded-lg p-3 shadow-sm">
            <div className="overflow-x-auto">
              <table className="min-w-full text-xs md:text-sm border-collapse">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-2 py-1 border-b text-left font-semibold">Ngày</th>
                    <th className="px-2 py-1 border-b text-left font-semibold">Giờ</th>
                    <th className="px-2 py-1 border-b text-left font-semibold">Nhân sự</th>
                  </tr>
                </thead>
                <tbody>
                  {daysOfWeek.map((day) => {
                    const daySchedules = filteredSchedules.filter(s => s.dayOfWeek === day);
                    return (
                      <tr key={day}>
                        <td className="px-2 py-1 border-b font-semibold">{day}</td>
                        <td className="px-2 py-1 border-b">
                          {daySchedules.length === 0 ? (
                            <span className="text-gray-400">-</span>
                          ) : (
                            daySchedules.map(s => (
                              <div key={s.id}>
                                {s.startTime?.slice(0, 5)} - {s.endTime?.slice(0, 5)}
                              </div>
                            ))
                          )}
                        </td>
                        <td className="px-2 py-1 border-b">
                          {daySchedules.length === 0 ? (
                            <span className="text-gray-400">-</span>
                          ) : (
                            daySchedules.map(s => {
                              const consultant = users.find(u => u.id === s.consultant?.id);
                              return (
                                <div key={s.id}>
                                  {consultant?.name || "?"}
                                  <span className="text-xs text-gray-500 ml-1">({consultant?.role || "?"})</span>
                                </div>
                              );
                            })
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        {/* Toast message */}
        {toast.show && (
          <div className={`fixed top-6 right-6 z-50 px-4 py-2 rounded shadow text-xs md:text-sm font-semibold transition-all ${toast.type === 'success' ? 'bg-green-100 text-green-700 border border-green-300' : 'bg-red-100 text-red-700 border border-red-300'}`}>
            {toast.message}
          </div>
        )}
      </div>
    </>
  );
}

export default ScheduleManager;