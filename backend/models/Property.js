const mongoose = require("mongoose");

const CoordinatesSchema = new mongoose.Schema(
  {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true }
  },
  { _id: false }
);

const LocationSchema = new mongoose.Schema(
  {
    city: { type: String, required: true, index: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },
    area: { type: String, required: true },
    coordinates: { type: CoordinatesSchema, required: true }
  },
  { _id: false }
);

const OwnerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true }
  },
  { _id: false }
);

const InvestmentDetailsSchema = new mongoose.Schema(
  {
    purchase_price: { type: Number, required: true },
    purchase_date: { type: Date, required: true },
    renovation_cost: { type: Number, required: true },
    current_valuation: { type: Number, required: true },
    appreciation_percent: { type: Number, required: true },
    last_updated: { type: Date, default: Date.now }
  },
  { _id: false }
);

const PropertySchema = new mongoose.Schema(
  {
    property_id: { type: String, required: true, unique: true },
    title: { type: String, required: true, trim: true },
    type: {
      type: String,
      required: true,
      enum: ["apartment", "villa", "plot", "commercial"]
    },
    status: {
      type: String,
      required: true,
      enum: ["available", "rented", "under_maintenance", "sold"]
    },
    location: { type: LocationSchema, required: true },
    price: { type: Number, required: true, min: 0 },
    area_sqft: { type: Number, required: true, min: 100 },
    bedrooms: { type: Number, required: true, min: 0 },
    bathrooms: { type: Number, required: true, min: 0 },
    amenities: [{ type: String, required: true }],
    owner: { type: OwnerSchema, required: true },
    investment_details: { type: InvestmentDetailsSchema, required: true },
    tags: [{ type: String }],
    rating: { type: Number, required: true, min: 1, max: 5 },
    listed_by: {
      type: String,
      required: true,
      enum: ["owner", "agent", "builder"]
    }
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at"
    }
  }
);

module.exports = mongoose.model("Property", PropertySchema);
