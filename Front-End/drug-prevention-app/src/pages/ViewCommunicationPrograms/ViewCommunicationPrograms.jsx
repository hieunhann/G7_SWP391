import { useEffect, useState } from "react";
import axios from "axios";
import { Card, Button, Modal, ListGroup, Form, Alert, Badge, InputGroup } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "./ViewCommunicationPrograms.css"; // Assuming you have a CSS file for styles

const ViewCommunicationPrograms = () => {
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [feedbacks, setFeedbacks] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState("");
  const [registrationMessage, setRegistrationMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    axios.get("http://localhost:3001/events")
      .then((res) => {
        setEvents(res.data);
        setFilteredEvents(res.data);
      })
      .catch((err) => console.error("Lỗi khi tải danh sách chương trình:", err));
  }, []);

  useEffect(() => {
    const filtered = events.filter(event => 
      event.Location.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredEvents(filtered);
  }, [searchQuery, events]);

  const handleViewDetail = (event) => {
    setSelectedEvent(event);
    axios.get(`http://localhost:3001/feedback_events?Event_id=${event.ID}`)
      .then((res) => setFeedbacks(res.data))
      .catch((err) => console.error("Lỗi khi tải phản hồi:", err));
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

  const handleSubmitFeedback = () => {
    const newFeedback = {
      ID: Date.now(),
      Member_id: 1,
      Event_id: selectedEvent.ID,
      Rating: newRating,
      Comment: newComment
    };

    axios.post("http://localhost:3001/feedback_events", newFeedback)
      .then(() => {
        setFeedbacks([...feedbacks, newFeedback]);
        setNewComment("");
        setNewRating(5);
      })
      .catch(err => console.error("Lỗi khi gửi phản hồi:", err));
  };

  const handleRegisterEvent = () => {
    const registration = {
      ID: Date.now(),
      Member_id: 1,
      Event_id: selectedEvent.ID
    };

    axios.post("http://localhost:3001/event_registrations", registration)
      .then(() => {
        setRegistrationMessage("✅ Bạn đã đăng ký tham gia chương trình thành công!");
        setTimeout(() => setRegistrationMessage(""), 3000);
      })
      .catch(err => console.error("Lỗi khi đăng ký chương trình:", err));
  };

 return (
  <div className="min-h-screen w-full bg-light text-dark py-5 px-3 px-md-5">
    <h2 className="text-center text-primary mb-5 display-4 fw-bold border-bottom pb-3 shadow-sm">
      <i className="bi bi-globe"></i> Danh sách chương trình cộng đồng
    </h2>

    <div className="search-container mb-4">
      <InputGroup>
        <InputGroup.Text>
          <i className="bi bi-search"></i>
        </InputGroup.Text>
        <Form.Control
          type="text"
          placeholder="Tìm kiếm theo địa điểm (quận/huyện)..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="search-input"
        />
      </InputGroup>
    </div>

    <div className="d-flex flex-wrap justify-content-center gap-4">
      {filteredEvents.length === 0 ? (
        <div className="no-results">
          <i className="bi bi-search display-4"></i>
          <p className="mt-3">Không tìm thấy chương trình nào tại địa điểm này.</p>
        </div>
      ) : (
        <div className="row g-4">
          {filteredEvents.map((event) => (
            <div key={event.ID} className="col-md-6 col-lg-4">
              <div className="card h-100">
                {event.Image && (
                  <img
                    src={event.Image}
                    alt="Hình ảnh chương trình"
                    className="card-img-top"
                    style={{ height: '200px', objectFit: 'cover' }}
                  />
                )}
                <div className="card-body d-flex flex-column">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h5 className="card-title mb-0">{event.Title}</h5>
                    <span className="badge bg-primary">#{event.ID}</span>
                  </div>
                  
                  <div className="mb-3">
                    <p className="card-text mb-2">
                      <i className="bi bi-person-circle me-2"></i>
                      {event.Program_Coordinator}
                    </p>
                    <p className="card-text mb-2">
                      <i className="bi bi-geo-alt me-2"></i>
                      {event.Location}
                    </p>
                    <p className="card-text">
                      <i className="bi bi-calendar-range me-2"></i>
                      {event.Start_date} - {event.End_date}
                    </p>
                  </div>

                  <button
                    className="btn btn-primary mt-auto"
                    onClick={() => handleViewDetail(event)}
                  >
                    <i className="bi bi-eye me-2"></i>
                    Xem chi tiết
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>

    {selectedEvent && (
      <Modal show={showModal} onHide={handleClose} centered size="lg">
        <Modal.Header closeButton className="bg-white text-dark">
          <Modal.Title><i className="bi bi-info-circle"></i> {selectedEvent.Title}</Modal.Title>
        </Modal.Header>
        <Modal.Body className="bg-light">
          {selectedEvent.Image && (
            <img src={selectedEvent.Image} alt="Hình ảnh chương trình" className="img-fluid rounded mb-3 border border-info shadow-sm" />
          )}
          <p><strong><i className="bi bi-person"></i> Điều phối viên:</strong> {selectedEvent.Program_Coordinator}</p>
          <p><strong><i className="bi bi-file-text"></i> Mô tả:</strong> {selectedEvent.Description}</p>
          <p><strong><i className="bi bi-geo"></i> Địa điểm:</strong> {selectedEvent.Location}</p>
          <p><strong><i className="bi bi-calendar"></i> Thời gian:</strong> {selectedEvent.Start_date} - {selectedEvent.End_date}</p>

          <Button variant="success" className="my-3 w-100 shadow-sm d-flex align-items-center justify-content-center gap-2" onClick={handleRegisterEvent}>
            <i className="bi bi-send-check"></i> Đăng ký tham gia
          </Button>
          {registrationMessage && <Alert variant="success">{registrationMessage}</Alert>}

          <hr />
          <h5 className="mb-3"><i className="bi bi-chat-dots"></i> Phản hồi từ người tham gia</h5>
          {feedbacks.length === 0 ? (
            <p className="text-muted fst-italic">Chưa có phản hồi nào.</p>
          ) : (
            <ListGroup variant="flush">
              {feedbacks.map((fb) => (
                <ListGroup.Item key={fb.ID} className="bg-white border mb-1 rounded">
                  <strong>Đánh giá:</strong> {"⭐".repeat(fb.Rating)}<br />
                  <strong>Bình luận:</strong> {fb.Comment}
                </ListGroup.Item>
              ))}
            </ListGroup>
          )}

          <hr />
          <h5 className="mb-3"><i className="bi bi-pencil-square"></i> Gửi phản hồi mới</h5>
          <Form.Group className="mb-2">
            <Form.Label>Đánh giá (1-5 sao):</Form.Label>
            <Form.Control type="number" min="1" max="5" value={newRating} onChange={(e) => setNewRating(parseInt(e.target.value))} />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Bình luận:</Form.Label>
            <Form.Control as="textarea" rows={2} value={newComment} onChange={(e) => setNewComment(e.target.value)} />
          </Form.Group>
          <Button variant="primary" onClick={handleSubmitFeedback} disabled={!newComment.trim()} className="w-100 d-flex align-items-center justify-content-center gap-2">
            <i className="bi bi-chat-left-text"></i> Gửi phản hồi
          </Button>
        </Modal.Body>
        <Modal.Footer className="bg-white">
          <Button variant="secondary" onClick={handleClose} className="d-flex align-items-center gap-2">
            <i className="bi bi-x-circle"></i> Đóng
          </Button>
        </Modal.Footer>
      </Modal>
    )}
  </div>
);

};

export default ViewCommunicationPrograms;