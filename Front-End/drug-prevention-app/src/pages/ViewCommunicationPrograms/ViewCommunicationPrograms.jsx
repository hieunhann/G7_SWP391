import { useEffect, useState } from "react";
import { Modal, ListGroup, Form, Alert } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import Header from "../../components/Header/Header";
import Sidebar from "../../components/Sidebar/Sidebar";
import {
  FaSearch,
  FaFilter,
  FaCalendar,
  FaMapMarkerAlt,
  FaUser,
  FaEye,
  FaStar,
  FaComment,
  FaUsers,
  FaPen,
} from "react-icons/fa";
import { Link } from "react-router-dom";
import {
  getEvents,
  getEventFeedbacks,
  createEventFeedback,
  createRegistration,
  deleteEvent,
} from "../../services/api";

const ViewCommunicationPrograms = () => {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [feedbacks, setFeedbacks] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState("");
  const [registrationMessage, setRegistrationMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteMessage, setDeleteMessage] = useState("");

  const user = JSON.parse(localStorage.getItem("user"));
  const memberId = user?.id; // hoặc user.memberId
  const isManager = user?.role === "MANAGER";

  // Lấy danh sách sự kiện
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        setError("");
        const res = await getEvents();
        setEvents(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        setError("Không thể tải danh sách chương trình");
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  // Xem chi tiết sự kiện + feedback
  const handleViewDetail = async (event) => {
    setSelectedEvent(event);
    try {
      const feedbackList = await getEventFeedbacks(event.id);
      setFeedbacks(feedbackList);
    } catch (err) {
      // Optionally handle error
    }
    setShowModal(true);
    setRegistrationMessage("");
  };

  const handleClose = () => {
    setShowModal(false);
    setSelectedEvent(null);
    setFeedbacks([]);
    setNewComment("");
    setNewRating(5);
  };

  // Gửi feedback mới
  const handleSubmitFeedback = async () => {
    const newFeedback = {
      member: { id: memberId || 1 },
      eventId: selectedEvent.id,
      rating: newRating,
      comment: newComment,
    };
    try {
      const res = await createEventFeedback(newFeedback);
      setFeedbacks([...feedbacks, res]);
      setNewComment("");
      setNewRating(5);
    } catch (err) {
      // Optionally handle error
    }
  };

  // Đăng ký sự kiện
  const handleRegisterEvent = async () => {
    if (!memberId) {
      setRegistrationMessage("❌ Bạn cần đăng nhập để đăng ký chương trình.");
      setTimeout(() => setRegistrationMessage(""), 3000);
      return;
    }
    const registration = {
      member: { id: memberId },
      eventId: Number(selectedEvent.id),
    };
    try {
      await createRegistration(registration);
      setRegistrationMessage(
        "✅ Bạn đã đăng ký tham gia chương trình thành công!"
      );
      setTimeout(() => setRegistrationMessage(""), 3000);
    } catch (err) {
      setRegistrationMessage("❌ Lỗi khi đăng ký chương trình.");
      setTimeout(() => setRegistrationMessage(""), 3000);
    }
  };

  // Hàm format ngày
  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return d.toLocaleDateString("vi-VN");
  };

  // Filter events
  const filteredEvents = events.filter((event) => {
    const location = (event.location || "").trim();
    const matchesSearch =
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLocation =
      selectedLocation === "" || location === selectedLocation;
    return matchesSearch && matchesLocation;
  });

  // Lấy danh sách địa điểm duy nhất
  const locations = [...new Set(events.map((event) => event.location))].sort();

  const handleDeleteEvent = async (eventId) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa chương trình này?")) return;
    setDeleteLoading(true);
    setDeleteMessage("");
    try {
      await deleteEvent(eventId);
      setEvents(events.filter((event) => event.id !== eventId));
      setDeleteMessage("✅ Đã xóa chương trình thành công!");
    } catch (err) {
      setDeleteMessage("❌ Lỗi khi xóa chương trình.");
    } finally {
      setDeleteLoading(false);
      setTimeout(() => setDeleteMessage(""), 3000);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-red-500 mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Thử lại
        </button>
      </div>
    );
  }

  return (
    <>
      <Header user={user} />
      <div className="flex">
        <Sidebar />
        <div className="flex-1 ml-[14vw]">
          <div className="container mx-auto px-4 py-8">
            <div className="flex flex-col md:flex-row justify-between items-center mb-8">
              <h2 className="text-3xl font-bold text-center md:text-left text-darkblue-800 drop-shadow-lg">
                <i className="bi bi-globe mr-2"></i>
                Danh sách chương trình cộng đồng
              </h2>
              <div className="flex gap-4 items-center">
                {isManager && (
                  <Link
                    to="/registered-members"
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 font-medium shadow-lg"
                  >
                    <FaUsers />
                    Xem danh sách đăng ký
                  </Link>
                )}
                {isManager && (
                  <Link
                    to="/create-event"
                    className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 font-medium shadow-lg"
                  >
                    <i className="bi bi-plus-circle"></i>
                    Tạo chương trình mới
                  </Link>
                )}
              </div>
            </div>

            {/* Search and Filter Section */}
            <div className="flex flex-col md:flex-row gap-4 mb-8">
              <div className="flex-1">
                <div className="relative">
                  <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Tìm kiếm chương trình..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-6 py-2 pl-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="w-full md:w-64">
                <div className="relative">
                  <select
                    value={selectedLocation}
                    onChange={(e) => setSelectedLocation(e.target.value)}
                    className="w-full px-4 py-2 pl-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                  >
                    <option value="">Tất cả địa điểm</option>
                    {locations.map((location) => (
                      <option key={location} value={location}>
                        {location}
                      </option>
                    ))}
                  </select>
                  <FaFilter className="absolute left-3 top-3 text-gray-400" />
                </div>
              </div>
            </div>

            {/* Events Grid */}
            {filteredEvents.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">Không tìm thấy chương trình nào</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredEvents.map((event, index) => (
                  <div
                    key={event.id}
                    className="bg-white rounded-lg shadow-lg overflow-hidden flex flex-col h-full hover:shadow-xl transition-shadow duration-300"
                  >
                    <div className="relative h-48">
                      <img
                        src={
                          event.imageUrl ||
                          "https://cdn-icons-png.flaticon.com/512/2913/2913461.png"
                        }
                        alt={event.title}
                        className="w-full h-full object-cover"
                        onError={(e) =>
                          (e.target.src =
                            "https://cdn-icons-png.flaticon.com/512/2913/2913461.png")
                        }
                      />
                      <div className="absolute top-2 right-2 bg-blue-500 text-white px-2 py-1 rounded text-sm font-medium">
                        #{index + 1}
                      </div>
                    </div>
                    <div className="p-6 flex-grow flex flex-col">
                      <h2 className="text-xl font-bold mb-2 line-clamp-2 text-gray-800">
                        {event.title}
                      </h2>

                      <div className="space-y-2 mb-4 text-sm text-gray-600">
                        <div className="flex items-center">
                          <FaUser className="mr-2 text-blue-500" />
                          <span>{event.programCoordinator}</span>
                        </div>
                        <div className="flex items-center">
                          <FaMapMarkerAlt className="mr-2 text-green-500" />
                          <span>{event.location}</span>
                        </div>
                        <div className="flex items-center">
                          <FaCalendar className="mr-2 text-purple-500" />
                          <span>
                            {formatDate(event.startDate)} -{" "}
                            {formatDate(event.endDate)}
                          </span>
                        </div>
                      </div>

                      <p className="text-gray-600 mb-4 line-clamp-3 flex-grow">
                        {event.description}
                      </p>

                      <div className="mt-auto flex items-center justify-between mb-4">
                        <Link
                          to={`/event/${event.id}`}
                          className="w-full text-center bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
                        >
                          <FaEye />
                          Xem chi tiết
                        </Link>
                        {isManager && (
                          <div className="flex gap-2 items-center ml-2">
                            <Link
                              to={`/edit-event/${event.id}`}
                              className="text-green-600 hover:underline text-sm flex items-center gap-1"
                              title="Chỉnh sửa chương trình"
                            >
                              <FaPen size={14} /> Sửa
                            </Link>
                            <button
                              onClick={() => handleDeleteEvent(event.id)}
                              className="text-red-600 hover:underline text-sm flex items-center gap-1"
                              title="Xóa chương trình"
                              disabled={deleteLoading}
                            >
                              <i className="bi bi-trash"></i> Xóa
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {deleteMessage && (
              <div
                className={`mb-4 text-center ${
                  deleteMessage.startsWith("✅")
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {deleteMessage}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default ViewCommunicationPrograms;
