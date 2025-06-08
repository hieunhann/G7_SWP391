import { useState } from "react";
import { motion } from "framer-motion";
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

export default function HomePage() {
  const [search, setSearch] = useState("");

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

  const communityMediaItems = [
    {
      icon: <FaBullseye size={40} className="text-green-400 mb-4" />,
      title: "Chiến dịch nâng cao nhận thức",
      description:
        "Tổ chức các chiến dịch truyền thông đa kênh giúp nâng cao kiến thức về phòng chống ma túy.",
    },
    {
      icon: <FaPoll size={40} className="text-green-400 mb-4" />,
      title: "Khảo sát hiệu quả",
      description:
        "Thực hiện khảo sát để đánh giá tác động và hiệu quả của các chương trình.",
    },
    {
      icon: <FaComments size={40} className="text-green-400 mb-4" />,
      title: "Phản hồi từ người tham gia",
      description:
        "Lắng nghe ý kiến, góp ý từ cộng đồng để cải tiến các hoạt động.",
    },
  ];
  const blogs = [
    {
      id: 1,
      title: "5 cách phòng tránh ma túy hiệu quả cho thanh thiếu niên",
      excerpt:
        "Tìm hiểu những phương pháp đơn giản và thiết thực giúp thanh thiếu niên tránh xa ma túy.",
      img: "https://cdn-icons-png.flaticon.com/512/2913/2913461.png",
    },
    {
      id: 2,
      title: "Vai trò của gia đình trong phòng chống ma túy",
      excerpt:
        "Gia đình có thể làm gì để giúp con em mình nhận biết và tránh xa nguy cơ ma túy?",
      img: "https://cdn-icons-png.flaticon.com/512/2721/2721277.png",
    },
    {
      id: 3,
      title: "Chia sẻ kinh nghiệm từ chuyên gia tư vấn tâm lý",
      excerpt:
        "Những lời khuyên quý giá giúp nhận diện dấu hiệu sử dụng ma túy và cách can thiệp.",
      img: "https://cdn-icons-png.flaticon.com/512/149/149071.png",
    },
  ];

  const filteredTrainingPrograms = trainingPrograms.filter(({ title }) =>
    title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-black to-gray-900 text-white">
      {/* Hero Section */}
      <section className="relative text-center py-32 px-4 max-w-6xl mx-auto">
        <motion.img
          src="https://americaontrack.org/wp-content/uploads/2020/09/DrugUse-1024x666.jpg"
          alt="drug prevention"
          className="absolute inset-0 w-full h-full object-cover opacity-20 pointer-events-none rounded-lg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.15 }}
          transition={{ duration: 1 }}
        />
        <div className="relative z-10 backdrop-blur-md bg-black/40 rounded-lg p-10 mx-auto max-w-3xl shadow-xl border border-white/10">
          <motion.h1
            className="text-5xl md:text-6xl font-extrabold leading-tight mb-6 text-green-300 drop-shadow"
            initial={{ y: -30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
          >
            Cùng cộng đồng phòng chống ma túy hiệu quả
          </motion.h1>
          <p className="text-lg md:text-xl text-gray-300 mb-10">
            Nâng cao nhận thức, kỹ năng phòng tránh và tư vấn hỗ trợ cá nhân &
            gia đình.
          </p>
          <motion.button
            className="inline-flex items-center bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-8 rounded-full transition shadow-lg"
            whileHover={{ scale: 1.05 }}
          >
                Bắt đầu hành trình <FaArrowRight className="ml-3" />
          </motion.button>
        </div>
      </section>

      {/* Khóa học đào tạo */}
      <section className="bg-black/40 py-20 px-6 relative overflow-hidden">
        <img
          src="https://worlddidac.org/wp-content/uploads/2019/07/AdobeStock_273644746.jpeg"
          alt="Education Background"
          className="absolute inset-0 w-full h-full object-cover opacity-10"
        />
        <div className="max-w-6xl mx-auto relative z-10">
          <h2 className="text-3xl font-bold mb-4 text-center text-green-400 drop-shadow-md">
            Chương trình đào tạo trực tuyến
          </h2>
          <p className="text-center text-gray-300 mb-10">
            Phù hợp cho từng nhóm đối tượng
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
            {filteredTrainingPrograms.length > 0 ? (
              filteredTrainingPrograms.map(
                ({ title, description, img }, index) => (
                  <motion.div
                    key={title}
                    className="bg-gray-800 bg-opacity-70 rounded-xl p-6 shadow-lg flex flex-col items-center text-center hover:bg-green-800 transition"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.2 }}
                  >
                    <motion.img
                      src={img}
                      alt={title}
                      className="w-20 h-20 mb-4 rounded-full shadow-md"
                      initial={{ scale: 0, rotate: -15 }}
                      animate={{ scale: 1, rotate: 0 }}
                      whileHover={{ scale: 1.15, rotate: 5 }}
                      transition={{
                        duration: 0.6,
                        type: "spring",
                        stiffness: 200,
                      }}
                    />
                    <h3 className="text-xl font-semibold mb-2">{title}</h3>
                    <p className="text-gray-300 text-sm mb-4">{description}</p>
                    <button className="bg-green-600 hover:bg-green-700 text-white py-2 px-5 rounded-full font-semibold transition transform hover:scale-105 shadow-md">
                      Xem chi tiết
                    </button>
                  </motion.div>
                )
              )
            ) : (
              <p className="col-span-full text-center text-gray-400">
                Không tìm thấy khóa học phù hợp.
              </p>
            )}
          </div>

          {/* Tìm kiếm */}
          <div className="relative w-full max-w-md mx-auto mt-4">
            <input
              type="text"
              placeholder=" Tìm khóa học..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full p-3 pl-10 rounded-lg bg-gray-800 text-white placeholder-gray-400 shadow-inner focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
        </div>
      </section>
      {/* 📝 Blog Section */}
      <section className="py-24 px-6 max-w-6xl mx-auto">
        <h3 className="text-4xl font-extrabold mb-6 text-green-400 text-center drop-shadow-lg">
          Blog mới nhất
        </h3>
        <p className="text-center text-gray-400 text-lg mb-14 max-w-3xl mx-auto">
          Cập nhật kiến thức, câu chuyện và tin tức mới nhất về phòng chống ma
          túy.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12">
          {blogs.map(({ id, title, excerpt, img }, index) => (
            <motion.div
              key={id}
              className="relative rounded-3xl overflow-hidden shadow-2xl bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 cursor-pointer flex flex-col"
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
                scale: 1.05,
                boxShadow: "0 15px 30px rgba(72, 187, 120, 0.6)",
              }}
            >
              <div className="relative h-48 overflow-hidden rounded-t-3xl">
                <img
                  src={img}
                  alt={title}
                  className="w-full h-full object-cover transition-transform duration-500 ease-in-out group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-80 hover:opacity-60 transition-opacity duration-300"></div>
                <h4 className="absolute bottom-4 left-4 right-4 text-xl sm:text-2xl font-extrabold text-green-400 drop-shadow-lg">
                  {title}
                </h4>
              </div>
              <div className="p-6 flex flex-col flex-grow">
                <p className="text-gray-300 text-sm leading-relaxed mb-6 line-clamp-3 flex-grow">
                  {excerpt}
                </p>
                <button
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold px-6 py-3 rounded-full shadow-lg transition-transform duration-300 ease-in-out hover:scale-105 focus:outline-none flex-shrink-0"
                  aria-label={`Xem chi tiết bài viết: ${title}`}
                >
                  Xem chi tiết <FaArrowRight />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 📝 Tự đánh giá nguy cơ */}
      <section className="py-24 px-6 max-w-6xl mx-auto text-center">
        <h2 className="text-4xl font-bold text-yellow-400 mb-4 drop-shadow-md">
          Tự đánh giá nguy cơ
        </h2>
        <p className="text-lg text-gray-300 mb-12 max-w-2xl mx-auto">
          Hãy chọn bài khảo sát phù hợp để nhận đánh giá sơ bộ về mức độ nguy cơ
          và lời khuyên hành động.
        </p>

        <div className="grid md:grid-cols-2 gap-10">
          {/* ASSIST */}
          <motion.div
            whileHover={{ scale: 1.03 }}
            className="bg-yellow-600/90 hover:bg-yellow-700 rounded-2xl shadow-2xl p-6 flex flex-col items-center text-white transition"
          >
            <FaClipboardList size={40} className="mb-4" />
            <h3 className="text-2xl font-semibold mb-2">Khảo sát ASSIST</h3>
            <p className="text-sm text-white/90 mb-6">
              Công cụ sàng lọc được WHO khuyến nghị nhằm phát hiện mức độ sử
              dụng các chất gây nghiện.
            </p>
            <button className="bg-white text-yellow-700 hover:bg-gray-200 font-semibold px-6 py-2 rounded-full transition">
              Bắt đầu khảo sát
            </button>
          </motion.div>

          {/* CRAFFT */}
          <motion.div
            whileHover={{ scale: 1.03 }}
            className="bg-yellow-600/90 hover:bg-yellow-700 rounded-2xl shadow-2xl p-6 flex flex-col items-center text-white transition"
          >
            <FaClipboardList size={40} className="mb-4" />
            <h3 className="text-2xl font-semibold mb-2">Khảo sát CRAFFT</h3>
            <p className="text-sm text-white/90 mb-6">
              Công cụ dành cho thanh thiếu niên nhằm đánh giá nguy cơ lạm dụng
              rượu, thuốc và chất kích thích.
            </p>
            <button className="bg-white text-yellow-700 hover:bg-gray-200 font-semibold px-6 py-2 rounded-full transition">
              Bắt đầu khảo sát
            </button>
          </motion.div>
        </div>

        {/* CTA bổ sung */}
        <div className="mt-16">
          <motion.button
            className="bg-yellow-500 hover:bg-yellow-600 text-white px-8 py-3 rounded-full font-semibold shadow-lg inline-flex items-center gap-3 transition-all"
            whileHover={{ scale: 1.05 }}
          >
            <FaPoll size={18} /> Xem kết quả khảo sát gần đây
          </motion.button>
        </div>
      </section>

      {/* 📅 Gặp chuyên viên tư vấn */}
      <section className="relative bg-gradient-to-r from-indigo-900 via-indigo-800 to-indigo-700 py-24 px-6 text-center rounded-3xl mx-4 max-w-6xl mx-auto shadow-2xl overflow-hidden">
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
        <p className="text-center text-gray-300 text-lg mb-12 max-w-2xl mx-auto">
          Những hoạt động nổi bật giúp lan tỏa nhận thức và phòng chống ma túy
          trong cộng đồng.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {communityMediaItems.map(({ icon, title, description }, index) => (
            <motion.div
              key={title}
              className="bg-gradient-to-br from-green-700 via-green-800 to-green-900 p-6 rounded-2xl shadow-2xl text-center text-white hover:scale-105 hover:shadow-green-500/40 transition-all duration-300 group"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.2 }}
              viewport={{ once: true }}
            >
              <div className="mb-4 bg-white/10 p-4 w-16 h-16 mx-auto flex items-center justify-center rounded-full border border-white/20 group-hover:rotate-6 transition-transform duration-300">
                {icon}
              </div>
              <h4 className="text-xl font-semibold mb-2">{title}</h4>
              <p className="text-gray-200 text-sm">{description}</p>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-16 text-center">
          <motion.button
            className="bg-green-500 hover:bg-green-600 text-white px-8 py-3 rounded-full font-semibold shadow-lg inline-flex items-center gap-3 transition-all"
            whileHover={{ scale: 1.05 }}
          >
            <FaBullseye size={18} /> Xem tất cả chiến dịch
          </motion.button>
        </div>
      </section>

      {/* Footer */}
      <footer className="text-center text-gray-400 text-sm py-8 border-t border-gray-700 mt-12">
        2025 Tổ chức Tình nguyện Phòng chống Ma túy.
        <div className="mt-4 flex justify-center gap-5 text-green-400 text-xl">
          <a href="#">
            <FaFacebookF />
          </a>
          <a href="#">
            <FaTwitter />
          </a>
          <a href="#">
            <FaYoutube />
          </a>
        </div>
      </footer>
    </div>
  );
}
