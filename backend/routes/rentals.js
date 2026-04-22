const express = require("express");
const {
  getRentals,
  getRentalById,
  createRental,
  addPayment,
  addMaintenanceRequest
} = require("../controllers/rentalController");

const router = express.Router();

router.get("/", getRentals);
router.get("/:id", getRentalById);
router.post("/", createRental);
router.put("/:id/payment", addPayment);
router.put("/:id/maintenance", addMaintenanceRequest);

module.exports = router;
