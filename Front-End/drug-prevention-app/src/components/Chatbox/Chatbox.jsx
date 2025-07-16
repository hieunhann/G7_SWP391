import { useState } from "react";
import { FaComments, FaTimes } from "react-icons/fa";

export default function Chatbox() {
  const [open, setOpen] = useState(false);

  return (
    <div style={{
      position: "fixed",
      bottom: 24,
      right: 24,
      zIndex: 9999,
    }}>
      {open ? (
        <div className="w-80 bg-white rounded-xl shadow-2xl border border-gray-200 flex flex-col">
          <div className="flex items-center justify-between p-3 bg-green-600 rounded-t-xl text-white">
            <span>Hỗ trợ trực tuyến</span>
            <button onClick={() => setOpen(false)}><FaTimes /></button>
          </div>
          <div className="flex-1 p-4 overflow-y-auto" style={{ maxHeight: 300 }}>
            <div className="mb-4 text-green-700 font-semibold text-lg text-center">
              Xin chào! 👋<br/>
              Bạn cần hỗ trợ gì về phòng chống ma túy?
            </div>
            <ul className="mb-4 text-gray-800 text-sm list-disc pl-5">
              <li>Làm sao để nhận biết dấu hiệu sử dụng ma túy?</li>
              <li>Tư vấn hỗ trợ cai nghiện ở đâu?</li>
              <li>Làm gì khi phát hiện người thân sử dụng ma túy?</li>
              <li>Thông tin về các chương trình truyền thông cộng đồng</li>
              <li>Hỗ trợ tâm lý cho người nghiện và gia đình</li>
            </ul>
            <div className="mt-6 text-gray-700 text-sm border-t pt-3">
              <div className="font-semibold mb-1">Liên hệ hỗ trợ:</div>
              <div>Hotline: <a href="tel:1800xxxx" className="text-green-600 font-bold">1800 xxxx</a></div>
              <div>Email: <a href="mailto:hotro@phongchongmatuy.vn" className="text-green-600 font-bold">hotro@phongchongmatuy.vn</a></div>
            </div>
          </div>
        </div>
      ) : (
        <button
          className="bg-green-600 hover:bg-green-700 text-white rounded-full p-4 shadow-xl flex items-center"
          onClick={() => setOpen(true)}
        >
          <FaComments size={24} />
        </button>
      )}
    </div>
  );
} 