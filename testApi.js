const axios = require("axios");
const getToken = require("./auth/getToken");

(async () => {
  try {
    const token = await getToken();

    const response = await axios.get(
      "http://4.224.186.213/evaluation-service/depots",
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    console.log(response.data);
  } catch (error) {
    console.log(error.response?.data || error.message);
  }
})();