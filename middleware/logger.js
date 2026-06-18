const axios = require("axios");
const getToken = require("../auth/getToken");

const Log = async (stack, level, packageName, message) => {
  try {
    const token = await getToken();

    await axios.post(
      "http://4.224.186.213/evaluation-service/logs",
      {
        stack,
        level,
        package: packageName,
        message,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
  } catch (error) {
    console.log(error.response?.data || error.message);
  }
};

module.exports = Log;