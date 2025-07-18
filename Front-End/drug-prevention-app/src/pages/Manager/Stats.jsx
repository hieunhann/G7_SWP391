import React, { useEffect, useState } from "react";
import { Bar, Pie, Line } from "react-chartjs-2";
import {
  Chart,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import Sidebar from "../../components/Sidebar/Sidebar";
import axios from "axios";
import { getRegistrations } from "../../services/api";
import {
  FaUser,
  FaChartBar,
  FaUserCheck,
  FaUserTie,
  FaUserFriends,
} from "react-icons/fa";

Chart.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler
);

function groupBy(data, type = "month") {
  // type: 'month' | 'week'
  const result = {};
  data.forEach((item) => {
    if (!item.createdAt) return;
    const d = new Date(item.createdAt);
    let key = "";
    if (type === "month") {
      key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    } else if (type === "week") {
      // ISO week number
      const firstDayOfYear = new Date(d.getFullYear(), 0, 1);
      const pastDaysOfYear = (d - firstDayOfYear) / 86400000;
      const week = Math.ceil(
        (pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7
      );
      key = `${d.getFullYear()}-W${String(week).padStart(2, "0")}`;
    }
    result[key] = (result[key] || 0) + 1;
  });
  return result;
}

export default function Stats() {
  const [filter, setFilter] = useState("all"); // 'all' | 'month' | 'week'
  const [courseRaw, setCourseRaw] = useState([]);
  const [eventRaw, setEventRaw] = useState([]);
  const [userRaw, setUserRaw] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      setLoading(true);
      try {
        // Đăng ký khóa học
        const courseRes = await axios.get("/api/v1/registration/");
        console.log("courseRes.data:", courseRes.data);
        setCourseRaw(
          Array.isArray(courseRes.data?.data)
            ? courseRes.data.data
            : Array.isArray(courseRes.data)
            ? courseRes.data
            : []
        );
        // Đăng ký event (dùng getRegistrations)
        const eventRegs = await getRegistrations();
        console.log("eventRegs:", eventRegs); // DEBUG
        setEventRaw(Array.isArray(eventRegs.data) ? eventRegs.data : []);
        // Đăng ký tài khoản
        const userRes = await axios.get("/api/v1/users");
        console.log("userRes.data:", userRes.data);
        let users = [];
        if (Array.isArray(userRes.data?.data?.result))
          users = userRes.data.data.result;
        else if (Array.isArray(userRes.data?.data)) users = userRes.data.data;
        else if (Array.isArray(userRes.data)) users = userRes.data;
        setUserRaw(users);
      } catch (err) {
        setCourseRaw([]);
        setEventRaw([]);
        setUserRaw([]);
      }
      setLoading(false);
    }
    fetchStats();
  }, []);

  // Xử lý dữ liệu cho biểu đồ tổng
  const courseTotal = courseRaw.length;
  const eventTotal = eventRaw.length;
  const userTotal = userRaw.length;

  // Xử lý dữ liệu cho biểu đồ chi tiết
  let courseDetail = { labels: ["Tổng"], data: [courseTotal] };
  let eventDetail = { labels: ["Tổng"], data: [eventTotal] };
  let userDetail = { labels: ["Tổng"], data: [userTotal] };

  if (
    filter === "month" &&
    (courseRaw.length || eventRaw.length || userRaw.length)
  ) {
    const c = groupBy(courseRaw, "month");
    const e = groupBy(eventRaw, "month");
    const u = groupBy(userRaw, "month");
    const allLabels = Array.from(
      new Set([...Object.keys(c), ...Object.keys(e), ...Object.keys(u)])
    ).sort();
    courseDetail = { labels: allLabels, data: allLabels.map((l) => c[l] || 0) };
    eventDetail = { labels: allLabels, data: allLabels.map((l) => e[l] || 0) };
    userDetail = { labels: allLabels, data: allLabels.map((l) => u[l] || 0) };
  } else if (
    filter === "week" &&
    (courseRaw.length || eventRaw.length || userRaw.length)
  ) {
    const c = groupBy(courseRaw, "week");
    const e = groupBy(eventRaw, "week");
    const u = groupBy(userRaw, "week");
    const allLabels = Array.from(
      new Set([...Object.keys(c), ...Object.keys(e), ...Object.keys(u)])
    ).sort();
    courseDetail = { labels: allLabels, data: allLabels.map((l) => c[l] || 0) };
    eventDetail = { labels: allLabels, data: allLabels.map((l) => e[l] || 0) };
    userDetail = { labels: allLabels, data: allLabels.map((l) => u[l] || 0) };
  }

  // Thống kê trạng thái đăng ký event
  const eventStatusCount = eventRaw.reduce((acc, cur) => {
    acc[cur.status] = (acc[cur.status] || 0) + 1;
    return acc;
  }, {});
  const eventStatusLabels = Object.keys(eventStatusCount);
  const eventStatusData = eventStatusLabels.map((l) => eventStatusCount[l]);
  const eventStatusColors = ["#22c55e", "#f59e42", "#ef4444"]; // APPROVED, PENDING, REJECTED

  // Thống kê user theo role
  const userRoleCount = userRaw.reduce((acc, cur) => {
    acc[cur.role] = (acc[cur.role] || 0) + 1;
    return acc;
  }, {});
  const userRoleLabels = Object.keys(userRoleCount);
  const userRoleData = userRoleLabels.map((l) => userRoleCount[l]);
  const userRoleColors = [
    "#22c55e", // ADMIN
    "#3b82f6", // MANAGER
    "#f59e42", // CONSULTANT
    "#a78bfa", // MEMBER
    "#ef4444", // khác
  ];

  // Tổng quan số lượng
  const overview = [
    {
      label: "Tài khoản",
      value: userRaw.length,
      icon: <FaUser className="text-indigo-500 text-3xl" />,
      border: "border-indigo-400",
      bg: "bg-indigo-100",
    },
    {
      label: "Đăng ký sự kiện",
      value: eventRaw.length,
      icon: <FaChartBar className="text-blue-500 text-3xl" />,
      border: "border-blue-400",
      bg: "bg-blue-100",
    },
    {
      label: "Đăng ký khóa học",
      value: courseRaw.length,
      icon: <FaUserCheck className="text-green-500 text-3xl" />,
      border: "border-green-400",
      bg: "bg-green-100",
    },
  ];

  return (
    <>
      <div className="flex">
        <Sidebar />
        <div className="flex-1 ml-[220px]">
          <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 py-6 sm:py-10 px-1 sm:px-4 md:px-8">
            <div className="max-w-7xl mx-auto">
              <h2 className="text-3xl sm:text-4xl font-extrabold mb-6 sm:mb-8 text-green-700 text-center drop-shadow-lg tracking-wide uppercase">
                Thống kê hệ thống
              </h2>
              {/* Tổng quan */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-8 mb-10 sm:mb-14">
                {overview.map((item, idx) => (
                  <div
                    key={item.label}
                    className={`bg-white rounded-3xl shadow-xl p-6 sm:p-10 flex flex-col items-center border-t-8 ${item.border} hover:scale-105 hover:shadow-2xl transition-transform duration-200 group`}
                  >
                    <div
                      className={`mb-4 w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center rounded-full ${item.bg} group-hover:scale-110 transition-transform`}
                    >
                      {item.icon}
                    </div>
                    <div className="text-4xl sm:text-5xl font-extrabold text-green-700 mb-2 tracking-tight drop-shadow-lg">
                      {item.value}
                    </div>
                    <div className="text-base sm:text-lg text-gray-600 font-semibold mb-1 uppercase tracking-wide">
                      {item.label}
                    </div>
                  </div>
                ))}
              </div>

              {/* SECTION: TÀI KHOẢN */}
              <div className="mb-12 sm:mb-16">
                <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-indigo-700 mb-4 sm:mb-6 border-l-4 sm:border-l-8 border-indigo-400 pl-2 sm:pl-4 uppercase tracking-wide">
                  Tài khoản
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-10">
                  <div className="bg-white rounded-3xl shadow-2xl p-4 sm:p-8 flex flex-col items-center border-2 border-indigo-200 hover:shadow-indigo-200/60 transition-shadow w-full max-w-full overflow-x-auto">
                    <h4 className="text-lg sm:text-xl font-bold mb-2 text-indigo-700 flex items-center gap-2 uppercase tracking-wide">
                      <FaUserFriends className="text-indigo-400" /> Đăng ký tài
                      khoản theo thời gian
                    </h4>
                    <p className="text-gray-500 mb-4 text-xs sm:text-sm">
                      Biểu đồ thể hiện số lượng tài khoản mới được tạo theo từng
                      mốc thời gian.
                    </p>
                    {loading ? (
                      <div>Đang tải...</div>
                    ) : (
                      <div className="w-full max-w-full overflow-x-auto">
                        <Line
                          data={{
                            labels: userDetail.labels,
                            datasets: [
                              {
                                label: "Số tài khoản mới",
                                data: userDetail.data,
                                borderColor: "#6366f1",
                                backgroundColor: "rgba(99,102,241,0.2)",
                                tension: 0.4,
                                fill: true,
                              },
                            ],
                          }}
                          options={{
                            responsive: true,
                            plugins: { legend: { display: false } },
                          }}
                          height={220}
                        />
                      </div>
                    )}
                  </div>
                  <div className="bg-white rounded-3xl shadow-2xl p-4 sm:p-8 flex flex-col items-center border-2 border-indigo-200 hover:shadow-indigo-200/60 transition-shadow w-full max-w-full overflow-x-auto">
                    <h4 className="text-lg sm:text-xl font-bold mb-2 text-indigo-700 flex items-center gap-2 uppercase tracking-wide">
                      <FaUserTie className="text-indigo-400" /> Tỷ lệ tài khoản
                      theo vai trò
                    </h4>
                    <p className="text-gray-500 mb-4 text-xs sm:text-sm">
                      Biểu đồ thể hiện tỷ lệ các loại tài khoản (admin, manager,
                      consultant, member, ...).
                    </p>
                    {loading ? (
                      <div>Đang tải...</div>
                    ) : (
                      <>
                        <div className="w-full max-w-full overflow-x-auto">
                          <Pie
                            data={{
                              labels: userRoleLabels,
                              datasets: [
                                {
                                  data: userRoleData,
                                  backgroundColor: userRoleColors.slice(
                                    0,
                                    userRoleLabels.length
                                  ),
                                },
                              ],
                            }}
                            options={{
                              responsive: true,
                              plugins: { legend: { position: "bottom" } },
                            }}
                            height={180}
                          />
                        </div>
                        <div className="h-6 sm:h-8" />
                        <div className="w-full max-w-full overflow-x-auto">
                          <Bar
                            data={{
                              labels: userRoleLabels,
                              datasets: [
                                {
                                  label: "Số lượng",
                                  data: userRoleData,
                                  backgroundColor: userRoleColors.slice(
                                    0,
                                    userRoleLabels.length
                                  ),
                                },
                              ],
                            }}
                            options={{
                              responsive: true,
                              plugins: { legend: { display: false } },
                            }}
                            height={180}
                          />
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* SECTION: SỰ KIỆN */}
              <div className="mb-12 sm:mb-16">
                <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-blue-700 mb-4 sm:mb-6 border-l-4 sm:border-l-8 border-blue-400 pl-2 sm:pl-4 uppercase tracking-wide">
                  Sự kiện
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-10">
                  <div className="bg-white rounded-3xl shadow-2xl p-4 sm:p-8 flex flex-col items-center border-2 border-blue-200 hover:shadow-blue-200/60 transition-shadow w-full max-w-full overflow-x-auto">
                    <h4 className="text-lg sm:text-xl font-bold mb-2 text-blue-700 flex items-center gap-2 uppercase tracking-wide">
                      <FaChartBar className="text-blue-400" /> Đăng ký sự kiện
                      theo thời gian
                    </h4>
                    <p className="text-gray-500 mb-4 text-xs sm:text-sm">
                      Biểu đồ thể hiện số lượt đăng ký sự kiện theo từng mốc
                      thời gian.
                    </p>
                    {loading ? (
                      <div>Đang tải...</div>
                    ) : (
                      <div className="w-full max-w-full overflow-x-auto">
                        <Line
                          data={{
                            labels: eventDetail.labels,
                            datasets: [
                              {
                                label: "Số người đăng ký",
                                data: eventDetail.data,
                                borderColor: "#3b82f6",
                                backgroundColor: "rgba(59,130,246,0.2)",
                                tension: 0.4,
                                fill: true,
                              },
                            ],
                          }}
                          options={{
                            responsive: true,
                            plugins: { legend: { display: false } },
                          }}
                          height={220}
                        />
                      </div>
                    )}
                  </div>
                  <div className="bg-white rounded-3xl shadow-2xl p-4 sm:p-8 flex flex-col items-center border-2 border-blue-200 hover:shadow-blue-200/60 transition-shadow w-full max-w-full overflow-x-auto">
                    <h4 className="text-lg sm:text-xl font-bold mb-2 text-blue-700 flex items-center gap-2 uppercase tracking-wide">
                      <FaChartBar className="text-blue-400" /> Tỷ lệ trạng thái
                      đăng ký sự kiện
                    </h4>
                    <p className="text-gray-500 mb-4 text-xs sm:text-sm">
                      Biểu đồ thể hiện tỷ lệ trạng thái đăng ký sự kiện (đã
                      duyệt, chờ duyệt, từ chối).
                    </p>
                    {loading ? (
                      <div>Đang tải...</div>
                    ) : (
                      <>
                        <div className="w-full max-w-full overflow-x-auto">
                          <Pie
                            data={{
                              labels: eventStatusLabels,
                              datasets: [
                                {
                                  data: eventStatusData,
                                  backgroundColor: eventStatusColors.slice(
                                    0,
                                    eventStatusLabels.length
                                  ),
                                },
                              ],
                            }}
                            options={{
                              responsive: true,
                              plugins: { legend: { position: "bottom" } },
                            }}
                            height={180}
                          />
                        </div>
                        <div className="h-6 sm:h-8" />
                        <div className="w-full max-w-full overflow-x-auto">
                          <Bar
                            data={{
                              labels: eventStatusLabels,
                              datasets: [
                                {
                                  label: "Số lượng",
                                  data: eventStatusData,
                                  backgroundColor: eventStatusColors.slice(
                                    0,
                                    eventStatusLabels.length
                                  ),
                                },
                              ],
                            }}
                            options={{
                              responsive: true,
                              plugins: { legend: { display: false } },
                            }}
                            height={180}
                          />
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* SECTION: KHÓA HỌC */}
              <div className="mb-12 sm:mb-16">
                <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-green-700 mb-4 sm:mb-6 border-l-4 sm:border-l-8 border-green-400 pl-2 sm:pl-4 uppercase tracking-wide">
                  Khóa học
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-10">
                  <div className="bg-white rounded-3xl shadow-2xl p-4 sm:p-8 flex flex-col items-center border-2 border-green-200 hover:shadow-green-200/60 transition-shadow w-full max-w-full overflow-x-auto">
                    <h4 className="text-lg sm:text-xl font-bold mb-2 text-green-700 flex items-center gap-2 uppercase tracking-wide">
                      <FaUserCheck className="text-green-400" /> Đăng ký khóa
                      học theo thời gian
                    </h4>
                    <p className="text-gray-500 mb-4 text-xs sm:text-sm">
                      Biểu đồ thể hiện số lượt đăng ký khóa học theo từng mốc
                      thời gian.
                    </p>
                    {loading ? (
                      <div>Đang tải...</div>
                    ) : (
                      <div className="w-full max-w-full overflow-x-auto">
                        <Line
                          data={{
                            labels: courseDetail.labels,
                            datasets: [
                              {
                                label: "Số người đăng ký",
                                data: courseDetail.data,
                                borderColor: "#22c55e",
                                backgroundColor: "rgba(34,197,94,0.2)",
                                tension: 0.4,
                                fill: true,
                              },
                            ],
                          }}
                          options={{
                            responsive: true,
                            plugins: { legend: { display: false } },
                          }}
                          height={220}
                        />
                      </div>
                    )}
                  </div>
                  {/* NEW: Pie and Bar charts for course registration by course name */}
                  <div className="bg-white rounded-3xl shadow-2xl p-4 sm:p-8 flex flex-col items-center border-2 border-green-200 hover:shadow-green-200/60 transition-shadow w-full max-w-full overflow-x-auto">
                    <h4 className="text-lg sm:text-xl font-bold mb-2 text-green-700 flex items-center gap-2 uppercase tracking-wide">
                      <FaUserCheck className="text-green-400" /> Tỷ lệ đăng ký
                      theo khóa học
                    </h4>
                    <p className="text-gray-500 mb-4 text-xs sm:text-sm">
                      Biểu đồ thể hiện tỷ lệ đăng ký theo từng khóa học.
                    </p>
                    {loading ? (
                      <div>Đang tải...</div>
                    ) : (
                      <>
                        <div className="w-full max-w-full overflow-x-auto">
                          <Pie
                            data={{
                              labels: courseRaw.reduce((acc, cur) => {
                                const name =
                                  cur.courseName ||
                                  cur.course ||
                                  cur.name ||
                                  "Khóa học khác";
                                if (!acc.includes(name)) acc.push(name);
                                return acc;
                              }, []),
                              datasets: [
                                {
                                  data: (() => {
                                    const counts = {};
                                    courseRaw.forEach((cur) => {
                                      const name =
                                        cur.courseName ||
                                        cur.course ||
                                        cur.name ||
                                        "Khóa học khác";
                                      counts[name] = (counts[name] || 0) + 1;
                                    });
                                    return Object.values(counts);
                                  })(),
                                  backgroundColor: [
                                    "#22c55e",
                                    "#3b82f6",
                                    "#f59e42",
                                    "#a78bfa",
                                    "#ef4444",
                                    "#fbbf24",
                                    "#6366f1",
                                    "#10b981",
                                    "#eab308",
                                    "#f472b6",
                                  ],
                                },
                              ],
                            }}
                            options={{
                              responsive: true,
                              plugins: { legend: { position: "bottom" } },
                            }}
                            height={180}
                          />
                        </div>
                        <div className="h-6 sm:h-8" />
                        <div className="w-full max-w-full overflow-x-auto">
                          <Bar
                            data={{
                              labels: courseRaw.reduce((acc, cur) => {
                                const name =
                                  cur.courseName ||
                                  cur.course ||
                                  cur.name ||
                                  "Khóa học khác";
                                if (!acc.includes(name)) acc.push(name);
                                return acc;
                              }, []),
                              datasets: [
                                {
                                  label: "Số lượt đăng ký",
                                  data: (() => {
                                    const counts = {};
                                    courseRaw.forEach((cur) => {
                                      const name =
                                        cur.courseName ||
                                        cur.course ||
                                        cur.name ||
                                        "Khóa học khác";
                                      counts[name] = (counts[name] || 0) + 1;
                                    });
                                    return Object.values(counts);
                                  })(),
                                  backgroundColor: [
                                    "#22c55e",
                                    "#3b82f6",
                                    "#f59e42",
                                    "#a78bfa",
                                    "#ef4444",
                                    "#fbbf24",
                                    "#6366f1",
                                    "#10b981",
                                    "#eab308",
                                    "#f472b6",
                                  ],
                                },
                              ],
                            }}
                            options={{
                              responsive: true,
                              plugins: { legend: { display: false } },
                            }}
                            height={180}
                          />
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
