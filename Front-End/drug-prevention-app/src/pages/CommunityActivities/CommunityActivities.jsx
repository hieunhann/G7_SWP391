import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom"; // <<< QUAN TRỌNG: Import lại Link
import Header from "../../components/Header/Header.jsx";
import "./CommunityActivities.css"; // Import file CSS riêng

// Constants
const ACTIVITIES_PER_PAGE = 6; // Số hoạt động hiển thị mỗi trang

const CommunityActivities = () => {
  const [activities, setActivities] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");
  const [locationFilter, setLocationFilter] = useState("");

  useEffect(() => {
    fetch("/data.json")
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        setActivities(data.communityActivities || []);
      })
      .catch((err) => console.error("Không thể lấy hoạt động cộng đồng:", err));
  }, []);

  const getAllLocations = (acts) => {
    const locations = new Set();
    acts.forEach((activity) => {
      if (activity.location) {
        locations.add(activity.location.trim());
      }
    });
    return Array.from(locations);
  };
  const allLocations = getAllLocations(activities);

  const filteredActivities = activities.filter((activity) => {
    const matchSearch =
      activity.title?.toLowerCase().includes(search.toLowerCase()) ||
      activity.description?.toLowerCase().includes(search.toLowerCase()) ||
      activity.location?.toLowerCase().includes(search.toLowerCase());
    const matchLocation =
      !locationFilter ||
      (activity.location &&
        activity.location.toLowerCase().includes(locationFilter.toLowerCase()));
    return matchSearch && matchLocation;
  });

  const totalPages = Math.ceil(filteredActivities.length / ACTIVITIES_PER_PAGE);
  const startIdx = (currentPage - 1) * ACTIVITIES_PER_PAGE;
  const currentActivities = filteredActivities.slice(startIdx, startIdx + ACTIVITIES_PER_PAGE);

  return (
    <>
      <Header />

      <div className="container py-4">
        <h2 className="text-center mb-4 community-activities-title">
          Hoạt động tình nguyện cộng đồng
        </h2>

        {/* Thanh tìm kiếm và bộ lọc địa điểm */}
        <div className="mb-4 d-flex flex-wrap justify-content-center gap-3">
          <input
            type="text"
            className="form-control search-filter-input"
            placeholder="Tìm kiếm hoạt động..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1); // Đặt lại về trang 1 khi tìm kiếm
            }}
          />
          <select
            className="form-select search-filter-select"
            value={locationFilter}
            onChange={(e) => {
              setLocationFilter(e.target.value);
              setCurrentPage(1); // Đặt lại về trang 1 khi lọc
            }}
          >
            <option value="">Tất cả địa điểm</option>
            {allLocations.map((loc) => (
              <option key={loc} value={loc}>
                {loc}
              </option>
            ))}
          </select>
        </div>

        <div className="d-flex flex-wrap justify-content-center gap-4">
          {currentActivities.length > 0 ? (
            currentActivities.map((activity) => (
              <div className="card activity-card" key={activity.id}>
                <img
                  src={activity.image}
                  className="card-img-top activity-card-img"
                  alt={activity.title}
                />
                <div className="card-body" style={{ flexGrow: 1 }}>
                  <h5 className="card-title activity-card-title">
                    {activity.title}
                  </h5>
                  <p className="card-text activity-card-text">
                    {activity.description}
                  </p>
                  <div className="mt-3">
                    <div className="mb-1">
                      <span className="badge bg-info text-dark activity-detail-badge">
                        <i className="bi bi-geo-alt-fill me-1"></i> {activity.location}
                      </span>
                    </div>
                    <div>
                      <span className="badge bg-secondary text-light activity-detail-badge">
                        <i className="bi bi-calendar-event me-1"></i> {activity.date}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="card-footer bg-transparent border-top-0 d-flex justify-content-between align-items-center">
                  <span className={`badge ${activity.status === 'Đang diễn ra' ? 'bg-success' : 'bg-warning text-dark'} activity-detail-badge`}>
                    {activity.status}
                  </span>
                  {/* NÚT THAM GIA TRỎ ĐẾN TRANG ĐĂNG KÝ VỚI ID HOẠT ĐỘNG */}
                  <Link
                    to={`/CommunityActivities/register/${activity.id}`} // <<< QUAN TRỌNG: Quay lại truyền ID
                    className="btn btn-primary activity-link-button"
                  >
                    Tham gia <i className="bi bi-arrow-right"></i>
                  </Link>
                </div>
              </div>
            ))
          ) : (
            <p className="col-12 text-center text-muted">
              Không tìm thấy hoạt động nào phù hợp.
            </p>
          )}
        </div>

        {/* Phân trang */}
        <nav className="mt-4 d-flex justify-content-center">
          <ul className="pagination">
            <li className={`page-item${currentPage === 1 ? " disabled" : ""}`}>
              <button
                className="page-link pagination-link"
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Trước
              </button>
            </li>
            {[...Array(totalPages)].map((_, idx) => (
              <li
                key={idx}
                className={`page-item${currentPage === idx + 1 ? " active" : ""} pagination-item`}
              >
                <button
                  className="page-link pagination-link"
                  onClick={() => setCurrentPage(idx + 1)}
                >
                  {idx + 1}
                </button>
              </li>
            ))}
            <li className={`page-item${currentPage === totalPages ? " disabled" : ""}`}>
              <button
                className="page-link pagination-link"
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Sau
              </button>
            </li>
          </ul>
        </nav>
      </div>
    </>
  );
};

export default CommunityActivities;