import { useEffect, useState } from "react";
import { Modal, ListGroup, Form, Alert } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "./ViewCommunicationPrograms.css";
import Header from "../../components/Header/Header";
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
  FaPen
} from 'react-icons/fa';
import { Link } from "react-router-dom";
import {
  getEvents,
  getEventFeedbacks,
  createEventFeedback,
  createRegistration,
  deleteEvent
} from "../../services/api";

const ViewCommunicationPrograms = () => {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [feedbacks, setFeedbacks] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState("");
  const [registrationMessage, setRegistrationMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteMessage, setDeleteMessage] = useState("");

  const user = JSON.parse(localStorage.getItem('user'));
  const memberId = user?.id;
  const isManager = user?.role === 'MANAGER';

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        setError("");
        const res = await getEvents();
        setEvents(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        setError('Không thể tải danh sách chương trình');
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  const handleViewDetail = async (event) => {
    setSelectedEvent(event);
    try {
      const feedbackList = await getEventFeedbacks(event.id);
      setFeedbacks(feedbackList);
    } catch (err) {
      // handle error
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

  const handleSubmitFeedback = async () => {
    const newFeedback = {
      member: { id: memberId || 1 },
      eventId: selectedEvent.id,
      rating: newRating,
      comment: newComment
    };
    try {
      const res = await createEventFeedback(newFeedback);
      setFeedbacks([...feedbacks, res]);
      setNewComment("");
      setNewRating(5);
    } catch (err) {
      // handle error
    }
  };

  const handleRegisterEvent = async () => {
    if (!memberId) {
      setRegistrationMessage("❌ Bạn cần đăng nhập để đăng ký chương trình.");
      setTimeout(() => setRegistrationMessage("") , 3000);
      return;
    }
    const registration = {
      member: { id: memberId },
      eventId: selectedEvent.id
    };
    try {
      await createRegistration(registration);
      setRegistrationMessage("✅ Bạn đã đăng ký tham gia chương trình thành công!");
      setTimeout(() => setRegistrationMessage("") , 3000);
    } catch (err) {
      setRegistrationMessage("❌ Lỗi khi đăng ký chương trình.");
      setTimeout(() => setRegistrationMessage("") , 3000);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return d.toLocaleDateString('vi-VN');
  };

  const filteredEvents = events.filter(event => {
    const location = (event.location || '').trim();
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLocation = selectedLocation === '' || location === selectedLocation;
    return matchesSearch && matchesLocation;
  });

  const locations = [...new Set(events.map(event => event.location))].sort();

  const handleDeleteEvent = async (eventId) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa chương trình này?")) return;
    setDeleteLoading(true);
    setDeleteMessage("");
    try {
      await deleteEvent(eventId);
      setEvents(events.filter(event => event.id !== eventId));
      setDeleteMessage("✅ Đã xóa chương trình thành công!");
    } catch (err) {
      setDeleteMessage("❌ Lỗi khi xóa chương trình.");
    } finally {
      setDeleteLoading(false);
      setTimeout(() => setDeleteMessage("") , 3000);
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
      <Header />
      <div className="container mx-auto px-4 py-8">
        {/* ...các phần khác không thay đổi... */}

        {/* Ví dụ nút có style inline */}
        <button
          className="btn btn-sm me-2"
          style={{ backgroundColor: "#2DD84E", border: "none", color: "white" }}
        >
          Link
        </button>

      </div>
    </>
  );
};

export default ViewCommunicationPrograms;
