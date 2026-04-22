require("dotenv").config();

const mongoose = require("mongoose");
const connectDB = require("./config/db");
const Property = require("./models/Property");
const Rental = require("./models/Rental");
const MarketTrend = require("./models/MarketTrend");

async function createIndexes() {
  await connectDB();

  try {
    console.log("Creating indexes...");

    await Property.collection.createIndex({ "location.city": 1 });
    await Property.collection.createIndex({ status: 1 });
    await Property.collection.createIndex({ price: 1 });
    await Property.collection.createIndex({ type: 1 });
    await Property.collection.createIndex({ "investment_details.appreciation_percent": -1 });
    await Property.collection.createIndex({ "investment_details.renovation_cost": 1 });
    await Property.collection.createIndex({ rating: -1 });

    await Property.collection.createIndex({ "location.city": 1, type: 1, status: 1 });
    await Property.collection.createIndex({ "location.city": 1, price: 1 });
    await Property.collection.createIndex({ type: 1, bedrooms: 1, price: 1 });
    await Rental.collection.createIndex({ property_id: 1, status: 1 });
    await Rental.collection.createIndex({ "tenant.email": 1 });

    await Property.collection.createIndex({ amenities: 1 });
    await Property.collection.createIndex({ tags: 1 });
    await Rental.collection.createIndex({ "payment_history.status": 1 });
    await Rental.collection.createIndex({ "maintenance_requests.status": 1 });
    await Rental.collection.createIndex({ "maintenance_requests.priority": 1 });

    await Property.collection.createIndex(
      { title: "text", "location.area": "text", tags: "text" },
      { name: "property_text_index" }
    );
    await MarketTrend.collection.createIndex(
      { keywords: "text", area: "text" },
      { name: "trend_text_index" }
    );

    await Property.collection.createIndex({ "owner.email": 1 });
    await Property.collection.createIndex({
      "location.coordinates.lat": 1,
      "location.coordinates.lng": 1
    });

    await Rental.collection.createIndex({ "maintenance_requests.cost": 1 });
    await MarketTrend.collection.createIndex({ "monthly_data.avg_rent": 1 });

    console.log("Indexes created successfully.");
  } catch (error) {
    console.error("Index creation failed:", error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
  }
}

createIndexes();
