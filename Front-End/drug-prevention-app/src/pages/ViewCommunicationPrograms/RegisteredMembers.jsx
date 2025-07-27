import { useEffect, useState } from "react";
import Header from "../../components/Header/Header";
import {
  getRegistrations,
  getEvents,
  getMemberById,
  approveRegistration,
  rejectRegistration,
  getRegistrationsByStatus,
} from "../../services/api";
import { FaUserCircle, FaSearch, FaExclamationTriangle } from "react-icons/fa";
import Sidebar from "../../components/Sidebar/Sidebar";
const RegisteredMembers = () => {
  const [registrations, setRegistrations] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedMember, setSelectedMember] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [memberLoading, setMemberLoading] = useState(false);
  const [memberError, setMemberError] = useState("");
  const [search, setSearch] = useState("");
  const [eventFilter, setEventFilter] = useState("");
  const [memberCache, setMemberCache] = useState({}); // cache member info for search/filter
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError("");
        let registrationsData;
        if (statusFilter) {
          registrationsData = await getRegistrationsByStatus(statusFilter);
        } else {
          registrationsData = await getRegistrations();
        }
        const eventsData = await getEvents();
        // Đảm bảo luôn là mảng
        setRegistrations(
          Array.isArray(registrationsData)
            ? registrationsData
            : registrationsData.data || []
        );
        setEvents(
          Array.isArray(eventsData) ? eventsData : eventsData.data || []
        );
      } catch (err) {
        setError("Không thể tải danh sách đăng ký");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [statusFilter]);

  // Lấy thông tin member cho tất cả registrations (dùng cho search/filter)
  useEffect(() => {
    const fetchMembers = async () => {
      if (registrations.length === 0) return;
      const ids = Array.from(new Set(registrations.map((r) => r.memberId)));
      const cache = { ...memberCache };
      for (const id of ids) {
        if (!cache[id]) {
          try {
            const member = await getMemberById(id);
            console.log("API /v1/users/" + id + " trả về:", member); // Log dữ liệu trả về
            // Tạm thời lưu cả member và member.data để kiểm tra
            cache[id] = member && member.data ? member.data : member;
          } catch (e) {
            cache[id] = null;
          }
        }
      }
      setMemberCache(cache);
    };
    fetchMembers();
    // eslint-disable-next-line
  }, [registrations]);

  // Lọc danh sách đăng ký dựa trên search và filter
  const filteredRegistrations = registrations.filter((reg) => {
    if (eventFilter && String(reg.eventId) !== String(eventFilter))
      return false;
    const member = memberCache[reg.memberId];
    if (!member) return true; // chưa load member thì vẫn hiển thị
    const q = search.toLowerCase();
    return (
      !q ||
      member.firstName?.toLowerCase().includes(q) ||
      member.lastName?.toLowerCase().includes(q) ||
      `${member.lastName} ${member.firstName}`.toLowerCase().includes(q) ||
      member.email?.toLowerCase().includes(q) ||
      member.phoneNumber?.toLowerCase().includes(q) ||
      String(member.id).includes(q)
    );
  });

  const getEventName = (eventId) => {
    const event = events.find((e) => e.id === eventId);
    return event ? event.title : `Chương trình #${eventId}`;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return d.toLocaleDateString("vi-VN");
  };

  const handleViewMember = async (memberId) => {
    setShowModal(true);
    setSelectedMember(null);
    setMemberLoading(true);
    setMemberError("");
    try {
      const member = await getMemberById(memberId);
      setSelectedMember(member && member.data ? member.data : member);
    } catch (err) {
      setMemberError("Không thể tải thông tin thành viên");
    } finally {
      setMemberLoading(false);
    }
  };

  const handleApprove = async (id) => {
    const updated = await approveRegistration(id);
    setRegistrations(
      registrations.map((r) =>
        r.id === id ? { ...r, status: updated.status } : r
      )
    );
  };

  const handleReject = async (id) => {
    const updated = await rejectRegistration(id);
    setRegistrations(
      registrations.map((r) =>
        r.id === id ? { ...r, status: updated.status } : r
      )
    );
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedMember(null);
    setMemberError("");
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-8">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500 mb-2"></div>
        <span>Đang tải dữ liệu...</span>
      </div>
    );
  }
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-red-500">
        <FaExclamationTriangle className="text-3xl mb-2" />
        {error}
      </div>
    );
  }

  const statusText = {
    PENDING: "Chờ duyệt",
    APPROVED: "Đã duyệt",
    REJECTED: "Từ chối",
  };

  return (
    <>
      <Header />
      <div className="flex">
        <Sidebar />
        <div className="flex-1 ml-[15vw]">
          <div className="container mx-auto px-4 py-8">
            <h2 className="text-3xl font-extrabold mb-8 text-center text-blue-700 tracking-wide drop-shadow">
              Danh sách đăng ký chương trình
            </h2>
            {/* Search & Filter */}
            <div className="flex flex-col md:flex-row gap-4 mb-6 items-center justify-between">
              <div className="relative w-full md:w-1/3">
                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  className="border px-4 py-2 rounded-lg w-full pl-10 focus:ring-2 focus:ring-blue-400 shadow-sm"
                  placeholder="Tìm kiếm theo tên, email, số điện thoại, ID thành viên..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <select
                className="border px-4 py-2 rounded-lg w-full md:w-1/4 focus:ring-2 focus:ring-blue-400 shadow-sm"
                value={eventFilter}
                onChange={(e) => setEventFilter(e.target.value)}
              >
                <option value="">Tất cả chương trình</option>
                {events.map((ev) => (
                  <option key={ev.id} value={ev.id}>
                    {ev.title}
                  </option>
                ))}
              </select>
              <select
                className="border px-4 py-2 rounded-lg w-full md:w-1/4 focus:ring-2 focus:ring-blue-400 shadow-sm"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">Tất cả trạng thái</option>
                <option value="PENDING">Chờ duyệt</option>
                <option value="APPROVED">Đã duyệt</option>
                <option value="REJECTED">Từ chối</option>
              </select>
            </div>
            <div className="overflow-x-auto rounded-lg shadow-lg">
              <table className="min-w-full border border-gray-200 bg-white rounded-lg overflow-hidden">
                <thead>
                  <tr className="bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800">
                    <th className="border px-4 py-2 font-semibold">
                      ID đăng ký
                    </th>
                    <th className="border px-4 py-2 font-semibold">
                      ID thành viên
                    </th>
                    <th className="border px-4 py-2 font-semibold">
                      Họ và tên
                    </th>
                    <th className="border px-4 py-2 font-semibold">
                      Số điện thoại
                    </th>
                    <th className="border px-4 py-2 font-semibold">
                      Tên chương trình
                    </th>
                    <th className="border px-4 py-2 font-semibold">
                      Xem chi tiết
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRegistrations.map((reg) => (
                    <tr
                      key={reg.id}
                      className="text-center hover:bg-blue-50 transition-colors"
                    >
                      <td className="border px-4 py-2">{reg.id}</td>
                      <td className="border px-4 py-2">{reg.memberId}</td>
                      <td className="border px-4 py-2">
                        {memberCache[reg.memberId] ? (
                          `${memberCache[reg.memberId].lastName} ${
                            memberCache[reg.memberId].firstName
                          }`
                        ) : (
                          <span className="text-gray-400">Đang tải...</span>
                        )}
                      </td>
                      <td className="border px-4 py-2">
                        {memberCache[reg.memberId]?.phoneNumber || (
                          <span className="text-gray-400">Đang tải...</span>
                        )}
                      </td>
                      <td className="border px-4 py-2">
                        {getEventName(reg.eventId)}
                      </td>
                      <td className="border px-4 py-2">
                        <button
                          className="flex items-center gap-2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-3 rounded-lg shadow transition-all duration-150"
                          onClick={() => handleViewMember(reg.memberId)}
                        >
                          <FaUserCircle className="text-lg" />
                          Xem chi tiết
                        </button>
                        {reg.status === "PENDING" && (
                          <div className="flex gap-2 mt-2 justify-center">
                            <button
                              className="bg-green-500 hover:bg-green-700 text-white py-1 px-2 rounded"
                              onClick={() => handleApprove(reg.id)}
                            >
                              Duyệt
                            </button>
                            <button
                              className="bg-red-500 hover:bg-red-700 text-white py-1 px-2 rounded"
                              onClick={() => handleReject(reg.id)}
                            >
                              Từ chối
                            </button>
                          </div>
                        )}
                        <div className="mt-1 text-xs text-gray-500">
                          {statusText[reg.status]}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {filteredRegistrations.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                Không có đăng ký nào
              </div>
            )}
          </div>
          {/* Modal hiển thị thông tin thành viên */}
          {showModal && (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
              <div className="bg-white rounded-2xl shadow-2xl p-8 min-w-[320px] max-w-[90vw] relative border-2 border-blue-200">
                <button
                  className="absolute top-2 right-2 text-gray-500 hover:text-red-500 text-2xl font-bold transition-colors"
                  onClick={closeModal}
                  title="Đóng"
                >
                  &times;
                </button>
                <div className="flex flex-col items-center mb-4">
                  <FaUserCircle className="text-6xl text-blue-400 mb-2 drop-shadow" />
                  <h3 className="text-xl font-bold mb-2 text-blue-700">
                    Thông tin thành viên
                  </h3>
                </div>
                {memberLoading ? (
                  <div className="flex flex-col items-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mb-2"></div>
                    Đang tải...
                  </div>
                ) : memberError ? (
                  <div className="text-red-500 flex items-center gap-2">
                    <FaExclamationTriangle />
                    {memberError}
                  </div>
                ) : selectedMember ? (
                  <div className="space-y-3 text-base">
                    <div>
                      <b>ID:</b> {selectedMember.id}
                    </div>
                    <div>
                      <b>Họ tên:</b>{" "}
                      {selectedMember
                        ? `${selectedMember.lastName} ${selectedMember.firstName}`
                        : ""}
                    </div>
                    <div>
                      <b>Tên đăng nhập:</b> {selectedMember.username}
                    </div>
                    <div>
                      <b>Email:</b> {selectedMember.email}
                    </div>
                    <div>
                      <b>Số điện thoại:</b> {selectedMember.phoneNumber}
                    </div>
                    <div>
                      <b>Ngày sinh:</b> {selectedMember.dateOfBirth}
                    </div>
                    <div>
                      <b>Vai trò:</b> {selectedMember.role}
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default RegisteredMembers;
