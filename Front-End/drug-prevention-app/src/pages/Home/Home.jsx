import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import Header from "../../components/Header/Header";
import {
  FaArrowRight,
  FaClipboardList,
  FaCalendarAlt,
  FaBullseye,
  FaPoll,
  FaComments,
  FaFacebookF,
  FaTwitter,
  FaYoutube,
  FaSearch,
} from "react-icons/fa";
import { getBlogs, getEvents } from "../../services/api";
import Chatbox from "../../components/Chatbox/Chatbox";

export default function HomePage() {
  const [search, setSearch] = useState("");
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(true);

  const trainingPrograms = [
    {
      title: "Học sinh",
      description: "Khóa học thiết kế riêng cho học sinh nâng cao nhận thức.",
      img: "https://static.vecteezy.com/system/resources/previews/000/511/962/original/vector-student-glyph-black-icon.jpg",
    },
    {
      title: "Sinh viên",
      description: "Chương trình kỹ năng phòng tránh dành cho sinh viên.",
      img: "https://cdn-icons-png.flaticon.com/512/3135/3135715.png",
    },
    {
      title: "Phụ huynh",
      description: "Hỗ trợ phụ huynh tư vấn và bảo vệ con cái.",
      img: "https://png.pngtree.com/png-vector/20220727/ourlarge/pngtree-kid-girl-and-mother-using-laptop-together-vector-png-image_6089049.png",
    },
    {
      title: "Giáo viên",
      description: "Tài liệu đào tạo giảng viên phòng chống ma túy.",
      img: "https://png.pngtree.com/element_origin_min_pic/17/01/01/f746eaac9809159f5d1c2f5149190263.jpg",
    },
  ];

  useEffect(() => {
    // Fetch blogs using the same API as BlogList
    const fetchBlogs = async () => {
      try {
        setLoading(true);
        const data = await getBlogs();
        // BlogList expects data.data, Home có thể cần kiểm tra
        if (Array.isArray(data?.data)) {
          setBlogs(data.data);
        } else if (Array.isArray(data)) {
          setBlogs(data);
        } else {
          setBlogs([]);
        }
      } catch (err) {
        console.error("Error fetching blogs:", err);
        setBlogs([]);
      } finally {
        setLoading(false);
      }
    };
    fetchBlogs();
    // Fetch events for community media section
    const fetchEvents = async () => {
      try {
        setLoadingEvents(true);
        const res = await getEvents();
        if (Array.isArray(res?.data)) {
          setEvents(res.data);
        } else if (Array.isArray(res)) {
          setEvents(res);
        } else {
          setEvents([]);
        }
      } catch (err) {
        console.error("Error fetching events:", err);
        setEvents([]);
      } finally {
        setLoadingEvents(false);
      }
    };
    fetchEvents();
  }, []);

  const filteredTrainingPrograms = trainingPrograms.filter(({ title }) =>
    title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <Header />

      <div className="min-h-screen bg-white text-black">
        {/* Hero Section */}
        <section className="relative text-center py-32 px-4  mx-auto bg-gradient-to-br from-green-50 via-white to-green-100">
          <motion.img
            src="https://attorneycarl.com/wp-content/uploads/2021/06/illegal-drugs-NO.jpeg"
            alt="drug prevention"
            className="absolute inset-0 w-full h-full object-cover opacity-60 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.3 }}
            transition={{ duration: 1 }}
          />
          <div className="relative z-10 bg-white/50 backdrop-blur-sm rounded-2xl p-10 md:p-12 mx-auto max-w-3xl shadow-xl border border-gray-200">
            <motion.h1
              className="text-4xl md:text-5xl font-bold leading-snug mb-6 text-green-700 drop-shadow-xl"
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              Cùng cộng đồng phòng chống ma túy hiệu quả
            </motion.h1>

            <p className="text-md md:text-lg text-gray-700 mb-8 leading-relaxed">
              Nâng cao nhận thức, kỹ năng phòng tránh và tư vấn hỗ trợ cá nhân &
              gia đình.
            </p>
            <Link to="/Surveys" >
              <motion.button
                className="inline-flex items-center bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-full transition-all shadow-lg"
                style={{ backgroundColor: "#007bff" }}
                whileHover={{ scale: 1.05 }}
              >
                Bắt đầu hành trình <FaArrowRight className="ml-2"   />
              </motion.button>
            </Link>
          </div>
        </section>

        {/* Khóa học đào tạo */}
        <section className="relative py-20 px-6 overflow-hidden bg-white">
          {/* Hình nền  */}
          <img
            src="https://images.saymedia-content.com/.image/t_share/MTc0NjQxODIwMDY2NjU0MTk4/amaado.jpg"
            alt="Education Background"
            className="absolute inset-0 w-full h-full object-cover opacity-60"
          />

          {/* Lớp làm dịu chỉ nhẹ nhẹ */}
          <div className="absolute inset-0 bg-white/20 backdrop-blur-[1px]" />

          <div className="max-w-6xl mx-auto relative z-10">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-center text-green-700 drop-shadow-lime-50">
              Chương trình đào tạo trực tuyến
            </h2>
            <p className="text-center text-black-500 mb-12 text-lg drop-shadow-sm">
              Phù hợp cho từng nhóm đối tượng
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
              {filteredTrainingPrograms.length > 0 ? (
                filteredTrainingPrograms.map(
                  ({ title, description, img }, index) => (
                    <motion.div
                      key={title}
                      className="bg-white/60 backdrop-blur-sm rounded-xl p-6 shadow-md flex flex-col items-center text-center border border-white/40 hover:shadow-xl transition"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.2 }}
                    >
                      <motion.img
                        src={img}
                        alt={title}
                        className="w-20 h-20 mb-4 rounded-full shadow-md object-cover"
                        initial={{ scale: 0.8, rotate: -10 }}
                        animate={{ scale: 1, rotate: 0 }}
                        whileHover={{ scale: 1.15, rotate: 5 }}
                        transition={{
                          duration: 0.5,
                          type: "spring",
                          stiffness: 200,
                        }}
                      />
                      <h3 className="text-lg font-semibold mb-2 text-gray-800">
                        {title}
                      </h3>
                      <p className="text-gray-700 text-sm mb-4">
                        {description}
                      </p>
                      <button className="bg-green-600 hover:bg-green-700 text-white py-2 px-5 rounded-full font-semibold transition transform hover:scale-105 shadow-md">
                        Xem chi tiết
                      </button>
                    </motion.div>
                  )
                )
              ) : (
                <p className="col-span-full text-center text-white drop-shadow">
                  Không tìm thấy khóa học phù hợp.
                </p>
              )}
            </div>
          </div>
        </section>

        {/* 📝 Blog Section */}
        <section className="py-24 px-6 max-w-6xl mx-auto bg-white">
          <h3 className="text-4xl font-extrabold mb-6 text-green-700 text-center drop-shadow-lg">
            Blog mới nhất
          </h3>
          <p className="text-center text-gray-700 text-lg mb-14 max-w-3xl mx-auto">
            Cập nhật kiến thức, câu chuyện và tin tức mới nhất về phòng chống ma
            túy.
          </p>

          {loading ? (
            <div className="text-center">Đang tải...</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12">
              {blogs.map((blog, index) => (
                <motion.div
                  key={blog.id}
                  className="relative rounded-3xl overflow-hidden shadow-xl bg-white border border-gray-200 cursor-pointer flex flex-col"
                  initial={{ opacity: 0, y: 40, scale: 0.95 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{
                    delay: index * 0.15,
                    duration: 0.5,
                    type: "spring",
                    stiffness: 120,
                  }}
                  viewport={{ once: true }}
                  whileHover={{
                    scale: 1.03,
                    boxShadow: "0 12px 28px rgba(72, 187, 120, 0.3)",
                  }}
                >
                  <div className="relative h-48 overflow-hidden rounded-t-3xl">
                  <img
                    src={blog.imageUrl || "https://cdn-icons-png.flaticon.com/512/2913/2913461.png"}
                    alt={blog.title}
                    className="w-full h-full object-cover"
                    onError={(e) => e.target.src = "https://cdn-icons-png.flaticon.com/512/2913/2913461.png"}
                  />
                    <div className="absolute inset-0 bg-gradient-to-t from-white/80 to-transparent opacity-90 hover:opacity-70 transition-opacity duration-300"></div>
                    <h4 className="absolute bottom-4 left-4 right-4 text-xl sm:text-2xl font-extrabold text-green-700 drop-shadow">
                      {blog.title}
                    </h4>
                  </div>
                  <div className="p-6 flex flex-col flex-grow items-center justify-end">
                    <Link
                      to={`/blog/${blog.id}`}
                      className="inline-flex items-center gap-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold px-6 py-3 rounded-full shadow-md transition-transform duration-300 ease-in-out hover:scale-105 focus:outline-none flex-shrink-0"
                      aria-label={`Xem chi tiết bài viết: ${blog.title}`}
                    >
                      Xem chi tiết <FaArrowRight />
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          <div className="text-center mt-12">
            <p className="mb-3 text-gray-600 text-base">Khám phá thêm nhiều bài viết hữu ích về phòng chống ma túy và sức khỏe cộng đồng.</p>
            <Link
              to="/blogs"
              className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-semibold px-8 py-3 rounded-full shadow-lg transition-all"
            >
              Xem tất cả bài viết <FaArrowRight />
            </Link>
          </div>
        </section>

        {/* 📝 Tự đánh giá nguy cơ */}
        <section className="py-24 px-6 max-w-6xl mx-auto text-center bg-white">
          <h2 className="text-4xl font-bold text-yellow-600 mb-4 drop-shadow-md">
            Tự đánh giá nguy cơ
          </h2>
          <p className="text-lg text-gray-700 mb-12 max-w-2xl mx-auto">
          Hãy chọn bài khảo sát phù hợp để nhận đánh giá sơ bộ về mức độ nguy cơ
          và lời khuyên hành động.
          </p>

          <div className="grid md:grid-cols-2 gap-10">
            {/* ASSIST */}
            <motion.div
              whileHover={{ scale: 1.03 }}
              className="bg-yellow-100 hover:bg-yellow-200 rounded-2xl shadow-xl p-6 flex flex-col items-center text-yellow-900 transition"
            >
              <FaClipboardList size={40} className="mb-4 text-yellow-700" />
              <h3 className="text-2xl font-semibold mb-2">Khảo sát ASSIST</h3>
              <p className="text-sm text-gray-800 mb-6">
                Công cụ sàng lọc được WHO khuyến nghị nhằm phát hiện mức độ sử
                dụng các chất gây nghiện.
              </p>
              <button className="bg-yellow-600 hover:bg-yellow-700 text-white font-semibold px-6 py-2 rounded-full transition">
                Bắt đầu khảo sát
              </button>
            </motion.div>

            {/* CRAFFT */}
            <motion.div
              whileHover={{ scale: 1.03 }}
              className="bg-yellow-100 hover:bg-yellow-200 rounded-2xl shadow-xl p-6 flex flex-col items-center text-yellow-900 transition"
            >
              <FaClipboardList size={40} className="mb-4 text-yellow-700" />
              <h3 className="text-2xl font-semibold mb-2">Khảo sát CRAFFT</h3>
              <p className="text-sm text-gray-800 mb-6">
                Công cụ dành cho thanh thiếu niên nhằm đánh giá nguy cơ lạm dụng
                rượu, thuốc và chất kích thích.
              </p>
              <button className="bg-yellow-600 hover:bg-yellow-700 text-white font-semibold px-6 py-2 rounded-full transition">
                Bắt đầu khảo sát
              </button>
            </motion.div>
          </div>

          {/* CTA bổ sung */}
          <div className="mt-16">
            <motion.button
              className="bg-yellow-500 hover:bg-yellow-600 text-white px-8 py-3 rounded-full font-semibold shadow-md inline-flex items-center gap-3 transition-all"
              whileHover={{ scale: 1.05 }}
            >
              <FaPoll size={18} /> Xem kết quả khảo sát gần đây
            </motion.button>
          </div>
        </section>

        {/* 📅 Gặp chuyên viên tư vấn */}
        <section className="relative bg-gradient-to-r from-indigo-900 via-indigo-800 to-indigo-700 py-24 px-6 text-center rounded-3xl max-w-6xl mx-auto shadow-2xl overflow-hidden">
          {/* Decorative background icon */}
          <motion.div
            className="absolute -top-10 -left-10 text-indigo-300 opacity-10 text-[250px] pointer-events-none"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 1 }}
          >
            💬
          </motion.div>

          <h2 className="text-4xl font-extrabold text-white mb-4 drop-shadow-lg">
            Gặp chuyên viên tư vấn
          </h2>
          <p className="text-gray-200 text-lg max-w-2xl mx-auto mb-12">
          Đặt lịch trò chuyện với chuyên viên tâm lý, bảo mật tuyệt đối và hoàn
          toàn miễn phí. Bạn không phải đối mặt một mình.
          </p>

          {/* CTA button */}
          <motion.button
            className="inline-flex items-center justify-center gap-3 bg-indigo-600 hover:bg-indigo-700 text-white px-10 py-4 rounded-full font-semibold shadow-xl transition"
            whileHover={{ scale: 1.05 }}
          >
            <FaCalendarAlt size={20} /> Đặt lịch ngay
          </motion.button>

          {/* Decorative wave */}
          <div className="absolute bottom-0 left-0 w-full h-8 bg-gradient-to-r from-indigo-800 to-indigo-900 rounded-t-3xl" />
        </section>

        {/* Truyền thông cộng đồng */}
        <section className="py-24 px-6 max-w-6xl mx-auto">
          <h3 className="text-4xl font-bold mb-4 text-green-400 text-center drop-shadow-lg">
            Truyền thông cộng đồng
          </h3>
          <p className="text-center text-black-500 text-lg mb-12 max-w-2xl mx-auto">
            Những hoạt động nổi bật giúp lan tỏa nhận thức và phòng chống ma túy trong cộng đồng.
          </p>
          {loadingEvents ? (
            <div className="text-center">Đang tải...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              {events.length === 0 ? (
                <div className="col-span-full text-center text-gray-500">Không có chương trình truyền thông nào.</div>
              ) : (
                events.slice(0, 3).map((event, index) => (
                  <motion.div
                    key={event.id}
                    className="bg-gradient-to-br from-green-700 via-green-800 to-green-900 p-6 rounded-2xl shadow-2xl text-center text-white hover:scale-105 hover:shadow-green-500/40 transition-all duration-300 group flex flex-col"
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.2 }}
                    viewport={{ once: true }}
                  >
                    <div className="mb-4 bg-white/10 p-4 w-16 h-16 mx-auto flex items-center justify-center rounded-full border border-white/20 group-hover:rotate-6 transition-transform duration-300">
                      <FaBullseye size={40} className="text-green-400" />
                    </div>
                    <h4 className="text-xl font-semibold mb-2">{event.title}</h4>
                    <p className="text-gray-200 text-sm mb-4 line-clamp-3">{event.description}</p>
                    <Link
                      to={`/event/${event.id}`}
                      className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-semibold px-6 py-2 rounded-full shadow-md transition-transform duration-300 ease-in-out hover:scale-105 focus:outline-none flex-shrink-0 mt-auto"
                      aria-label={`Xem chi tiết chương trình: ${event.title}`}
                    >
                      Xem chi tiết <FaArrowRight />
                    </Link>
                  </motion.div>
                ))
              )}
            </div>
          )}
          {/* CTA */}
          <div className="mt-16 text-center">
            <motion.button
              className="bg-green-500 hover:bg-green-600 text-white px-8 py-3 rounded-full font-semibold shadow-lg inline-flex items-center gap-3 transition-all"
              whileHover={{ scale: 1.05 }}
              onClick={() => window.location.href = '/ViewCommunicationPrograms'}
            >
              <FaBullseye size={18} /> Xem tất cả chiến dịch
            </motion.button>
          </div>
        </section>
      </div>
      <Chatbox />
    </>
  );
}
