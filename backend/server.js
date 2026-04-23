require("dotenv").config();

const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const propertyRoutes = require("./routes/properties");
const dashboardRoutes = require("./routes/dashboard");
const queryRoutes = require("./routes/queries");
const { notFound, errorHandler } = require("./middleware/errorHandler");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(
  cors({
    origin: "http://localhost:5173"
  })
);
app.use(express.json({ limit: "5mb" }));

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Real-Estate Tracker API is running"
  });
});

app.use("/api/properties", propertyRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/queries", queryRoutes);

app.use(notFound);
app.use(errorHandler);

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server listening on http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Unable to start server:", error.message);
    process.exit(1);
  });
