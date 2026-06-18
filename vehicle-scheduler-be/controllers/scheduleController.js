const { getDepots, getVehicles } = require("../services/apiService");
const solveKnapsack = require("../services/knapsackService");
const Log = require("../../middleware/logger");

const getSchedule = async (req, res) => {
  try {
    const depots = await getDepots();
    const vehicles = await getVehicles();

    const schedules = depots.map((depot) => {
      const result = solveKnapsack(
        depot.MechanicHours,
        vehicles
      );

      return {
        depotId: depot.ID,
        mechanicHours: depot.MechanicHours,
        maxImpact: result.maxImpact,
        selectedVehicles: result.selectedVehicles
      };
    });

    await Log(
      "backend",
      "info",
      "controller",
      "Schedules generated successfully"
    );

    res.status(200).json(schedules);

  } catch (error) {

    await Log(
      "backend",
      "error",
      "controller",
      error.message
    );

    res.status(500).json({
      error: error.message
    });
  }
};

module.exports = {
  getSchedule
};