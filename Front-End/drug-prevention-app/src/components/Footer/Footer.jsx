import React from "react";
import { FaFacebookF, FaInstagram, FaTwitter, FaMapMarkerAlt, FaPhone, FaEnvelope } from "react-icons/fa";


const Footer = () => {
  
  return (
    <footer className="bg-white text-gray-700 py-10 px-0 border-t border-gray-200 w-full">
      <div className="max-w-7xl mx-auto px-[90px]">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-6">
          {/* About */}
          <div>
            <h4 className="text-lg font-semibold text-green-800 mb-2">Về Chúng Tôi</h4>
            <p className="text-sm text-gray-600">
              Chúng tôi cam kết mang đến những dịch vụ tốt nhất và hỗ trợ cộng đồng trong công tác phòng chống ma túy.
            </p>
          </div>
          {/* Contact */}
          <div>
            <h4 className="text-lg font-semibold text-green-800 mb-2">Liên Hệ</h4>
            <address className="not-italic text-sm text-gray-600 space-y-2">
              <div className="flex items-start gap-2">
                <FaMapMarkerAlt className="text-green-600 mt-1" />
                <span>7 D. D1, Long Thanh Mỹ, Thủ Đức, TP. Hồ Chí Minh</span>
              </div>
              <div className="flex items-center gap-2">
                <FaPhone className="text-green-600" />
                <span>(84) 123-456-789</span>
              </div>
              <div className="flex items-center gap-2">
                <FaEnvelope className="text-green-600" />
                <span>G7_swp@fpt.edu.vn</span>
              </div>
            </address>
          </div>
          {/* Social */}
          <div>
            <h4 className="text-lg font-semibold text-green-800 mb-2">Theo Dõi</h4>
            <div className="flex gap-3 mb-4">
              <a href="#" className="bg-green-100 p-2 rounded-full text-green-700 hover:bg-green-200 transition">
                <FaFacebookF />
              </a>
              <a href="#" className="bg-green-100 p-2 rounded-full text-green-700 hover:bg-green-200 transition">
                <FaTwitter />
              </a>
              <a href="#" className="bg-green-100 p-2 rounded-full text-green-700 hover:bg-green-200 transition">
                <FaInstagram />
              </a>
            </div>
            <div className="h-32 rounded-lg overflow-hidden border border-gray-200">
              <iframe
                title="Google Maps"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3918.610010537023!2d106.80730807488345!3d10.841127589311597!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752731176b07b1%3A0xb752b24b379bae5e!2sFPT%20University%20HCMC!5e0!3m2!1sen!2sus!4v1752632619190!5m2!1sen!2sus"
                width="100%"
                height="100%"
                style={{ border: 0, minWidth: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        </div>
        <div className="pt-6 border-t border-gray-200 text-center">
          <p className="text-xs text-gray-500">
            © 2025 <span className="font-medium text-green-800">Đại học FPT TP. HCM</span> - Tổ chức Tình nguyện Phòng chống Ma túy. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};


export default Footer;



