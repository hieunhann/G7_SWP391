import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../components/Header/Header";
import { createEvent } from "../../services/api";
import Sidebar from "../../components/Sidebar/Sidebar"; 
const CreateEvent = () => {
  const [title, setTitle] = useState("");
  const [programCoordinator, setProgramCoordinator] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user"));
  const managerId = user?.id;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (
      !title ||
      !programCoordinator ||
      !description ||
      !location ||
      !startDate ||
      !endDate
    ) {
      setError("Vui lòng nhập đầy đủ thông tin!");
      return;
    }
    const event = {
      title,
      programCoordinator,
      description,
      location,
      imageUrl,
      startDate,
      endDate,
      manager: { id: managerId },
    };
    try {
      await createEvent(event);
      setSuccess("Tạo chương trình thành công!");
      setTimeout(() => navigate("/"), 1500);
    } catch (err) {
      setError("Lỗi khi tạo chương trình: " + err.message);
    }
  };

  return (
    <>
      <Header />
      <div className="flex">
        <Sidebar />
        <div className="flex-1 ml-[15vw]"></div>
        <div className="container mx-auto px-4 py-8 max-w-xl">
          <h2 className="text-2xl font-bold mb-6 text-center">
            Tạo chương trình mới
          </h2>
          {error && <div className="text-red-500 mb-4">{error}</div>}
          {success && <div className="text-green-600 mb-4">{success}</div>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block font-medium mb-1">Tên chương trình</label>
              <input
                type="text"
                className="w-full border px-3 py-2 rounded"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div>
              <label className="block font-medium mb-1">Điều phối viên</label>
              <input
                type="text"
                className="w-full border px-3 py-2 rounded"
                value={programCoordinator}
                onChange={(e) => setProgramCoordinator(e.target.value)}
              />
            </div>
            <div>
              <label className="block font-medium mb-1">Mô tả</label>
              <textarea
                className="w-full border px-3 py-2 rounded"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>
            <div>
              <label className="block font-medium mb-1">Địa điểm</label>
              <input
                type="text"
                className="w-full border px-3 py-2 rounded"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>
            <div>
              <label className="block font-medium mb-1">
                Link hình ảnh (tùy chọn)
              </label>
              <input
                type="text"
                className="w-full border px-3 py-2 rounded"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
              />
            </div>
            <div>
              <label className="block font-medium mb-1">Ngày bắt đầu</label>
              <input
                type="date"
                className="w-full border px-3 py-2 rounded"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div>
              <label className="block font-medium mb-1">Ngày kết thúc</label>
              <input
                type="date"
                className="w-full border px-3 py-2 rounded"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 font-semibold"
            >
              Tạo chương trình
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default CreateEvent;
