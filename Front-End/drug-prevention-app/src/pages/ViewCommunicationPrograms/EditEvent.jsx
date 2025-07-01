import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getEventById, updateEvent } from "../../services/api";
import Header from "../../components/Header/Header";
import { FaSave, FaArrowLeft } from 'react-icons/fa';

const EditEvent = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        setLoading(true);
        setError("");
        const found = await getEventById(id);
        setEvent(found && found.data ? found.data : found);
      } catch (err) {
        setError("Không thể tải thông tin chương trình");
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEvent((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    try {
      await updateEvent(id, event);
      setMessage("✅ Cập nhật chương trình thành công!");
      setTimeout(() => navigate(`/event/${id}`), 1200);
    } catch (err) {
      setMessage("❌ Lỗi khi cập nhật chương trình!");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div></div>;
  }
  if (error || !event) {
    return <div className="flex flex-col items-center justify-center min-h-screen"><p className="text-red-500 mb-4">{error || "Không tìm thấy chương trình"}</p><button onClick={() => navigate(-1)} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-800">Quay lại</button></div>;
  }

  return (
    <>
      <Header />
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <button onClick={() => navigate(-1)} className="mb-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 font-semibold"><FaArrowLeft /> Quay lại</button>
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold mb-6 text-blue-700">Chỉnh sửa chương trình</h2>
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block font-medium mb-1">Tên chương trình</label>
              <input type="text" name="title" value={event.title || ""} onChange={handleChange} className="w-full border px-3 py-2 rounded-lg" required />
            </div>
            <div>
              <label className="block font-medium mb-1">Điều phối viên</label>
              <input type="text" name="programCoordinator" value={event.programCoordinator || ""} onChange={handleChange} className="w-full border px-3 py-2 rounded-lg" required />
            </div>
            <div>
              <label className="block font-medium mb-1">Địa điểm</label>
              <input type="text" name="location" value={event.location || ""} onChange={handleChange} className="w-full border px-3 py-2 rounded-lg" required />
            </div>
            <div>
              <label className="block font-medium mb-1">Thời gian bắt đầu</label>
              <input type="date" name="startDate" value={event.startDate ? event.startDate.substring(0,10) : ""} onChange={handleChange} className="w-full border px-3 py-2 rounded-lg" required />
            </div>
            <div>
              <label className="block font-medium mb-1">Thời gian kết thúc</label>
              <input type="date" name="endDate" value={event.endDate ? event.endDate.substring(0,10) : ""} onChange={handleChange} className="w-full border px-3 py-2 rounded-lg" required />
            </div>
            <div>
              <label className="block font-medium mb-1">Hình ảnh (URL)</label>
              <input type="text" name="imageUrl" value={event.imageUrl || ""} onChange={handleChange} className="w-full border px-3 py-2 rounded-lg" />
            </div>
            <div>
              <label className="block font-medium mb-1">Mô tả</label>
              <textarea name="description" value={event.description || ""} onChange={handleChange} className="w-full border px-3 py-2 rounded-lg" rows={4} required />
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

export default EditEvent; 