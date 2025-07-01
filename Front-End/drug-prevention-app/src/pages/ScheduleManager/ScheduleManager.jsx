import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { FaUserEdit, FaTrash, FaPlus, FaSyncAlt } from 'react-icons/fa';
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
      className="border border-gray-300 rounded px-3 py-2 text-sm w-full"
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

// Tự động thêm Authorization header cho mọi request nếu có token
axios.interceptors.request.use(
  (config) => {
    const userData = JSON.parse(localStorage.getItem("user"));
    const token = userData?.accessToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

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
  const [dayFilter, setDayFilter] = useState("");
  const [toast, setToast] = useState({ show: false, type: '', message: '' });

  const daysOfWeek = [
    "Chủ Nhật", "Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7",
  ];

  // Fetch data từ API
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [userResponse, scheduleResponse] = await Promise.all([
          axios.get(`${API_URL}/api/v1/users`),
          axios.get(`${API_URL}/api/v1/schedules`)
        ]);
        console.log("userResponse", userResponse.data);
        console.log("scheduleResponse", scheduleResponse.data);
        setUsers(userResponse.data?.data?.result || []);
        setSchedules(Array.isArray(scheduleResponse.data?.data) ? scheduleResponse.data.data : []);
      } catch (error) {
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
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [toast.show]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSelectUser = (e) => {
    setSelectedUser(e.target.value);
    setForm(prev => ({ ...prev, consultant_id: e.target.value }));
  };

  const resetFilters = () => {
    setUserSearch("");
    setRoleFilter("");
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
    if (form.start_time >= form.end_time) {
      setToast({ show: true, type: 'error', message: 'Giờ kết thúc phải lớn hơn giờ bắt đầu.' });
      return;
    }
    const consultant = users.find(u => u.id === Number(form.consultant_id));
    if (!consultant || !['Staff', 'Consultant', 'STAFF', 'CONSULTANT', 'MANAGER'].includes(consultant.role)) {
      setToast({ show: true, type: 'error', message: 'Chỉ có thể tạo lịch cho Staff, Consultant hoặc Manager.' });
      return;
    }
    if (isScheduleConflict({ ...form, consultant_id: Number(form.consultant_id) })) {
      setToast({ show: true, type: 'error', message: 'Lịch bị trùng với ca đã có!' });
      return;
    }
    const scheduleData = {
      consultant: { id: Number(form.consultant_id) },
      startTime: form.start_time,
      endTime: form.end_time,
      day: form.day_of_week
    };
    setLoading(true);
    try {
      let response;
      if (editingId) {
        response = await axios.put(`${API_URL}/api/v1/schedules`, {
          id: editingId,
          consultant: { id: Number(form.consultant_id) },
          day: form.day_of_week,
          startTime: form.start_time,
          endTime: form.end_time
        });
        setToast({ show: true, type: 'success', message: 'Cập nhật lịch thành công!' });
      } else {
        response = await axios.post(`${API_URL}/api/v1/schedules`, scheduleData);
        setToast({ show: true, type: 'success', message: 'Thêm lịch thành công!' });
      }
      const updatedSchedules = await axios.get(`${API_URL}/api/v1/schedules`);
      setSchedules(
        Array.isArray(updatedSchedules.data)
          ? updatedSchedules.data
          : Array.isArray(updatedSchedules.data?.data)
            ? updatedSchedules.data.data
            : Array.isArray(updatedSchedules.data?.content)
              ? updatedSchedules.data.content
              : []
      );
      setForm({
        consultant_id: selectedUser,
        day_of_week: "",
        start_time: "",
        end_time: "",
      });
      setEditingId(null);
    } catch (error) {
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
      day_of_week: schedule.day
        ? (typeof schedule.day === 'string' && schedule.day.length >= 10 ? schedule.day.slice(0, 10) : "")
        : "",
      start_time: schedule.startTime?.slice(0, 5),
      end_time: schedule.endTime?.slice(0, 5)
    });
    setSelectedUser(String(schedule.consultant?.id));
    setEditingId(schedule.id);
  };

  // Xử lý xóa lịch
  const handleDelete = async (id) => {
    if (window.confirm("Xác nhận xóa lịch này?")) {
      setLoading(true);
      try {
        await axios.delete(`${API_URL}/api/v1/schedules/${id}`);
        const updatedSchedules = await axios.get(`${API_URL}/api/v1/schedules`);
        setSchedules(
          Array.isArray(updatedSchedules.data)
            ? updatedSchedules.data
            : Array.isArray(updatedSchedules.data?.data)
              ? updatedSchedules.data.data
              : Array.isArray(updatedSchedules.data?.content)
                ? updatedSchedules.data.content
                : []
        );
        setToast({ show: true, type: 'success', message: 'Xóa lịch thành công!' });
      } catch (error) {
        setToast({ show: true, type: 'error', message: 'Có lỗi xảy ra khi xóa lịch.' });
      } finally {
        setLoading(false);
      }
    }
  };

  // Kiểm tra lịch trùng
  const isScheduleConflict = (newSchedule) => {
    if (!Array.isArray(schedules)) return false;
    return schedules.some(s => {
      if (
        s.consultant?.id !== newSchedule.consultant_id ||
        s.day !== newSchedule.day_of_week ||
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
    if (!Array.isArray(users)) return [];
    return users
      .filter(u => ["STAFF", "CONSULTANT"].includes((u.role || "").toUpperCase()))
      .filter(u => (roleFilter === "" ? true : u.role?.toUpperCase() === roleFilter.toUpperCase()))
      .filter(u => {
        const displayName = u.name || (u.firstName ? (u.firstName + ' ' + (u.lastName || '')) : '');
        return userSearch === "" ? true :
          [u.id?.toString(), displayName, u.username, u.email, u.phoneNumber].some(
            val => (val || '').toLowerCase().includes(userSearch.toLowerCase())
          );
      });
  }, [users, roleFilter, userSearch]);

  // Lọc danh sách lịch - chỉ lọc theo selectedUser và dayFilter, không loại theo role consultant
  const filteredSchedules = useMemo(() => {
    if (!Array.isArray(schedules)) return [];
    return schedules
      .filter(s => {
        if (selectedUser && s.consultant?.id !== Number(selectedUser)) return false;
        if (dayFilter) {
          if (s.day && s.day !== dayFilter) return false;
          if (s.dayOfWeek && s.dayOfWeek !== dayFilter) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (a.day && b.day) return a.day.localeCompare(b.day);
        if (a.dayOfWeek && b.dayOfWeek) return daysOfWeek.indexOf(a.dayOfWeek) - daysOfWeek.indexOf(b.dayOfWeek);
        return 0;
      });
  }, [schedules, selectedUser, dayFilter]);

  // Debug log
  console.log('schedules', schedules);
  console.log('users', users);
  console.log('filteredSchedules', filteredSchedules);

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
        <div className="fixed inset-0 bg-white bg-opacity-60 flex items-center justify-center z-50">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-400 border-t-transparent"></div>
        </div>
      )}
      
      <div className="max-w-2xl mx-auto px-2 py-8">
        {/* Tiêu đề */}
        <h2 className="text-2xl font-bold text-center mb-6 text-blue-700 tracking-tight">Quản lý lịch làm việc</h2>
        {/* Form thêm/sửa lịch */}
        <div className="bg-white rounded-xl shadow p-5 mb-6">
          <form className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end" onSubmit={handleSubmit}>
            <div className="flex flex-col gap-1 md:col-span-2">
              <label className="text-sm font-medium text-gray-700">Nhân sự</label>
              <select
                className="border border-gray-300 rounded px-3 py-2 text-sm w-full"
                value={selectedUser}
                onChange={handleSelectUser}
                required
              >
                <option value="">-- Chọn --</option>
                {filteredUsers.map((u) => (
                  <option key={u.id} value={u.id}>
                    {(u.name || (u.firstName ? (u.firstName + ' ' + (u.lastName || '')) : ''))} ({u.role})
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">Ngày</label>
              <input
                type="date"
                className="border border-gray-300 rounded px-3 py-2 text-sm w-full"
                name="day_of_week"
                value={form.day_of_week}
                onChange={handleChange}
                required
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">Bắt đầu</label>
              <TimeSelect
                name="start_time"
                value={form.start_time}
                onChange={handleChange}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">Kết thúc</label>
              <TimeSelect
                name="end_time"
                value={form.end_time}
                onChange={handleChange}
              />
            </div>
            <div className="flex flex-row gap-2 md:col-span-5">
              <button
                type="submit"
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white rounded px-4 py-2 text-sm font-semibold shadow w-full md:w-auto justify-center"
                disabled={loading}
              >
                <FaPlus /> {editingId ? "Cập nhật" : "Thêm mới"}
              </button>
              <button
                type="button"
                className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded px-4 py-2 text-sm font-semibold border border-gray-300 shadow w-full md:w-auto justify-center"
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
                <FaSyncAlt /> Làm mới
              </button>
            </div>
          </form>
        </div>
        {/* Bộ lọc */}
        <div className="flex flex-col md:flex-row gap-3 mb-5 items-center justify-between bg-white rounded-xl shadow p-4">
          <input
            type="text"
            className="border border-gray-300 rounded px-3 py-2 text-sm w-full md:w-1/3"
            placeholder="Tìm kiếm nhân sự..."
            value={userSearch}
            onChange={e => setUserSearch(e.target.value)}
          />
          <select
            className="border border-gray-300 rounded px-3 py-2 text-sm w-full md:w-1/4"
            value={roleFilter}
            onChange={e => setRoleFilter(e.target.value)}
          >
            <option value="">Tất cả vai trò</option>
            <option value="Consultant">Consultant</option>
            <option value="Staff">Staff</option>
          </select>
          <input
            type="date"
            className="border border-gray-300 rounded px-3 py-2 text-sm w-full md:w-1/4"
            value={dayFilter}
            onChange={e => setDayFilter(e.target.value)}
            placeholder="Lọc theo ngày"
          />
          <button
            onClick={resetFilters}
            className="bg-gray-50 hover:bg-gray-100 text-gray-500 rounded px-3 py-2 text-sm border border-gray-200"
          >Đặt lại</button>
        </div>
        {/* Bảng lịch */}
        <div className="bg-white rounded-xl shadow p-4">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm border-separate border-spacing-y-1">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-3 py-2 text-left font-semibold">Nhân sự</th>
                  <th className="px-3 py-2 text-left font-semibold">Ngày</th>
                  <th className="px-3 py-2 text-left font-semibold">Bắt đầu</th>
                  <th className="px-3 py-2 text-left font-semibold">Kết thúc</th>
                  <th className="px-3 py-2 text-left font-semibold">Thời lượng</th>
                  <th className="px-3 py-2 text-left font-semibold"> </th>
                </tr>
              </thead>
              <tbody>
                {filteredSchedules.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center text-gray-400 py-4">Không có lịch nào.</td>
                  </tr>
                ) : (
                  filteredSchedules.map((s) => {
                    const consultant = users.find(
                      u => u.id === (s.consultant?.id ?? s.consultantId)
                    );
                    return (
                      <tr key={s.id} className="bg-white hover:bg-blue-50 rounded">
                        <td className="px-3 py-2 rounded-l">
                          {consultant?.name || (consultant?.firstName ? (consultant.firstName + ' ' + (consultant.lastName || '')) : "?")}
                          <span className="text-xs text-gray-400 ml-1">({consultant?.role || "?"})</span>
                        </td>
                        <td className="px-3 py-2">{s.day || s.dayOfWeek || '-'}</td>
                        <td className="px-3 py-2">{s.startTime?.slice(0, 5)}</td>
                        <td className="px-3 py-2">{s.endTime?.slice(0, 5)}</td>
                        <td className="px-3 py-2">{calcDuration(s.startTime, s.endTime)}h</td>
                        <td className="px-3 py-2 flex gap-2 rounded-r">
                          <button
                            className="p-2 rounded hover:bg-yellow-100 text-yellow-600"
                            title="Sửa"
                            onClick={() => handleEdit(s)}
                            disabled={loading}
                          >
                            <FaUserEdit />
                          </button>
                          <button
                            className="p-2 rounded hover:bg-red-100 text-red-600"
                            title="Xóa"
                            onClick={() => handleDelete(s.id)}
                            disabled={loading}
                          >
                            <FaTrash />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
        {/* Toast message */}
        {toast.show && (
          <div className={`fixed top-8 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded shadow text-sm font-semibold transition-all ${toast.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
            {toast.message}
          </div>
        )}
      </div>
    </>
  );
}

export default ScheduleManager;