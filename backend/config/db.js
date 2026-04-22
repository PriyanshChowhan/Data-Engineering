const mongoose = require("mongoose");

const DEFAULT_RETRIES = 5;
const RETRY_DELAY_MS = 5000;

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function connectDB(retries = DEFAULT_RETRIES) {
  const mongoUri = process.env.MONGO_URI;

  if (!mongoUri) {
    throw new Error("MONGO_URI is not defined in the environment");
  }

  for (let attempt = 1; attempt <= retries; attempt += 1) {
    try {
      console.log(`Connecting to MongoDB (attempt ${attempt}/${retries})...`);
      await mongoose.connect(mongoUri);
      console.log("MongoDB connected successfully.");
      return mongoose.connection;
    } catch (error) {
      console.error(`MongoDB connection failed on attempt ${attempt}: ${error.message}`);

      if (attempt === retries) {
        throw error;
      }

      console.log(`Retrying MongoDB connection in ${RETRY_DELAY_MS / 1000} seconds...`);
      await wait(RETRY_DELAY_MS);
    }
  }

  return mongoose.connection;
}

module.exports = connectDB;
