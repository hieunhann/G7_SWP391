import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Modal, Alert } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import Header from "../../components/Header/Header";
import { FaSearch, FaFilter, FaCalendar, FaMapMarkerAlt, FaUser, FaEye, FaStar, FaComment, FaTrash } from 'react-icons/fa';
import { getEventById, getEventFeedbacks, createEventFeedback, createRegistration, registerForEvent, deleteFeedbackEvent } from "../../services/api";

const EventDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [feedbacks, setFeedbacks] = useState([]);
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState("");
  const [registrationMessage, setRegistrationMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const user = JSON.parse(localStorage.getItem('user'));
  const memberId = user?.id; // hoặc user.memberId

  useEffect(() => {
    const fetchEventDetail = async () => {
      try {
        setLoading(true);
        setError("");
        const found = await getEventById(id);
        setEvent(found && found.data ? found.data : null);
      } catch (err) {
        setError('Không thể tải chi tiết chương trình');
      } finally {
        setLoading(false);
      }
    };
    fetchEventDetail();
  }, [id]);

  useEffect(() => {
    if (!id) return;
    getEventFeedbacks(id)
      .then((res) => setFeedbacks(Array.isArray(res.data) ? res.data : []))
      .catch((err) => setFeedbacks([]));
  }, [id]);

  const handleSubmitFeedback = async () => {
    if (!memberId) {
      navigate("/login", { state: { message: "Bạn cần đăng nhập để bình luận" } });
      return;
    }
    const newFeedback = {
      member: { id: memberId  },
      eventId: event.id,
      rating: newRating,
      comment: newComment
    };
    try {
      const res = await createEventFeedback(newFeedback);
      const feedbackWithMemberId = {
        ...(res && res.data ? res.data : res),
        memberId: memberId
      };
      setFeedbacks([...feedbacks, feedbackWithMemberId]);
      setNewComment("");
      setNewRating(5);
    } catch (err) {
      // Optionally handle error
    }
  };

  const handleRegisterEvent = async () => {
    if (!memberId) {
      setRegistrationMessage("❌ Bạn cần đăng nhập để đăng ký chương trình.");
      setTimeout(() => setRegistrationMessage("") , 3000);
      return;
    }
    const confirmed = window.confirm("Bạn có chắc chắn muốn đăng ký tham gia chương trình này không?");
    if (!confirmed) return;
    try {
      // Đảm bảo truyền đúng kiểu dữ liệu: memberId, eventId là số
      await registerForEvent(Number(memberId), Number(event.id));
      setRegistrationMessage("✅ Bạn đã đăng ký tham gia chương trình thành công!");
      setTimeout(() => setRegistrationMessage("") , 3000);
    } catch (err) {
      if (err.message && err.message.includes("đã đăng ký sự kiện này")) {
        setRegistrationMessage("❌ Bạn đã đăng ký sự kiện này rồi.");
      } else {
        setRegistrationMessage("❌ Lỗi khi đăng ký chương trình.");
      }
      setTimeout(() => setRegistrationMessage("") , 3000);
    }
  };

  const handleDeleteFeedback = async (feedbackId) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa phản hồi này không?")) return;
    try {
      await deleteFeedbackEvent(feedbackId);
      setFeedbacks(feedbacks.filter(fb => fb.id !== feedbackId));
    } catch (err) {
      alert("Xóa phản hồi thất bại!");
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return d.toLocaleDateString('vi-VN');
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
          onClick={() => navigate(-1)}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-800"
        >
          Quay lại
        </button>
      </div>
    );
  }

  if (!event) return null;

  return (
    <>
      <Header />
      <div className="container mx-auto px-4 py-8">
        <button
          onClick={() => navigate(-1)}
          className="mb-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 font-semibold"
        >
          <i className="bi bi-arrow-left"></i> Quay lại
        </button>
        <div className="bg-white rounded-lg shadow-lg p-6">
          {event.imageUrl && (
            <img 
              src={event.imageUrl} 
              alt="Hình ảnh chương trình" 
              className="w-full h-64 object-cover rounded-lg mb-4 shadow-md" 
            />
          )}
          <h2 className="text-2xl font-bold mb-2">{event.title}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="flex items-center">
              <FaUser className="mr-2 text-blue-500" />
              <span><strong>Điều phối viên:</strong> {event.programCoordinator}</span>
            </div>
            <div className="flex items-center">
              <FaMapMarkerAlt className="mr-2 text-green-500" />
              <span><strong>Địa điểm:</strong> {event.location}</span>
            </div>
            <div className="flex items-center">
              <FaCalendar className="mr-2 text-purple-500" />
              <span><strong>Thời gian:</strong> {formatDate(event.startDate)} - {formatDate(event.endDate)}</span>
            </div>
          </div>
          <p className="text-gray-700 mb-4"><strong>Mô tả:</strong> {event.description}</p>

          <button
            onClick={handleRegisterEvent}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors mb-4 flex items-center justify-center gap-2 font-semibold"
          >
            <i className="bi bi-send-check"></i> 
            Đăng ký tham gia
          </button>
          {registrationMessage && (
            <Alert variant={registrationMessage.startsWith("✅") ? "success" : "danger"} className="mb-4">
              {registrationMessage}
            </Alert>
          )}

          <hr className="my-6" />

          {/* Feedback Section */}
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <h5 className="mb-4 flex items-center gap-2 text-lg font-semibold">
              <FaComment className="text-blue-500" />
              Phản hồi từ người tham gia
            </h5>
            {feedbacks.length === 0 ? (
              <p className="text-gray-500 italic">Chưa có phản hồi nào.</p>
            ) : (
              <div className="space-y-3">
                {feedbacks.map((fb) => (
                  <div key={fb.id} className="bg-gray-50 p-3 rounded-lg border-l-4 border-blue-500 flex justify-between items-start gap-2">
                    <div>
                      <div className="flex items-center mb-2">
                        <FaStar className="text-yellow-500 mr-1" />
                        <span className="font-medium">Đánh giá: {"⭐".repeat(fb.rating)}</span>
                      </div>
                      <p className="text-gray-700">{fb.comment}</p>
                    </div>
                    {fb.memberId === memberId && (
                      <button
                        className="text-red-500 hover:text-red-700 p-2 rounded-full transition-colors"
                        title="Xóa phản hồi"
                        onClick={() => handleDeleteFeedback(fb.id)}
                      >
                        <FaTrash />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
            <hr className="my-6" />
            <h5 className="mb-4 flex items-center gap-2 text-lg font-semibold">
              <FaComment className="text-green-500" />
              Gửi phản hồi mới
            </h5>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Đánh giá (1-5 sao):
                </label>
                <input
                  type="number"
                  min="1"
                  max="5"
                  value={newRating}
                  onChange={(e) => setNewRating(parseInt(e.target.value))}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bình luận:
                </label>
                <textarea
                  rows={3}
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Chia sẻ cảm nhận của bạn về chương trình..."
                />
              </div>
              <button
                onClick={handleSubmitFeedback}
                disabled={!newComment.trim()}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-semibold"
              >
                <FaComment />
                Gửi phản hồi
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default EventDetail; 