const mongoose = require("mongoose");

const MonthlyDataSchema = new mongoose.Schema(
  {
    month: { type: Number, required: true, min: 1, max: 12 },
    avg_rent: { type: Number, required: true, min: 0 },
    transactions: { type: Number, required: true, min: 0 }
  },
  { _id: false }
);

const MarketTrendSchema = new mongoose.Schema({
  city: { type: String, required: true },
  area: { type: String, required: true },
  property_type: {
    type: String,
    required: true,
    enum: ["apartment", "villa", "plot", "commercial"]
  },
  year: { type: Number, required: true },
  monthly_data: { type: [MonthlyDataSchema], default: [] },
  keywords: { type: [String], default: [] },
  avg_yield_percent: { type: Number, required: true, min: 0 }
});

module.exports = mongoose.model("MarketTrend", MarketTrendSchema);
