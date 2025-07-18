import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { FaUserEdit, FaTrash, FaPlus, FaSyncAlt } from "react-icons/fa";
import Header from "../../components/Header/Header";
import { useNavigate } from "react-router-dom";
import NotifyLogin from "../../components/Notify/NotifyLogin";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import "jspdf-autotable";
import Sidebar from "../../components/Sidebar/Sidebar";

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
  const [toast, setToast] = useState({ show: false, type: "", message: "" });
  const [showLoginPopup, setShowLoginPopup] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "null");

  const daysOfWeek = [
    "Chủ Nhật",
    "Thứ 2",
    "Thứ 3",
    "Thứ 4",
    "Thứ 5",
    "Thứ 6",
    "Thứ 7",
  ];

  // Chỉ cho phép MANAGER truy cập
  useEffect(() => {
    if (!user || user.role?.toUpperCase() !== "MANAGER") {
      setShowLoginPopup(true);
    }
  }, [user, navigate]);

  // Fetch data từ API
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [userResponse, scheduleResponse] = await Promise.all([
          axios.get(`${API_URL}/api/v1/users`),
          axios.get(`${API_URL}/api/v1/schedules`),
        ]);
        console.log("userResponse", userResponse.data);
        console.log("scheduleResponse", scheduleResponse.data);
        setUsers(
          userResponse.data?.data?.result ||
            userResponse.data?.result ||
            userResponse.data?.data ||
            userResponse.data ||
            []
        );
        setSchedules(
          Array.isArray(scheduleResponse.data?.data)
            ? scheduleResponse.data.data
            : []
        );
      } catch (error) {
        setToast({
          show: true,
          type: "error",
          message: "Có lỗi xảy ra khi tải dữ liệu.",
        });
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
        setToast({ show: false, type: "", message: "" });
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [toast.show]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSelectUser = (e) => {
    setSelectedUser(e.target.value);
    setForm((prev) => ({ ...prev, consultant_id: e.target.value }));
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
      setToast({
        show: true,
        type: "error",
        message: "Giờ kết thúc phải lớn hơn giờ bắt đầu.",
      });
      return;
    }
    const consultant = users.find((u) => u.id === Number(form.consultant_id));
    if (
      !consultant ||
      !["Staff", "Consultant", "STAFF", "CONSULTANT", "MANAGER"].includes(
        consultant.role
      )
    ) {
      setToast({
        show: true,
        type: "error",
        message: "Chỉ có thể tạo lịch cho Staff, Consultant hoặc Manager.",
      });
      return;
    }
    if (
      isScheduleConflict({ ...form, consultant_id: Number(form.consultant_id) })
    ) {
      setToast({
        show: true,
        type: "error",
        message: "Lịch bị trùng với ca đã có!",
      });
      return;
    }
    const scheduleData = {
      consultantId: Number(form.consultant_id), // <-- chỉ gửi id, không gửi object
      day: form.day_of_week,
      startTime: form.start_time,
      endTime: form.end_time,
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
          endTime: form.end_time,
        });
        setToast({
          show: true,
          type: "success",
          message: "Cập nhật lịch thành công!",
        });
      } else {
        response = await axios.post(
          `${API_URL}/api/v1/schedules`,
          scheduleData
        );
        setToast({
          show: true,
          type: "success",
          message: "Thêm lịch thành công!",
        });
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
      const errorMsg =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Có lỗi xảy ra khi lưu lịch.";
      setToast({ show: true, type: "error", message: errorMsg });
    } finally {
      setLoading(false);
    }
  };

  // Xử lý chỉnh sửa lịch
  const handleEdit = (schedule) => {
    setForm({
      consultant_id: String(schedule.consultant?.id),
      day_of_week: schedule.day
        ? typeof schedule.day === "string" && schedule.day.length >= 10
          ? schedule.day.slice(0, 10)
          : ""
        : "",
      start_time: schedule.startTime?.slice(0, 5),
      end_time: schedule.endTime?.slice(0, 5),
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
        setToast({
          show: true,
          type: "success",
          message: "Xóa lịch thành công!",
        });
      } catch (error) {
        setToast({
          show: true,
          type: "error",
          message: "Có lỗi xảy ra khi xóa lịch.",
        });
      } finally {
        setLoading(false);
      }
    }
  };

  // Kiểm tra lịch trùng
  const isScheduleConflict = (newSchedule) => {
    if (!Array.isArray(schedules)) return false;
    return schedules.some((s) => {
      if (
        s.consultant?.id !== newSchedule.consultant_id ||
        s.day !== newSchedule.day_of_week ||
        (editingId && s.id === editingId)
      ) {
        return false;
      }

      const normalizeTime = (time) =>
        time?.endsWith(":00") ? time.slice(0, -3) : time;
      const sStart = normalizeTime(s.startTime);
      const sEnd = normalizeTime(s.endTime);
      const newStart = normalizeTime(newSchedule.start_time);
      const newEnd = normalizeTime(newSchedule.end_time);

      return !(newEnd <= sStart || newStart >= sEnd);
    });
  };

  // Lọc danh sách user - chỉ lấy Consultant
  const filteredUsers = useMemo(() => {
    if (!Array.isArray(users)) return [];
    return users
      .filter((u) => ["CONSULTANT"].includes((u.role || "").toUpperCase()))
      .filter((u) =>
        roleFilter === ""
          ? true
          : u.role?.toUpperCase() === roleFilter.toUpperCase()
      )
      .filter((u) => {
        const displayName =
          u.name || (u.firstName ? u.firstName + " " + (u.lastName || "") : "");
        return userSearch === ""
          ? true
          : [
              u.id?.toString(),
              displayName,
              u.username,
              u.email,
              u.phoneNumber,
            ].some((val) =>
              (val || "").toLowerCase().includes(userSearch.toLowerCase())
            );
      });
  }, [users, roleFilter, userSearch]);

  // Lọc danh sách lịch - chỉ lọc theo selectedUser và dayFilter, không loại theo role consultant
  const filteredSchedules = useMemo(() => {
    if (!Array.isArray(schedules)) return [];
    return schedules
      .filter((s) => {
        if (selectedUser && s.consultant?.id !== Number(selectedUser))
          return false;
        if (dayFilter) {
          if (s.day && s.day !== dayFilter) return false;
          if (s.dayOfWeek && s.dayOfWeek !== dayFilter) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (a.day && b.day) return a.day.localeCompare(b.day);
        if (a.dayOfWeek && b.dayOfWeek)
          return (
            daysOfWeek.indexOf(a.dayOfWeek) - daysOfWeek.indexOf(b.dayOfWeek)
          );
        return 0;
      });
  }, [schedules, selectedUser, dayFilter]);

  // Debug log
  console.log("schedules", schedules);
  console.log("users", users);
  console.log("filteredSchedules", filteredSchedules);

  // Tính thời lượng ca làm việc
  function calcDuration(start, end) {
    if (!start || !end) return "";
    const [sh, sm] = start.split(":").map(Number);
    const [eh, em] = end.split(":").map(Number);
    let duration = eh + em / 60 - (sh + sm / 60);
    if (duration < 0) duration += 24;
    return Math.round(duration * 10) / 10;
  }

  // Helper: safely get consultant name
  const getConsultantName = (consultant) => {
    if (!consultant) return "";
    const first = consultant.firstName || "";
    const last = consultant.lastName || "";
    return (first + " " + last).trim() || consultant.id || "";
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [filteredSchedules]);

  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const pagedSchedules = filteredSchedules.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredSchedules.length / itemsPerPage);

  return (
    <>
      <div className="flex">
        <Sidebar />
        <div className="flex-1 ml-[150px]">
          <NotifyLogin
            show={showLoginPopup}
            onCancel={() => navigate("/")}
            message="Bạn cần đăng nhập với quyền Quản lý (Manager) để truy cập trang này!"
            cancelText="Về trang chủ"
            confirmText="Đăng nhập"
            redirectTo="/login"
          />
          {!showLoginPopup && (
            <div className="container pt-4 pb-5 mb-4">
              <h2
                className="mb-4"
                style={{ color: "#004b8d", fontWeight: 700 }}
              >
                Quản lý lịch làm việc chuyên viên
              </h2>
              <div
                className="mb-3 d-flex align-items-center gap-2"
                style={{ width: "100%", justifyContent: "flex-end" }}
              >
                <label htmlFor="userSearch" style={{ fontWeight: 500 }}>
                  Tìm kiếm nhân sự:
                </label>
                <input
                  type="text"
                  id="userSearch"
                  className="form-control"
                  style={{ maxWidth: 200 }}
                  placeholder="Nhập tên, email, ..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                />
                <label htmlFor="roleFilter" style={{ fontWeight: 500 }}>
                  Vai trò:
                </label>
                <select
                  id="roleFilter"
                  className="form-select"
                  style={{ maxWidth: 150 }}
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                >
                  <option value="">Tất cả</option>
                  <option value="Consultant">Consultant</option>
                  <option value="Staff">Staff</option>
                </select>
                <label htmlFor="dayFilter" style={{ fontWeight: 500 }}>
                  Ngày:
                </label>
                <input
                  type="date"
                  id="dayFilter"
                  className="form-control"
                  style={{ maxWidth: 150 }}
                  value={dayFilter}
                  onChange={(e) => setDayFilter(e.target.value)}
                />
                <button
                  onClick={resetFilters}
                  className="btn btn-outline-secondary btn-sm"
                >
                  Đặt lại
                </button>
              </div>
              <div className="bg-white rounded-xl shadow p-5 mb-6">
                <form
                  className="row g-3 align-items-end"
                  onSubmit={handleSubmit}
                >
                  <div className="col-md-3">
                    <label className="form-label">Nhân sự</label>
                    <select
                      className="form-select"
                      value={selectedUser}
                      onChange={handleSelectUser}
                      required
                    >
                      <option value="">-- Chọn --</option>
                      {filteredUsers.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.name ||
                            (u.firstName
                              ? u.firstName + " " + (u.lastName || "")
                              : "")}{" "}
                          ({u.role})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="col-md-2">
                    <label className="form-label">Ngày</label>
                    <input
                      type="date"
                      className="form-control"
                      name="day_of_week"
                      value={form.day_of_week}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="col-md-2">
                    <label className="form-label">Bắt đầu</label>
                    <TimeSelect
                      name="start_time"
                      value={form.start_time}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="col-md-2">
                    <label className="form-label">Kết thúc</label>
                    <TimeSelect
                      name="end_time"
                      value={form.end_time}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="col-md-3 d-flex gap-2">
                    <button
                      type="submit"
                      className="btn btn-primary w-100"
                      disabled={loading}
                    >
                      {editingId ? "Cập nhật" : "Thêm mới"}
                    </button>
                    <button
                      type="button"
                      className="btn btn-outline-secondary w-100"
                      onClick={() => {
                        setForm({
                          consultant_id: selectedUser,
                          day_of_week: "",
                          start_time: "",
                          end_time: "",
                        });
                        setEditingId(null);
                      }}
                    >
                      Làm mới
                    </button>
                  </div>
                </form>
              </div>
              <div className="bg-white rounded-xl shadow p-4">
                <div className="table-responsive">
                  <table className="table table-bordered table-hover">
                    <thead className="table-primary text-center align-middle">
                      <tr>
                        <th>#</th>
                        <th>Nhân sự</th>
                        <th>Ngày</th>
                        <th>Bắt đầu</th>
                        <th>Kết thúc</th>
                        <th>Thời lượng</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody className="align-middle">
                      {pagedSchedules.length === 0 ? (
                        <tr>
                          <td
                            colSpan={7}
                            className="text-center text-gray-400 py-4"
                          >
                            Không có lịch nào.
                          </td>
                        </tr>
                      ) : (
                        pagedSchedules.map((s, idx) => {
                          const consultant = s.consultant || {};
                          return (
                            <tr
                              key={s.id || idx}
                              className="bg-white hover:bg-blue-50 rounded"
                            >
                              <td>{indexOfFirst + idx + 1}</td>
                              <td>
                                {getConsultantName(consultant)}
                                <span className="text-xs text-gray-400 ml-1">
                                  ({consultant.role || "?"})
                                </span>
                              </td>
                              <td>{s.day || s.dayOfWeek || "-"}</td>
                              <td>
                                {s.startTime
                                  ? String(s.startTime).slice(0, 5)
                                  : "-"}
                              </td>
                              <td>
                                {s.endTime
                                  ? String(s.endTime).slice(0, 5)
                                  : "-"}
                              </td>
                              <td>{calcDuration(s.startTime, s.endTime)}h</td>
                              <td className="d-flex gap-2">
                                <button
                                  className="btn btn-warning btn-sm"
                                  title="Sửa"
                                  onClick={() => handleEdit(s)}
                                  disabled={loading}
                                >
                                  <FaUserEdit />
                                </button>
                                <button
                                  className="btn btn-danger btn-sm"
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
                <div className="d-flex justify-content-center gap-2 mt-3 flex-wrap">
                  {Array.from({ length: totalPages }, (_, i) => (
                    <button
                      key={i + 1}
                      className={`btn btn-sm ${
                        currentPage === i + 1
                          ? "btn-primary"
                          : "btn-outline-primary"
                      }`}
                      onClick={() => setCurrentPage(i + 1)}
                      disabled={currentPage === i + 1}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
              </div>
              {/* Bảng thống kê tổng số ca và tổng số giờ làm việc */}
              <div className="bg-white rounded-xl shadow p-4 mt-4">
                <h5 style={{ fontWeight: 600, color: "#004b8d" }}>
                  Thống kê tổng số ca & tổng số giờ làm việc
                </h5>
                {/* Nút xuất file */}
                <div className="mb-3 d-flex gap-2">
                  <button
                    className="btn btn-success btn-sm"
                    onClick={() => {
                      // Gom nhóm schedules theo consultant.id
                      const stats = {};
                      schedules.forEach((s) => {
                        const consultantId = s.consultant?.id;
                        if (!consultantId) return;
                        if (!stats[consultantId]) {
                          stats[consultantId] = {
                            count: 0,
                            totalHours: 0,
                            consultant: s.consultant,
                          };
                        }
                        let hours = 0;
                        if (s.startTime && s.endTime) {
                          const [sh, sm] = s.startTime.split(":").map(Number);
                          const [eh, em] = s.endTime.split(":").map(Number);
                          hours = eh + em / 60 - (sh + sm / 60);
                          if (hours < 0) hours += 24;
                          hours = Math.round(hours * 10) / 10;
                        }
                        stats[consultantId].count += 1;
                        stats[consultantId].totalHours += hours;
                      });
                      const rows = Object.values(stats).map((stat) => ({
                        "Nhân sự": stat.consultant
                          ? stat.consultant.firstName +
                            " " +
                            stat.consultant.lastName
                          : stat.consultant?.id,
                        "Số ca làm việc": stat.count,
                        "Tổng số giờ": stat.totalHours,
                      }));
                      const ws = XLSX.utils.json_to_sheet(rows);
                      const wb = XLSX.utils.book_new();
                      XLSX.utils.book_append_sheet(wb, ws, "ThongKeLich");
                      const wbout = XLSX.write(wb, {
                        bookType: "xlsx",
                        type: "array",
                      });
                      saveAs(
                        new Blob([wbout], { type: "application/octet-stream" }),
                        "thong_ke_lich.xlsx"
                      );
                    }}
                  >
                    Xuất Excel
                  </button>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => {
                      // Gom nhóm schedules theo consultant.id
                      const stats = {};
                      schedules.forEach((s) => {
                        const consultantId = s.consultant?.id;
                        if (!consultantId) return;
                        if (!stats[consultantId]) {
                          stats[consultantId] = {
                            count: 0,
                            totalHours: 0,
                            consultant: s.consultant,
                          };
                        }
                        let hours = 0;
                        if (s.startTime && s.endTime) {
                          const [sh, sm] = s.startTime.split(":").map(Number);
                          const [eh, em] = s.endTime.split(":").map(Number);
                          hours = eh + em / 60 - (sh + sm / 60);
                          if (hours < 0) hours += 24;
                          hours = Math.round(hours * 10) / 10;
                        }
                        stats[consultantId].count += 1;
                        stats[consultantId].totalHours += hours;
                      });
                      const rows = Object.values(stats).map((stat) => [
                        stat.consultant
                          ? stat.consultant.firstName +
                            " " +
                            stat.consultant.lastName
                          : stat.consultant?.id,
                        stat.count,
                        stat.totalHours,
                      ]);
                      const doc = new jsPDF();
                      doc.text(
                        "Thống kê tổng số ca & tổng số giờ làm việc",
                        14,
                        16
                      );
                      doc.autoTable({
                        head: [["Nhân sự", "Số ca làm việc", "Tổng số giờ"]],
                        body: rows,
                        startY: 20,
                      });
                      doc.save("thong_ke_lich.pdf");
                    }}
                  >
                    Xuất PDF
                  </button>
                </div>
                <div className="table-responsive">
                  <table className="table table-bordered table-hover">
                    <thead className="table-secondary text-center align-middle">
                      <tr>
                        <th>Nhân sự</th>
                        <th>Số ca làm việc</th>
                        <th>Tổng số giờ</th>
                      </tr>
                    </thead>
                    <tbody className="align-middle">
                      {(() => {
                        // Gom nhóm schedules theo consultant.id
                        const stats = {};
                        schedules.forEach((s) => {
                          const consultantId = s.consultant?.id;
                          if (!consultantId) return;
                          if (!stats[consultantId]) {
                            stats[consultantId] = {
                              count: 0,
                              totalHours: 0,
                              consultant: s.consultant,
                            };
                          }
                          // Tính số giờ làm việc
                          let hours = 0;
                          if (s.startTime && s.endTime) {
                            const [sh, sm] = s.startTime.split(":").map(Number);
                            const [eh, em] = s.endTime.split(":").map(Number);
                            hours = eh + em / 60 - (sh + sm / 60);
                            if (hours < 0) hours += 24;
                            hours = Math.round(hours * 10) / 10;
                          }
                          stats[consultantId].count += 1;
                          stats[consultantId].totalHours += hours;
                        });
                        const rows = Object.values(stats);
                        if (rows.length === 0) {
                          return (
                            <tr>
                              <td
                                colSpan={3}
                                className="text-center text-gray-400 py-3"
                              >
                                Không có dữ liệu thống kê.
                              </td>
                            </tr>
                          );
                        }
                        return rows.map((stat, idx) => (
                          <tr key={stat.consultant?.id || idx}>
                            <td>
                              {stat.consultant
                                ? stat.consultant.firstName +
                                  " " +
                                  stat.consultant.lastName
                                : stat.consultant?.id}
                            </td>
                            <td className="text-center">{stat.count}</td>
                            <td className="text-center">{stat.totalHours}h</td>
                          </tr>
                        ));
                      })()}
                    </tbody>
                  </table>
                </div>
              </div>
              {toast.show && (
                <div
                  className={`fixed top-8 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded shadow text-sm font-semibold transition-all ${
                    toast.type === "success"
                      ? "bg-green-50 text-green-700 border border-green-200"
                      : "bg-red-50 text-red-700 border border-red-200"
                  }`}
                >
                  {toast.message}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default ScheduleManager;
