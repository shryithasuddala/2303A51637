const { getVehicles } = require("./vehicle-scheduler-be/services/apiService");

(async () => {
  try {
    const vehicles = await getVehicles();
    console.log(vehicles.slice(0, 5));
  } catch (error) {
    console.log(error.message);
  }
})();