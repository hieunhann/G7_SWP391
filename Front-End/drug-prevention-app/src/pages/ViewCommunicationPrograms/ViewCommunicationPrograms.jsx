import { useEffect, useState } from "react";
import axios from "axios";
import { Card, Button, Modal, ListGroup, Form, Alert, Badge } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "./ViewCommunicationPrograms.css"; // Assuming you have a CSS file for styles
import Header from "../../components/Header/Header"; // Thêm/chỉnh lại import Header

const ViewCommunicationPrograms = () => {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [feedbacks, setFeedbacks] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState("");
  const [registrationMessage, setRegistrationMessage] = useState("");

  useEffect(() => {
    axios.get("http://localhost:5002/events")
      .then((res) => setEvents(res.data))
      .catch((err) => console.error("Lỗi khi tải danh sách chương trình:", err));
  }, []);

  const handleViewDetail = (event) => {
    setSelectedEvent(event);
    axios.get(`http://localhost:5002/feedback_events?Event_id=${event.ID}`)
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

    axios.post("http://localhost:5002/feedback_events", newFeedback)
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

    axios.post("http://localhost:5002/event_registrations", registration)
      .then(() => {
        setRegistrationMessage("✅ Bạn đã đăng ký tham gia chương trình thành công!");
        setTimeout(() => setRegistrationMessage(""), 3000);
      })
      .catch(err => console.error("Lỗi khi đăng ký chương trình:", err));
  };

 return (
  <>
   <Header /> {/* Đảm bảo sử dụng đúng component Header */}
   <div className="min-h-screen w-full bg-light text-dark py-5 px-3 px-md-5">
    <h2 className="text-center text-primary mb-5 display-4 fw-bold border-bottom pb-3 shadow-sm">
      <i className="bi bi-globe"></i> Danh sách chương trình cộng đồng
    </h2>
    <div className="d-flex flex-wrap justify-content-center gap-4">
      {events.map((event) => (
        <Card key={event.ID} className="event-card border border-primary shadow-sm" style={{ maxWidth: "320px" }}>
          {event.Image && (
            <Card.Img variant="top" src={event.Image} alt="Hình ảnh chương trình" className="event-image img-fluid" />
          )}
          <Card.Body className="bg-white text-dark d-flex flex-column justify-content-between">
            <div>
              <Card.Title className="fs-5 fw-bold text-primary d-flex justify-content-between align-items-center">
                <span className="d-flex align-items-center gap-2">
                  <i className="bi bi-bullseye"></i> {event.Title}
                </span>
                <Badge bg="primary" text="light">
                  <i className="bi bi-hash"></i> {event.ID}
                </Badge>
              </Card.Title>
              <Card.Subtitle className="mb-2 text-secondary">
                <i className="bi bi-person-circle"></i> {event.Program_Coordinator}
              </Card.Subtitle>
              <Card.Text>
                <i className="bi bi-geo-alt"></i> {event.Location}
              </Card.Text>
              <Card.Text>
                <i className="bi bi-calendar-range"></i> {event.Start_date} - {event.End_date}
              </Card.Text>
            </div>
            <Button variant="outline-primary" className="mt-3 w-100 align-self-end d-flex align-items-center justify-content-center gap-2" onClick={() => handleViewDetail(event)}>
              <i className="bi bi-eye"></i> Xem chi tiết
            </Button>
          </Card.Body>
        </Card>
      ))}
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
</>
);

};

export default ViewCommunicationPrograms;