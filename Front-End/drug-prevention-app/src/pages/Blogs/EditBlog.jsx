import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../../components/Header/Header';
import { getBlogById, updateBlog } from '../../services/api';
import { FaSave, FaArrowLeft } from 'react-icons/fa';

const EditBlog = () => {
  const user = JSON.parse(localStorage.getItem('user'));
  const { id } = useParams();
  const navigate = useNavigate();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        setLoading(true);
        setError("");
        let data = await getBlogById(Number(id));
        if (data && data.data) data = data.data;
        if (!data || !data.id) throw new Error('Không tìm thấy blog');
        setBlog({
          title: data.title || '',
          content: data.content || '',
          type: data.type || '',
          imageUrl: data.imageUrl || '',
          id: data.id,
          manager: data.manager
        });
      } catch (err) {
        setError("Không thể tải dữ liệu bài viết");
      } finally {
        setLoading(false);
      }
    };
    fetchBlog();
  }, [id]);

  // Chỉ cho MANAGER là chủ blog chỉnh sửa
  if (!loading && (!user || user.role !== 'MANAGER' || user.id !== blog?.manager?.id)) {
    return (
      <>
        <Header user={user} />
        <div className="max-w-xl mx-auto mt-10 text-center text-red-500 font-semibold">
          Bạn không có quyền chỉnh sửa bài viết này!
        </div>
      </>
    );
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setBlog((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    try {
      await updateBlog(blog.id, {
        title: blog.title,
        content: blog.content,
        type: blog.type,
        imageUrl: blog.imageUrl,
        managerId: user.id
      });
      setMessage("✅ Cập nhật bài viết thành công!");
      setTimeout(() => navigate(`/blog/${blog.id}`), 1200);
    } catch (err) {
      setMessage("❌ Lỗi khi cập nhật bài viết!");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div></div>;
  }
  if (error || !blog) {
    return <div className="flex flex-col items-center justify-center min-h-screen"><p className="text-red-500 mb-4">{error || "Không tìm thấy bài viết"}</p><button onClick={() => navigate(-1)} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-800">Quay lại</button></div>;
  }

  return (
    <>
      <Header user={user} />
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <button onClick={() => navigate(-1)} className="mb-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 font-semibold"><FaArrowLeft /> Quay lại</button>
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold mb-6 text-green-700">Chỉnh sửa bài viết</h2>
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block font-medium mb-1">Tiêu đề</label>
              <input type="text" name="title" value={blog.title} onChange={handleChange} className="w-full border px-3 py-2 rounded-lg" required />
            </div>
            <div>
              <label className="block font-medium mb-1">Nội dung</label>
              <textarea name="content" value={blog.content} onChange={handleChange} className="w-full border px-3 py-2 rounded-lg min-h-[120px]" required />
            </div>
            <div>
              <label className="block font-medium mb-1">Chủ đề</label>
              <input type="text" name="type" value={blog.type} onChange={handleChange} className="w-full border px-3 py-2 rounded-lg" />
            </div>
            <div>
              <label className="block font-medium mb-1">Ảnh (URL)</label>
              <input type="text" name="imageUrl" value={blog.imageUrl} onChange={handleChange} className="w-full border px-3 py-2 rounded-lg" />
            </div>
            <button type="submit" disabled={saving} className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 flex items-center justify-center gap-2 font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed">
              <FaSave />
              {saving ? "Đang lưu..." : "Lưu thay đổi"}
            </button>
            {message && <div className={`text-center mt-2 ${message.startsWith("✅") ? "text-green-600" : "text-red-500"}`}>{message}</div>}
          </form>
        </div>
      </div>
    </>
  );
};

export default EditBlog;