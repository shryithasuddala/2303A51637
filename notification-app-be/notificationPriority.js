const axios = require("axios");
const getToken = require("../auth/getToken");
const Log = require("../middleware/logger");

const BASE_URL =
  "http://4.224.186.213/evaluation-service/notifications";

const weights = {
  Placement: 3,
  Result: 2,
  Event: 1
};

function calculateScore(notification) {

  const typeWeight =
    weights[notification.Type] || 0;

  const age =
    Date.now() -
    new Date(notification.Timestamp).getTime();

  return (
    typeWeight * 1000000 -
    age
  );
}

async function getTop10Notifications() {

  try {

    await Log(
      "backend",
      "info",
      "service",
      "Fetching notifications"
    );

    const token = await getToken();

    const response = await axios.get(
      BASE_URL,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    const notifications =
      response.data.notifications;

    const top10 =
      notifications
        .sort(
          (a, b) =>
            calculateScore(b) -
            calculateScore(a)
        )
        .slice(0, 10);

    console.log(top10);

    await Log(
      "backend",
      "info",
      "service",
      "Top 10 notifications generated"
    );

  } catch (error) {

    await Log(
      "backend",
      "error",
      "service",
      error.message
    );
  }
}

getTop10Notifications();