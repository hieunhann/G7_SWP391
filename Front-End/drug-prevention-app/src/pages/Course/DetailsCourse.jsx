import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";

const DetailsCourse = () => {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetch("http://localhost:5002/Course")
      .then((res) => res.json())
      .then((data) => {
        const courses = Array.isArray(data) && Array.isArray(data[0]) ? data[0] : data;
        const found = courses.find((c) => String(c.id) === String(id));
        setCourse(found);
      });
  }, [id]);

  // Hàm chuyển URL YouTube sang dạng embed
  const getEmbedUrl = (url) => {
    if (!url) return "";
    if (url.includes("youtube.com/watch")) {
      return url.replace("watch?v=", "embed/");
    }
    if (url.includes("youtu.be/")) {
      const videoId = url.split("youtu.be/")[1];
      return `https://www.youtube.com/embed/${videoId}`;
    }
    // Nếu không phải YouTube thì trả về nguyên URL
    return url;
  };

  if (!course) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-info" role="status"></div>
      </div>
    );
  }

  return (
    <>
    <div style={{ background: "#f8fafc", minHeight: "100vh" }}>
      <div className="container py-4">
        {/* Breadcrumb */}
        <nav style={{ "--bs-breadcrumb-divider": "'>'" }} aria-label="breadcrumb">
          <ol className="breadcrumb bg-transparent px-0 mb-2">
            <li className="breadcrumb-item">
              <Link to="/Course" style={{ color: "#00838f", textDecoration: "none" }}>
                COURSES
              </Link>
            </li>
            <li className="breadcrumb-item active" aria-current="page" style={{ color: "#222", fontWeight: 600 }}>
              {course.title?.toUpperCase()}
            </li>
          </ol>
        </nav>

        {/* Title and instruction */}
        <div className="text-center mb-4">
         
          <div
            style={{
              fontSize: "2rem",
              fontWeight: 700,
              color: "#00838f",
              fontStyle: "italic",
              marginTop: 8,
            }}
          >
            {course.title} <span style={{ fontWeight: 400 }}></span>
          </div>
        </div>

        {/* Video */}
        <div className="d-flex justify-content-center mb-4">
          {course.videoUrl ? (
            <div style={{ maxWidth: 700, width: "100%" }}>
              <div className="ratio ratio-16x9">
                <iframe
                  src={getEmbedUrl(course.videoUrl)}
                  title={course.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  style={{ borderRadius: "8px", border: "2px solid #b2dfdb" }}
                ></iframe>
              </div>
            </div>
          ) : (
            <div
              style={{
                width: 700,
                height: 394,
                background: "#e0e0e0",
                borderRadius: "8px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#888",
                fontSize: "1.2rem",
                border: "2px solid #b2dfdb",
              }}
            >
              Video is being updated...
            </div>
          )}
        </div>

        {/* Complete Button */}
        <div className="d-flex justify-content-center mb-5">
          <button
            className="btn"
            style={{
              border: "2px solid #00838f",
              color: "#00838f",
              fontWeight: 600,
              borderRadius: "4px",
              background: "#fff",
              padding: "10px 48px",
              fontSize: "1.25rem",
              letterSpacing: "1px",
              transition: "all 0.2s",
            }}
            onClick={() => navigate(-1)}
          >
            Complete{" "}
            <i className="bi bi-check-circle-fill" style={{ fontSize: "1.2rem", marginLeft: 8 }}></i>
          </button>
        </div>
      </div>

      {/* Bootstrap Icons CDN */}
      <link
        rel="stylesheet"
        href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.1/font/bootstrap-icons.css"
      />
    </div>
    </>
  );
};

export default DetailsCourse;
