import { useEffect, useState } from "react";
import Header from "../../components/Header/Header";
import { getRegistrations, getEvents, getMemberById } from "../../services/api";

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

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError("");
        const registrationsData = await getRegistrations();
        const eventsData = await getEvents();
        // Đảm bảo luôn là mảng
        setRegistrations(Array.isArray(registrationsData) ? registrationsData : registrationsData.data || []);
        setEvents(Array.isArray(eventsData) ? eventsData : eventsData.data || []);
      } catch (err) {
        setError("Không thể tải danh sách đăng ký");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Lấy thông tin member cho tất cả registrations (dùng cho search/filter)
  useEffect(() => {
    const fetchMembers = async () => {
      if (registrations.length === 0) return;
      const ids = Array.from(new Set(registrations.map(r => r.memberId)));
      const cache = { ...memberCache };
      for (const id of ids) {
        if (!cache[id]) {
          try {
            const member = await getMemberById(id);
            cache[id] = member;
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
    if (eventFilter && String(reg.eventId) !== String(eventFilter)) return false;
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
    const event = events.find(e => e.id === eventId);
    return event ? event.title : `Chương trình #${eventId}`;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return d.toLocaleDateString('vi-VN');
  };

  const handleViewMember = async (memberId) => {
    setShowModal(true);
    setSelectedMember(null);
    setMemberLoading(true);
    setMemberError("");
    try {
      const member = await getMemberById(memberId);
      setSelectedMember(member);
    } catch (err) {
      setMemberError("Không thể tải thông tin thành viên");
    } finally {
      setMemberLoading(false);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedMember(null);
    setMemberError("");
  };

  if (loading) {
    return <div className="text-center py-8">Đang tải dữ liệu...</div>;
  }
  if (error) {
    return <div className="text-center py-8 text-red-500">{error}</div>;
  }

  return (
    <>
      <Header />
      <div className="container mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold mb-6 text-center">Danh sách đăng ký chương trình</h2>
        {/* Search & Filter */}
        <div className="flex flex-col md:flex-row gap-4 mb-6 items-center justify-between">
          <input
            type="text"
            className="border px-3 py-2 rounded w-full md:w-1/3"
            placeholder="Tìm kiếm theo tên, email, số điện thoại, ID thành viên..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <select
            className="border px-3 py-2 rounded w-full md:w-1/4"
            value={eventFilter}
            onChange={e => setEventFilter(e.target.value)}
          >
            <option value="">Tất cả chương trình</option>
            {events.map(ev => (
              <option key={ev.id} value={ev.id}>{ev.title}</option>
            ))}
          </select>
        </div>
        <table className="min-w-full border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="border px-4 py-2">ID đăng ký</th>
              <th className="border px-4 py-2">ID thành viên</th>
              <th className="border px-4 py-2">Họ và tên</th>
              <th className="border px-4 py-2">Số điện thoại</th>
              <th className="border px-4 py-2">Tên chương trình</th>
              <th className="border px-4 py-2">Xem chi tiết</th>
            </tr>
          </thead>
          <tbody>
            {filteredRegistrations.map((reg) => (
              <tr key={reg.id} className="text-center">
                <td className="border px-4 py-2">{reg.id}</td>
                <td className="border px-4 py-2">{reg.memberId}</td>
                <td className="border px-4 py-2">{memberCache[reg.memberId] ? `${memberCache[reg.memberId].lastName} ${memberCache[reg.memberId].firstName}` : <span className="text-gray-400">Đang tải...</span>}</td>
                <td className="border px-4 py-2">{memberCache[reg.memberId]?.phoneNumber || <span className="text-gray-400">Đang tải...</span>}</td>
                <td className="border px-4 py-2">{getEventName(reg.eventId)}</td>
                <td className="border px-4 py-2">
                  <button
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-3 rounded"
                    onClick={() => handleViewMember(reg.memberId)}
                  >
                    Xem chi tiết
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredRegistrations.length === 0 && (
          <div className="text-center py-8 text-gray-500">Không có đăng ký nào</div>
        )}
      </div>
      {/* Modal hiển thị thông tin thành viên */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 min-w-[320px] max-w-[90vw] relative">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-xl"
              onClick={closeModal}
            >
              &times;
            </button>
            <h3 className="text-lg font-bold mb-4">Thông tin thành viên</h3>
            {memberLoading ? (
              <div>Đang tải...</div>
            ) : memberError ? (
              <div className="text-red-500">{memberError}</div>
            ) : selectedMember ? (
              <div className="space-y-2">
                <div><b>ID:</b> {selectedMember.id}</div>
                <div><b>Họ tên:</b> {selectedMember ? `${selectedMember.lastName} ${selectedMember.firstName}` : ""}</div>
                <div><b>Tên đăng nhập:</b> {selectedMember.username}</div>
                <div><b>Email:</b> {selectedMember.email}</div>
                <div><b>Số điện thoại:</b> {selectedMember.phoneNumber}</div>
                <div><b>Ngày sinh:</b> {selectedMember.dateOfBirth}</div>
                <div><b>Vai trò:</b> {selectedMember.role}</div>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </>
  );
};

export default RegisteredMembers; 