import api from "../Axios/Axios";

const surveysServices = () => {
  const getListSurveys = async () => {
    try {
      // Lấy danh sách surveys từ backend Spring Boot
      const resSurveys = await api.get(`/tests/`);
      const surveysData = Array.isArray(resSurveys.data)
        ? resSurveys.data
        : resSurveys.data && Array.isArray(resSurveys.data.data)
        ? resSurveys.data.data
        : [];

      console.log("surveysData:", surveysData); // Thêm dòng này để kiểm tra dữ liệu surveysData

      return surveysData;
    } catch (err) {
      throw new Error(err.message || "Đã xảy ra lỗi khi tải dữ liệu khảo sát.");
    }
  };

  const submitSurvey = async (payload) => {
    try {
      const response = await api.post("/testResult/countCrafftTest/", payload);

      // 2. Lấy dữ liệu trả về từ API
      return response.data?.data;
    } catch (error) {
      throw new Error("Phản hồi từ API không chứa đủ dữ liệu kết quả.");
    }
  };
  return {
    getListSurveys: getListSurveys,
    submitSurvey: submitSurvey,
  };
};

export default surveysServices;
