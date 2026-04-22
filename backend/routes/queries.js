const express = require("express");
const { getQueries, runQuery } = require("../controllers/queryController");

const router = express.Router();

router.get("/", getQueries);
router.get("/:queryId", runQuery);

module.exports = router;
