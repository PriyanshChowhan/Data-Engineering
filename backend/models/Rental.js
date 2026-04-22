const mongoose = require("mongoose");

const PaymentHistorySchema = new mongoose.Schema(
  {
    month: { type: String, required: true },
    amount_paid: { type: Number, required: true, min: 0 },
    paid_on: { type: Date, required: true },
    late_fee: { type: Number, required: true, min: 0 },
    payment_mode: {
      type: String,
      required: true,
      enum: ["UPI", "bank_transfer", "cash"]
    },
    status: {
      type: String,
      required: true,
      enum: ["paid", "pending", "late"]
    }
  },
  { _id: false }
);

const MaintenanceRequestSchema = new mongoose.Schema(
  {
    request_id: { type: String, required: true },
    issue: { type: String, required: true },
    reported_on: { type: Date, required: true },
    resolved_on: { type: Date, default: null },
    cost: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      required: true,
      enum: ["open", "resolved", "pending"]
    },
    priority: {
      type: String,
      required: true,
      enum: ["low", "medium", "high"]
    }
  },
  { _id: false }
);

const TenantSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    contact: { type: String, required: true },
    email: { type: String, required: true },
    id_proof: { type: String, required: true }
  },
  { _id: false }
);

const RentalSchema = new mongoose.Schema(
  {
    rental_id: { type: String, required: true, unique: true },
    property_id: { type: String, required: true, index: true },
    tenant: { type: TenantSchema, required: true },
    rent_amount: { type: Number, required: true, min: 0 },
    security_deposit: { type: Number, required: true, min: 0 },
    lease_start: { type: Date, required: true },
    lease_end: { type: Date, required: true },
    status: {
      type: String,
      required: true,
      enum: ["active", "expired", "terminated"]
    },
    payment_history: { type: [PaymentHistorySchema], default: [] },
    maintenance_requests: { type: [MaintenanceRequestSchema], default: [] },
    created_at: { type: Date, default: Date.now }
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

RentalSchema.virtual("property", {
  ref: "Property",
  localField: "property_id",
  foreignField: "property_id",
  justOne: true
});

module.exports = mongoose.model("Rental", RentalSchema);
