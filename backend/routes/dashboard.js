const express = require("express");
const { getDashboardStats, getAnalytics } = require("../controllers/dashboardController");

const router = express.Router();

router.get("/stats", getDashboardStats);
router.get("/analytics", getAnalytics);

module.exports = router;
