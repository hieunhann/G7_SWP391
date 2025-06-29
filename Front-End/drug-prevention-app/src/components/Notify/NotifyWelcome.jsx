import React from "react";

const WelcomePopup = ({ courseName, onContinue }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-xl p-8 max-w-xl w-full shadow-2xl relative">
        <button
          className="absolute top-2 right-3 text-gray-400 hover:text-gray-600 text-xl font-bold"
          onClick={onContinue}
        >
          &times;
        </button>
        <h2 className="text-2xl md:text-3xl font-bold text-teal-600 mb-4">
          <span className="text-gray-800">Chào mừng bạn đến với khóa học </span>
          <span className="text-teal-700 font-bold">{courseName}</span>
        </h2>
        <p className="text-gray-700 text-base leading-relaxed">
          Đây là nơi bạn có thể đưa ra quyết định của riêng mình dựa trên sự thật, không phải ý kiến hoặc ý tưởng của người khác.
        </p>
        <p className="mt-4 text-gray-800 font-semibold">
          Bây giờ, nhấn nút Tiếp tục để thực hiện bước đầu tiên.
        </p>
        <div className="text-center mt-6">
          <button
            onClick={onContinue}
            className="bg-black hover:bg-gray-800 text-white py-2 px-6 rounded-xl transition"
          >
            Tiếp tục
          </button>
        </div>
      </div>
    </div>
  );
};

export default WelcomePopup;
