import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";

const API_URL = "http://localhost:5002";

const timeOptions = [];
for (let h = 0; h < 24; h++) {
  ["00", "30"].forEach((m) => {
    const hourStr = h.toString().padStart(2, "0");
    timeOptions.push(`${hourStr}:${m}`);
  });
}

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

  const daysOfWeek = [
    "Chủ Nhật",
    "Thứ 2",
    "Thứ 3",
    "Thứ 4",
    "Thứ 5",
    "Thứ 6",
    "Thứ 7",
  ];

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const userResponse = await axios.get(`${API_URL}/users`);
        const scheduleResponse = await axios.get(`${API_URL}/schedules`);
        setUsers(userResponse.data);
        setSchedules(scheduleResponse.data);
      } catch (error) {
        alert("Có lỗi xảy ra khi tải dữ liệu.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSelectUser = (e) => {
    setSelectedUser(e.target.value);
    setForm((prev) => ({
      ...prev,
      consultant_id: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.start_time >= form.end_time) {
      alert("Giờ kết thúc phải lớn hơn giờ bắt đầu.");
      return;
    }

    const scheduleData = {
      ...form,
      consultant_id: Number(form.consultant_id),
    };

    setLoading(true);
    try {
      if (editingId) {
        await axios.put(`${API_URL}/schedules/${editingId}`, scheduleData);
        setEditingId(null);
      } else {
        await axios.post(`${API_URL}/schedules`, scheduleData);
      }
      const updatedSchedules = await axios.get(`${API_URL}/schedules`);
      setSchedules(updatedSchedules.data);
      setForm({
        consultant_id: selectedUser,
        day_of_week: "",
        start_time: "",
        end_time: "",
      });
    } catch (error) {
      alert("Có lỗi xảy ra khi lưu lịch.");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (schedule) => {
    setForm({
      ...schedule,
      consultant_id: String(schedule.consultant_id),
    });
    setEditingId(schedule.id);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Xác nhận xóa lịch này?")) {
      setLoading(true);
      try {
        await axios.delete(`${API_URL}/schedules/${id}`);
        const updatedSchedules = await axios.get(`${API_URL}/schedules`);
        setSchedules(updatedSchedules.data);
      } catch (error) {
        alert("Có lỗi xảy ra khi xóa lịch.");
      } finally {
        setLoading(false);
      }
    }
  };

  const filteredUsers = users
    .filter((u) => (roleFilter === "" ? true : u.role === roleFilter))
    .filter((u) => u.name.toLowerCase().includes(userSearch.toLowerCase()));

  const filteredSchedules = useMemo(() => {
    return schedules
      .filter((s) => {
        if (selectedUser && String(s.consultant_id) !== String(selectedUser)) {
          return false;
        }
        if (scheduleSearch) {
          const user = users.find((u) => u.id === Number(s.consultant_id));
          const values = [
            s.day_of_week,
            s.start_time,
            s.end_time,
            user?.name || "",
          ];
          return values.some((val) =>
            String(val).toLowerCase().includes(scheduleSearch.toLowerCase())
          );
        }
        return true;
      })
      .sort((a, b) => {
        return (
          daysOfWeek.indexOf(a.day_of_week) - daysOfWeek.indexOf(b.day_of_week)
        );
      });
  }, [schedules, selectedUser, scheduleSearch, users]);

  return (
    <div className="container mt-5">
      <h2 className="mb-4">Quản lý lịch staff & consultant</h2>
      {loading && (
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      )}

      {/* Bộ lọc vai trò và tìm kiếm user */}
      <div className="d-flex gap-3 mb-3 align-items-center flex-wrap">
        <div>
          <label className="form-label">Lọc theo vai trò</label>
          <select
            className="form-select"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="">Tất cả</option>
            <option value="Consultant">Consultant</option>
            <option value="Staff">Staff</option>
          </select>
        </div>
        <div className="flex-grow-1">
          <label className="form-label">Tìm kiếm staff/consultant</label>
          <input
            type="text"
            className="form-control"
            placeholder="Nhập tên..."
            value={userSearch}
            onChange={(e) => setUserSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Chọn user */}
      <div className="mb-3">
        <label className="form-label">Chọn staff/consultant</label>
        <select
          className="form-select"
          value={selectedUser}
          onChange={handleSelectUser}
        >
          <option value="">-- Chọn --</option>
          {filteredUsers.map((u) => (
            <option key={u.id} value={u.id}>
              {u.name} ({u.role})
            </option>
          ))}
        </select>
      </div>

      {/* Form thêm/sửa lịch */}
      {selectedUser && (
        <form className="row g-3 mb-4" onSubmit={handleSubmit}>
          <div className="col-md-3">
            <label className="form-label">Thứ</label>
            <select
              className="form-select"
              name="day_of_week"
              value={form.day_of_week}
              onChange={handleChange}
              required
            >
              <option value="">-- Chọn --</option>
              {daysOfWeek.map((day) => (
                <option key={day} value={day}>
                  {day}
                </option>
              ))}
            </select>
          </div>
          <div className="col-md-2">
            <label className="form-label">Giờ bắt đầu</label>
            <TimeSelect
              name="start_time"
              value={form.start_time}
              onChange={handleChange}
            />
          </div>
          <div className="col-md-2">
            <label className="form-label">Giờ kết thúc</label>
            <TimeSelect
              name="end_time"
              value={form.end_time}
              onChange={handleChange}
            />
          </div>

          <div className="col-md-3 align-self-end d-flex gap-2">
            <button type="submit" className="btn btn-primary btn-sm">
              {editingId ? "Cập nhật" : "Thêm mới"}
            </button>
            {editingId && (
              <button
                type="button"
                className="btn btn-secondary btn-sm"
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
                Hủy
              </button>
            )}
          </div>
        </form>
      )}

      {/* Tìm kiếm trong lịch */}
      <div className="mb-3">
        <input
          type="text"
          className="form-control"
          placeholder="Tìm kiếm trong lịch (thứ, giờ, tên)..."
          value={scheduleSearch}
          onChange={(e) => setScheduleSearch(e.target.value)}
        />
      </div>

      {/* Bảng lịch */}
      <h5 className="mb-3">Lịch làm việc</h5>
      <table className="table table-bordered table-hover">
        <thead className="table-primary">
          <tr>
            <th>Nhân sự</th>
            <th>Thứ</th>
            <th>Giờ bắt đầu</th>
            <th>Giờ kết thúc</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {filteredSchedules.length === 0 ? (
            <tr>
              <td colSpan={5}>Không có lịch nào.</td>
            </tr>
          ) : (
            filteredSchedules.map((s) => (
              <tr key={s.id}>
                <td>
                  {users.find((u) => String(u.id) === String(s.consultant_id))
                    ?.name || "?"}
                </td>
                <td>{s.day_of_week}</td>
                <td>{s.start_time}</td>
                <td>{s.end_time}</td>
                <td>
                  <button
                    className="btn btn-sm btn-warning me-2"
                    onClick={() => handleEdit(s)}
                  >
                    Sửa
                  </button>
                  <button
                    className="btn btn-sm btn-danger"
                    onClick={() => handleDelete(s.id)}
                  >
                    Xóa
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* Thời khóa biểu */}
      <h5 className="mb-3">Thời khóa biểu</h5>
      <table className="table table-bordered table-hover">
        <thead className="table-primary">
          <tr>
            <th>Ngày</th>
            <th>Giờ</th>
            <th>Nhân sự</th>
          </tr>
        </thead>
        <tbody>
          {daysOfWeek.map((day) => (
            <tr key={day}>
              <td>{day}</td>
              <td>
                {schedules
                  .filter((s) => s.day_of_week === day)
                  .map((s) => (
                    <div key={s.id}>
                      {s.start_time} - {s.end_time}
                    </div>
                  ))}
              </td>
              <td>
                {schedules
                  .filter((s) => s.day_of_week === day)
                  .map((s) => (
                    <div key={s.id}>
                      {users.find(
                        (u) => String(u.id) === String(s.consultant_id)
                      )?.name || "?"}
                    </div>
                  ))}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ScheduleManager;
