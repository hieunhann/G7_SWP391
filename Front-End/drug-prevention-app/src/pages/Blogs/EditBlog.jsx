import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Header from '../../components/Header/Header';
import { getBlogById, updateBlog } from '../../services/api';

const EditBlog = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [blog, setBlog] = useState({ title: '', content: '', type: '', imageUrl: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        setLoading(true);
        setError('');
        const numericId = Number(id);
        if (isNaN(numericId)) throw new Error('Invalid blog ID');
        let data = await getBlogById(numericId);
        // Nếu API trả về { data: blog }, lấy data.data
        if (data && data.data) data = data.data;
        if (!data || !data.id) throw new Error('Không tìm thấy blog');
        setBlog({
          title: data.title || '',
          content: data.content || '',
          type: data.type || '',
          imageUrl: data.imageUrl || '',
          id: data.id
        });
      } catch (err) {
        setError('Không thể tải dữ liệu blog');
      } finally {
        setLoading(false);
      }
    };
    fetchBlog();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setBlog((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await updateBlog(blog.id, blog);
      alert('Cập nhật blog thành công!');
      navigate(`/blog/${blog.id}`);
    } catch (err) {
      setError('Cập nhật blog thất bại: ' + (err.message || 'Lỗi không xác định'));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="text-center py-10">Đang tải...</div>;
  if (error) return <div className="text-center text-red-500 py-10">{error}</div>;
  if (!blog) return null;

  return (
    <>
      <Header />
      <div className="max-w-2xl mx-auto bg-white shadow-lg rounded-xl p-8 mt-10">
        <h2 className="text-2xl font-bold mb-6 text-center">Chỉnh sửa Blog</h2>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block font-semibold mb-1">Tiêu đề</label>
            <input
              type="text"
              name="title"
              value={blog.title}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded"
              required
            />
          </div>
          <div>
            <label className="block font-semibold mb-1">Nội dung</label>
            <textarea
              name="content"
              value={blog.content}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded min-h-[120px]"
              required
            />
          </div>
          <div>
            <label className="block font-semibold mb-1">Loại</label>
            <input
              type="text"
              name="type"
              value={blog.type}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded"
            />
          </div>
          <div>
            <label className="block font-semibold mb-1">Ảnh (URL)</label>
            <input
              type="text"
              name="imageUrl"
              value={blog.imageUrl}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded"
            />
          </div>
          {error && <div className="text-red-500">{error}</div>}
          <div className="flex gap-4 justify-end">
            <Link to={`/blog/${blog.id}`} className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400">Hủy</Link>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              disabled={saving}
            >
              {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default EditBlog;