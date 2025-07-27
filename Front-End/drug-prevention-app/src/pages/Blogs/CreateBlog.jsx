import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../components/Header/Header";
import { createBlog } from "../../services/api";
import Sidebar from "../../components/Sidebar/Sidebar";
const CreateBlog = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [type, setType] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!title || !content || !type) {
      setError("Vui lòng nhập đầy đủ thông tin");
      return;
    }
    if (!user || user.role !== "MANAGER") {
      setError("Bạn không có quyền tạo bài viết");
      return;
    }
    try {
      const blogData = {
        title,
        content,
        type,
        managerId: user.id,
        imageUrl,
      };
      await createBlog(blogData);
      setSuccess("Tạo bài viết thành công!");
      setTimeout(() => navigate("/blogs"), 1200);
    } catch (err) {
      setError("Có lỗi xảy ra khi tạo bài viết");
    }
  };

  return (
    <div>
      <Header user={user} />
      <div className="flex">
        <Sidebar />
        <div className="flex-1 ml-[220px]">
          <div className="container mx-auto px-4 py-8 max-w-xl">
            <h2 className="text-2xl font-bold mb-6 text-darkblue-800 text-center">
              Tạo bài viết mới
            </h2>
            {error && <div className="text-red-500 mb-4">{error}</div>}
            {success && <div className="text-green-600 mb-4">{success}</div>}
            <form
              onSubmit={handleSubmit}
              className="bg-white p-6 rounded-lg shadow-md"
            >
              <div className="mb-4">
                <label className="block mb-1 font-semibold">Tiêu đề</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-darkblue-500"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block mb-1 font-semibold">Nội dung</label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-darkblue-500"
                  rows={6}
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block mb-1 font-semibold">Chủ đề</label>
                <input
                  type="text"
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-darkblue-500"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block mb-1 font-semibold">Ảnh (URL)</label>
                <input
                  type="text"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-darkblue-500"
                  placeholder="https://..."
                />
              </div>
              <button
                type="submit"
               className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 transition-colors font-semibold"

              >
                Tạo bài viết
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateBlog;
