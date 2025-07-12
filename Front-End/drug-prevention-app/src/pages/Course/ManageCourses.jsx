import React, { useEffect, useState } from "react";
import api from "../../Axios/Axios";
import { Button, Modal, Form, Table } from "react-bootstrap";
import { ToastContainer, toast } from "react-toastify";
import "bootstrap/dist/css/bootstrap.min.css";
import "react-toastify/dist/ReactToastify.css";
import Header from "../../components/Header/Header";
const ManageCourses = () => {
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [isCreating, setIsCreating] = useState(false);

  // Danh sách nhóm tuổi (tĩnh)
  const ageGroups = [
    { id: 1, name: "Trẻ em", age: "5+" },
    { id: 2, name: "Thiếu niên", age: "12+" },
    { id: 3, name: "Người lớn", age: "18+" },
  ];

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    duration: "",
    videoUrl: "",
    image: "",
    ageGroupId: 1,
    status: "Đang hoạt động",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  const COURSES_PER_PAGE = 10;
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(filteredCourses.length / COURSES_PER_PAGE);
  const currentCourses = filteredCourses.slice(
    (currentPage - 1) * COURSES_PER_PAGE,
    currentPage * COURSES_PER_PAGE
  );

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    const filtered = courses.filter((course) => {
      const searchLower = searchTerm.toLowerCase();
      return (
        course.name.toLowerCase().includes(searchLower) ||
        course.description.toLowerCase().includes(searchLower) ||
        course.ageGroup?.name.toLowerCase().includes(searchLower)
      );
    });
    setFilteredCourses(filtered);
    setCurrentPage(1);
  }, [searchTerm, courses]);

  const fetchCourses = async () => {
    try {
      const res = await api.get("/course/getAllCourse");
      const data = res.data.data || res.data;
      setCourses(data);
      setFilteredCourses(data);
      console.log("Danh sách khóa học:", data);
    } catch (err) {
      toast.error("Lỗi khi lấy danh sách khóa học.");
      console.error(err);
    }
  };

  const handleCreate = () => {
    setFormData({
      name: "",
      description: "",
      duration: "",
      videoUrl: "",
      image: "",
      ageGroupId: 1,
    });
    setIsCreating(true);
    setShowEditModal(true);
  };

  const handleEdit = (course) => {
    setSelectedCourse(course);
    setFormData({
      name: course.name,
      description: course.description,
      duration: course.duration,
      videoUrl: course.videoUrl,
      image: course.image,
      ageGroupId: course.ageGroup?.id,
      status: course.status,
    });
    setIsCreating(false);
    setShowEditModal(true);
  };

  const handleDelete = (course) => {
    setSelectedCourse(course);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await api.delete(`/course/deleteCourse?id=${selectedCourse.id}`);
      toast.success("Xóa khóa học thành công.");
      fetchCourses();
    } catch (err) {
      toast.error("Lỗi khi xóa khóa học.");
      console.error(err);
    } finally {
      setShowDeleteModal(false);
    }
  };

  const handleSave = async () => {
    try {
      const payload = {
        name: formData.name,
        description: formData.description,
        duration: formData.duration,
        videoUrl: formData.videoUrl,
        image: formData.image,
        ageGroupId: formData.ageGroupId,
        status: formData.status,
        updatedAt: new Date().toISOString(),
      };

      if (isCreating) {
        await api.post("/course/createCourse/", payload);
        toast.success("Tạo khóa học thành công.");
      } else {
        await api.put(
          `/course/updateCourse/${selectedCourse.id}?id=${selectedCourse.id}`,
          payload
        );
        toast.success("Cập nhật khóa học thành công.");
      }
      fetchCourses();
    } catch (err) {
      toast.error("Lỗi khi lưu khóa học.");
      console.error(err);
    } finally {
      setShowEditModal(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "ageGroupId" ? parseInt(value) : value,
    }));
  };

  const getAgeGroupLabel = (id) => {
    const found = ageGroups.find((g) => g.id === id);
    return found ? `${found.name} (${found.age})` : "Không rõ";
  };

  return (
    <>
      <Header />
      <div className="container mt-4">
        <ToastContainer />
<h2 className="text-4xl font-extrabold text-left text-[#004b8d] mb-8 border-b-4 border-[#0070cc] pb-2">
           Quản lý khóa học
          </h2>        <input
          className="form-control mb-3"
          placeholder="Tìm kiếm theo tên khóa học, mô tả hoặc nhóm tuổi"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <p>Có {filteredCourses.length} khóa học</p>

        <Button variant="primary" className="mb-3" onClick={handleCreate}>
          + Thêm khóa học
        </Button>

        <Table striped bordered hover responsive>
          <thead className="table-primary">
            <tr>
              <th>ID</th>
              <th>Tên khóa học</th>
              <th>Mô tả</th>
              <th style={{ minWidth: "85px", whiteSpace: "nowrap" , textAlign: "center"}}>Thời gian</th>
              <th>Ngày tạo</th>
              <th style={{ minWidth: "120px", whiteSpace: "nowrap" , textAlign: "center"}}>
                Ngày cập nhật
              </th>
              <th>Nhóm tuổi</th>
              <th>Video</th>
              <th>Trạng thái</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {currentCourses.map((course) => (
              <tr key={course.id}>
                <td>{course.id}</td>
                <td>{course.name}</td>
                <td>{course.description.slice(0, 40)}...</td>
                <td style={{ whiteSpace: "nowrap", textAlign: "center" }}>{course.duration} phút</td>

                <td style={{ whiteSpace: "nowrap" }}>
                  {new Date(course.createdAt).toISOString().split("T")[0]}
                </td>
                <td style={{ whiteSpace: "nowrap", textAlign: "center" }}>
                  {new Date(course.updatedAt).toISOString().split("T")[0]}
                </td>
                <td style={{ whiteSpace: "nowrap" }}>
                  {course.ageGroup?.name} ({course.ageGroup?.age})
                </td>
                <td style={{ whiteSpace: "nowrap" }}>
                  <a href={course.videoUrl} target="_blank" rel="noreferrer">
                    🔗Link
                  </a>
                </td>
                <td style={{ whiteSpace: "nowrap" }}>{course.status}</td>
                <td style={{ whiteSpace: "nowrap" }}>
                  <Button
                    size="sm"
                    variant="info"
                    className="me-2 text-white"
                    onClick={() => {
                      setSelectedCourse(course);
                      setShowViewModal(true);
                    }}
                  >
                    Xem chi tiết
                  </Button>
                  <Button
                    size="sm"
                    variant="outline-primary"
                    onClick={() => handleEdit(course)}
                    className="me-2"
                  >
                    Sửa
                  </Button>
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() => handleDelete(course)}
                  >
                    Xóa
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>

        {/* Pagination */}
        <div className="d-flex justify-content-center gap-2 mt-3 flex-wrap">
          {Array.from({ length: totalPages }, (_, i) => (
            <Button
              key={i + 1}
              variant={currentPage === i + 1 ? "primary" : "outline-primary"}
              onClick={() => setCurrentPage(i + 1)}
            >
              {i + 1}
            </Button>
          ))}
        </div>

        {/* Modal chỉnh sửa */}
        <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>
              {isCreating ? "Thêm khóa học" : "Sửa khóa học"}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Form.Group className="mb-2">
                <Form.Label>Tên khóa học</Form.Label>
                <Form.Control
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                />
              </Form.Group>
              <Form.Group className="mb-2">
                <Form.Label>Mô tả</Form.Label>
                <Form.Control
                  as="textarea"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                />
              </Form.Group>
              <Form.Group className="mb-2">
                <Form.Label>Thời gian</Form.Label>
                <Form.Control
                  name="duration"
                  value={formData.duration}
                  onChange={handleChange}
                />
              </Form.Group>
              <Form.Group className="mb-2">
                <Form.Label>Video URL</Form.Label>
                <Form.Control
                  name="videoUrl"
                  value={formData.videoUrl}
                  onChange={handleChange}
                />
              </Form.Group>
              <Form.Group className="mb-2">
                <Form.Label>Hình ảnh</Form.Label>
                <Form.Control
                  name="image"
                  value={formData.image}
                  onChange={handleChange}
                />
              </Form.Group>
              <Form.Group className="mb-2">
                <Form.Label>Nhóm tuổi</Form.Label>
                <Form.Select
                  name="ageGroupId"
                  value={formData.ageGroupId}
                  onChange={handleChange}
                >
                  {ageGroups.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.name} ({g.age})
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
              <Form.Group className="mb-2">
                <Form.Label>Trạng thái</Form.Label>
                <Form.Select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                >
                  <option value="Đang hoạt động">Đang hoạt động</option>
                  <option value="Đang cập nhật">Đang cập nhật</option>
                </Form.Select>
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowEditModal(false)}>
              Hủy
            </Button>
            <Button variant="primary" onClick={handleSave}>
              Lưu
            </Button>
          </Modal.Footer>
        </Modal>

        {/* Modal xác nhận xóa */}
        <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Xác nhận xóa</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            Bạn có chắc chắn muốn xóa <strong>{selectedCourse?.name}</strong>?
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant="secondary"
              onClick={() => setShowDeleteModal(false)}
            >
              Hủy
            </Button>
            <Button variant="danger" onClick={handleDeleteConfirm}>
              Xóa
            </Button>
          </Modal.Footer>
        </Modal>

        {/* Modal xem chi tiết */}
        <Modal show={showViewModal} onHide={() => setShowViewModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Chi tiết khóa học</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {selectedCourse && (
              <>
                <p>
                  <strong>ID:</strong> {selectedCourse.id}
                </p>
                <p>
                  <strong>Tên khóa học:</strong> {selectedCourse.name}
                </p>
                <p>
                  <strong>Mô tả:</strong> {selectedCourse.description}
                </p>
                <p>
                  <strong>Thời gian:</strong> {selectedCourse.duration} phút
                </p>
                <p>
                  <strong>Nhóm tuổi:</strong> {selectedCourse.ageGroup?.name} (
                  {selectedCourse.ageGroup?.age})
                </p>
                <p>
                  <strong>Hình ảnh:</strong>
                  <br />
                  <img
                    src={selectedCourse.image}
                    alt={selectedCourse.name}
                    style={{
                      width: "100%",
                      maxHeight: "250px",
                      objectFit: "cover",
                    }}
                  />
                </p>
                <p>
                  <strong>Video:</strong>{" "}
                  <a
                    href={selectedCourse.videoUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Link
                  </a>
                </p>
                <p>
                  <strong>Ngày tạo:</strong>{" "}
                  {new Date(selectedCourse.createdAt).toLocaleDateString()}
                </p>
                <p>
                  <strong>Ngày cập nhật:</strong>{" "}
                  {new Date(selectedCourse.updatedAt).toLocaleDateString()}
                </p>
              </>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowViewModal(false)}>
              Đóng
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    </>
  );
};

export default ManageCourses;
