import React, { useEffect, useState } from 'react';
import { getEvents } from '../../src/services/api.js';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar/Sidebar';
import { toast } from 'react-toastify';

const EventListForCheckOut = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchEventsData = async () => {
    try {
      const data = await getEvents();
      setEvents(data.data);
    } catch (error) {
      console.error('Lỗi khi tải danh sách sự kiện:', error);
      toast.error('Không thể tải danh sách sự kiện');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEventsData();
  }, []);

  if (loading) return <p>Đang tải danh sách sự kiện...</p>;

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 ml-[2vw]"></div>
    <div className="p-6 bg-white rounded-xl shadow-md">
      <h2 className="text-2xl font-semibold text-blue-800 mb-4">Danh sách sự kiện</h2>
      <table className="w-full table-auto border border-gray-300">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-4 py-2 border">Tiêu đề</th>
            <th className="px-4 py-2 border">Địa điểm</th>
            <th className="px-4 py-2 border">Ngày bắt đầu</th>
            <th className="px-4 py-2 border">Ngày kết thúc</th>
            <th className="px-4 py-2 border">Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {events.map((event) => (
            <tr key={event.id}>
              <td className="px-4 py-2 border">{event.title}</td>
              <td className="px-4 py-2 border">{event.location}</td>
              <td className="px-4 py-2 border">
                {event.startDate ? new Date(event.startDate).toLocaleDateString() : 'N/A'}
              </td>
              <td className="px-4 py-2 border">
                {event.endDate ? new Date(event.endDate).toLocaleDateString() : 'N/A'}
              </td>
              <td className="px-4 py-2 border">
                <button
                  onClick={() => navigate(`/event-checkout/${event.id}`)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded"
                >
                  Xem đăng ký
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    </div>
  );
};

export default EventListForCheckOut;
