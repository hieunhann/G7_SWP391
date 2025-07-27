import React, { useEffect, useState } from "react";
import { getRegistrations, getMemberById, checkOut } from "../../src/services/api";
import { toast } from "react-toastify";

const EventCheckOutList = () => {
  const [registrationData, setRegistrationData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch all registrations and attach member info
  useEffect(() => {
    const fetchData = async () => {
      try {
        const regResponse = await getRegistrations();
        const regList = regResponse?.data || [];

        // For each registration, fetch member info
        const enrichedRegistrations = await Promise.all(
          regList.map(async (reg) => {
            try {
              const member = await getMemberById(reg.memberId);
              return { ...reg, member: member.data }; // Attach member data
            } catch (err) {
              console.error(`Failed to load member ${reg.memberId}`, err);
              return { ...reg, member: null };
            }
          })
        );

        setRegistrationData(enrichedRegistrations);
      } catch (error) {
        console.error("Error loading data:", error);
        toast.error("Lỗi khi tải danh sách!");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleCheckOut = async (memberId, eventId) => {
    try {
      await checkOut(memberId, eventId, "CHECKED_OUT");
      toast.success("Điểm danh thành công!");
      setRegistrationData((prev) =>
        prev.map((reg) =>
          reg.memberId === memberId && reg.eventId === eventId
            ? { ...reg, status: "CHECKED_OUT" }
            : reg
        )
      );
    } catch (error) {
      console.error("Check out error:", error);
      toast.error("Lỗi khi điểm danh!");
    }
  };

  if (loading) {
    return <div className="p-6">Đang tải dữ liệu...</div>;
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Danh sách đăng ký sự kiện</h2>
      <table className="w-full border-collapse border rounded-lg shadow">
        <thead>
          <tr className="bg-blue-100 text-center">
            <th className="p-2 border">#</th>
            <th className="p-2 border">Tên thành viên</th>
            <th className="p-2 border">Email</th>
            <th className="p-2 border">SĐT</th>
            <th className="p-2 border">Trạng thái</th>
            <th className="p-2 border">Hành động</th>
          </tr>
        </thead>
        <tbody>
          {registrationData.map((reg, index) => {
            const member = reg.member;
            return (
              <tr key={reg.id} className="text-center">
                <td className="p-2 border">{index + 1}</td>
                <td className="p-2 border">
                  {member ? `${member.firstName} ${member.lastName}` : "Không rõ"}
                </td>
                <td className="p-2 border">{member?.email || "-"}</td>
                <td className="p-2 border">{member?.phoneNumber || "-"}</td>
                <td className="p-2 border">{reg.status}</td>
                <td className="p-2 border">
                  {reg.status !== "CHECKED_OUT" ? (
                    <button
                      className="bg-blue-600 hover:bg-blue-800 text-white px-4 py-1 rounded"
                      onClick={() => handleCheckOut(reg.memberId, reg.eventId)}
                    >
                      Check Out
                    </button>
                  ) : (
                    <span className="text-green-600 font-semibold">Đã điểm danh</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default EventCheckOutList;
