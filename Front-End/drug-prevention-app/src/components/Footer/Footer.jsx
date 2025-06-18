import React from "react";
import { FaFacebookF, FaInstagram, FaYoutube } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="text-center text-gray-400 text-sm py-8 border-t border-gray-700 mt-12">
      2025 Tổ chức Tình nguyện Phòng chống Ma túy.
      <div className="mt-4 flex justify-center gap-5 text-green-400 text-xl">
        <a href="#" aria-label="Facebook">
          <FaFacebookF />
        </a>
        <a href="#" aria-label="Instagram">
          <FaInstagram />
        </a>
        <a href="#" aria-label="YouTube">
          <FaYoutube />
        </a>
      </div>
    </footer>
  );
};

export default Footer;
