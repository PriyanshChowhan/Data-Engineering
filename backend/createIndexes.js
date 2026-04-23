require("dotenv").config();

const mongoose = require("mongoose");
const connectDB = require("./config/db");
const Property = require("./models/Property");
const MarketTrend = require("./models/MarketTrend");

async function createIndexes() {
  await connectDB();

  try {
    console.log("Creating indexes...");

    // ── Property: single-field indexes ───────────────────────────────────────

    // Q1: $or city filter (Mumbai / Delhi), Q4: $in city filter
    await Property.collection.createIndex({ "location.city": 1 });

    // Q1: status $ne "sold", Q4: status "available", Q6: status "available"
    await Property.collection.createIndex({ status: 1 });

    // Q1: price $lt 20M, Q6: price $lt 30M
    await Property.collection.createIndex({ price: 1 });

    // Q4: type $in ["apartment","villa"], Q6: type "villa"
    await Property.collection.createIndex({ type: 1 });

    // Q1: appreciation_percent $gt 10
    await Property.collection.createIndex({ "investment_details.appreciation_percent": -1 });

    // Q6: rating $gte 4
    await Property.collection.createIndex({ rating: -1 });

    // Q6: $elemMatch on tags array ($in / $nin conditions on same element)
    await Property.collection.createIndex({ tags: 1 });

    // ── Property: compound indexes ────────────────────────────────────────────

    // Q4: covers city + type + status in one index scan
    await Property.collection.createIndex({ "location.city": 1, type: 1, status: 1 });

    // Q1: narrows to city first, then applies price range within that set
    await Property.collection.createIndex({ "location.city": 1, price: 1 });

    // ── Property: text index ──────────────────────────────────────────────────

    // Q2: $text search across title, area, and tags
    await Property.collection.createIndex(
      { title: "text", "location.area": "text", tags: "text" },
      { name: "property_text_index" }
    );

    // ── MarketTrend: indexes ──────────────────────────────────────────────────

    // Q3, Q5: $elemMatch on monthly_data — multikey index lets MongoDB use the
    // avg_rent range condition to narrow candidate documents before checking
    // the transactions condition on the same subdocument element.
    await MarketTrend.collection.createIndex({ "monthly_data.avg_rent": 1 });

    // Q3, Q5: supports the transactions $gt / $gte condition inside $elemMatch
    // (separate from avg_rent — compound multikey on two paths of the same
    //  array is not allowed in MongoDB)
    await MarketTrend.collection.createIndex({ "monthly_data.transactions": 1 });

    console.log("Indexes created successfully.");
  } catch (error) {
    console.error("Index creation failed:", error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
  }
}

createIndexes();
