const express = require("express");
const { getQueries, runQuery, getInsightQueries } = require("../controllers/queryController");

const router = express.Router();

router.get("/", getQueries);
router.get("/insights", getInsightQueries);
router.get("/:queryId", runQuery);

module.exports = router;
