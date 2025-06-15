// src/pages/CommunityActivities/RegisterActivity.jsx

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom'; // Import Link để dùng cho "Go survey"
import Header from '../../components/Header/Header.jsx'; // Đường dẫn đến Header component của bạn
// import './RegisterActivity.css'; // Nếu bạn có CSS riêng cho file này

const RegisterActivity = () => {
  const { id } = useParams(); // Lấy ID hoạt động từ tham số URL (ví dụ: /CommunityActivities/register/1)
  const navigate = useNavigate();

  const [activity, setActivity] = useState(null);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    note: ''
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState(false);

  useEffect(() => {
    if (id) {
      fetch('/data.json') // Giả sử data.json chứa dữ liệu hoạt động
        .then(res => {
          if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
          }
          return res.json();
        })
        .then(data => {
          const foundActivity = data.communityActivities.find(act => act.id === parseInt(id));
          if (foundActivity) {
            setActivity(foundActivity);
          } else {
            setError("Không tìm thấy hoạt động này.");
          }
        })
        .catch(err => {
          console.error("Lỗi khi tải chi tiết hoạt động:", err);
          setError("Không thể tải chi tiết hoạt động. Vui lòng thử lại sau.");
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setError("Không có ID hoạt động để đăng ký. Vui lòng quay lại trang hoạt động.");
      setLoading(false);
    }
  }, [id]); // Dependency array: chạy lại useEffect khi ID thay đổi

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSubmissionSuccess(false);

    console.log('Dữ liệu đăng ký:', formData);
    console.log('Đăng ký cho hoạt động ID:', activity.id);
    console.log('Tên hoạt động:', activity.title);

    try {
      await new Promise(resolve => setTimeout(resolve, 1500)); // Giả lập độ trễ mạng (API call)
      // Trong môi trường thực tế, bạn sẽ gửi formData đến API backend ở đây,
      // bao gồm activity.id để biết người dùng đăng ký hoạt động nào.
      // const response = await fetch('/api/register-activity', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify({ ...formData, activityId: activity.id }),
      // });
      // if (!response.ok) {
      //   const errorData = await response.json();
      //   throw new Error(errorData.message || 'Đăng ký thất bại. Vui lòng thử lại.');
      // }
      // const result = await response.json();

      setSubmissionSuccess(true);
    } catch (err) {
      console.error("Lỗi khi gửi đăng ký:", err);
      setError(err.message || "Đăng ký thất bại. Vui lòng kiểm tra lại thông tin.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <p className="text-center mt-5">Đang tải thông tin hoạt động...</p>;
  }

  if (error && !activity) {
    return (
      <>
        <Header />
        <div className="container py-5 text-center">
          <h3 className="text-danger mb-3">Lỗi!</h3>
          <p>{error}</p>
          <button className="btn btn-primary" onClick={() => navigate('/CommunityActivities')}>
            Quay lại trang hoạt động
          </button>
        </div>
      </>
    );
  }

  if (submissionSuccess) {
    return (
      <>
        <Header />
        <div className="container py-5 text-center">
          <h3 className="text-success mb-3">Đăng ký thành công!</h3>
          <p>Bạn đã đăng ký tham gia hoạt động: <strong>{activity?.title || 'hoạt động này'}</strong></p>
          <p>Chúng tôi sẽ liên hệ với bạn qua email hoặc số điện thoại đã cung cấp.</p>
          <button className="btn btn-primary" onClick={() => navigate('/CommunityActivities')}>
            Quay lại trang hoạt động
          </button>
          {/* Nút "Go survey" được thêm vào đây */}
          <div className="mt-3">
            <Link to="/CRAFFT" className="btn btn-info ms-2">
              Go survey
            </Link>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="container py-4">
        <h2 className="text-center mb-4" style={{ color: "#004b8d", fontWeight: 700 }}>
          Đăng ký tham gia hoạt động: {activity?.title || 'Không rõ tên hoạt động'}
        </h2>
        <div className="card p-4 mx-auto" style={{ maxWidth: '600px', borderColor: '#004b8d' }}>
          {activity ? (
            <>
              <p><strong>Mô tả:</strong> {activity.description}</p>
              <p><strong>Địa điểm:</strong> {activity.location}</p>
              <p><strong>Ngày:</strong> {activity.date}</p>
              <hr />
            </>
          ) : (
            <p className="text-warning">Không thể tải thông tin chi tiết về hoạt động này. Vui lòng điền thông tin và chúng tôi sẽ xác nhận sau.</p>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="fullName" className="form-label">Họ và tên</label>
              <input
                type="text"
                className="form-control"
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                required
                disabled={isSubmitting}
              />
            </div>
            <div className="mb-3">
              <label htmlFor="email" className="form-label">Email</label>
              <input
                type="email"
                className="form-control"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                disabled={isSubmitting}
              />
            </div>
            <div className="mb-3">
              <label htmlFor="phone" className="form-label">Số điện thoại</label>
              <input
                type="tel"
                className="form-control"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                pattern="[0-9]{10,11}"
                title="Số điện thoại phải có 10 hoặc 11 chữ số."
                disabled={isSubmitting}
              />
            </div>
            <div className="mb-3">
              <label htmlFor="note" className="form-label">Ghi chú (Tùy chọn)</label>
              <textarea
                className="form-control"
                id="note"
                name="note"
                rows="3"
                value={formData.note}
                onChange={handleChange}
                disabled={isSubmitting}
              ></textarea>
            </div>

            {error && <div className="alert alert-danger mt-3">{error}</div>}

            <button
              type="submit"
              className="btn btn-primary"
              style={{ backgroundColor: "#004b8d", borderColor: "#004b8d" }}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Đang gửi...
                </>
              ) : (
                'Gửi đăng ký'
              )}
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default RegisterActivity;