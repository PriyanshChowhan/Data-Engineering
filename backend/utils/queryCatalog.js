const Property = require("../models/Property");
const Rental = require("../models/Rental");
const MarketTrend = require("../models/MarketTrend");

const SIX_MONTHS_MS = 180 * 24 * 60 * 60 * 1000;

const limitResults = (results, limit = 10) => results.slice(0, limit);

const buildUpdateResults = (summary, samples = []) => [
  summary,
  ...samples
];

const queryCatalog = [
  {
    query_id: "Q1",
    query_name: "Premium unsold properties in Mumbai or Delhi with 3+ bedrooms under 2 Crore",
    description:
      "Uses logical and comparison operators together to identify premium inventory in Mumbai and Delhi that is still available for investors.",
    mongo_query_string: `db.properties.find({
  $and: [
    { $or: [{ "location.city": "Mumbai" }, { "location.city": "Delhi" }] },
    { price: { $lt: 20000000 } },
    { bedrooms: { $gte: 3 } },
    { status: { $ne: "sold" } },
    { "investment_details.appreciation_percent": { $gt: 10 } }
  ]
})`,
    topics_covered: [
      "Logical Operators",
      "$and",
      "$or",
      "$ne",
      "$lt",
      "$gte",
      "$gt",
      "Comparison Operators"
    ],
    lecture_reference: "Lec 2 - CRUD Operations",
    category: "CRUD",
    demonstrates: [
      "Combines nested logical operators to narrow the result set.",
      "Applies multiple comparison checks on price, bedrooms, and appreciation.",
      "Filters against a nested document field using dot notation."
    ],
    async execute() {
      const filter = {
        $and: [
          { $or: [{ "location.city": "Mumbai" }, { "location.city": "Delhi" }] },
          { price: { $lt: 20000000 } },
          { bedrooms: { $gte: 3 } },
          { status: { $ne: "sold" } },
          { "investment_details.appreciation_percent": { $gt: 10 } }
        ]
      };

      const [count, results] = await Promise.all([
        Property.countDocuments(filter),
        Property.find(filter).limit(10).lean()
      ]);

      return { result_count: count, results };
    }
  },
  {
    query_id: "Q2",
    query_name: "Apartments and villas that are neither sold nor under maintenance in top metros",
    description:
      "Highlights nested field filtering with a negative logical condition and metro-city targeting.",
    mongo_query_string: `db.properties.find({
  $nor: [{ status: "sold" }, { status: "under_maintenance" }],
  type: { $in: ["apartment", "villa"] },
  "location.city": { $in: ["Mumbai", "Bangalore", "Hyderabad", "Pune"] },
  price: { $gte: 5000000, $lte: 30000000 }
}).sort({ "investment_details.appreciation_percent": -1 })`,
    topics_covered: [
      "$nor",
      "$in",
      "$gte",
      "$lte",
      "Logical Operators",
      "Comparison Operators",
      "Nested document field query"
    ],
    lecture_reference: "Lec 2 + Lec 3 - Logical Operators and Nested Fields",
    category: "Nested",
    demonstrates: [
      "Uses $nor to exclude two disallowed statuses in one pass.",
      "Filters nested city data with dot notation.",
      "Sorts the result using investment appreciation for ranking."
    ],
    async execute() {
      const filter = {
        $nor: [{ status: "sold" }, { status: "under_maintenance" }],
        type: { $in: ["apartment", "villa"] },
        "location.city": { $in: ["Mumbai", "Bangalore", "Hyderabad", "Pune"] },
        price: { $gte: 5000000, $lte: 30000000 }
      };

      const [count, results] = await Promise.all([
        Property.countDocuments(filter),
        Property.find(filter)
          .sort({ "investment_details.appreciation_percent": -1 })
          .limit(10)
          .lean()
      ]);

      return { result_count: count, results };
    }
  },
  {
    query_id: "Q3",
    query_name: "Properties not listed by owner and priced outside the 50L to 1Cr mid-range",
    description:
      "Demonstrates negation and range exclusion to find non-owner listings outside the mid-market band.",
    mongo_query_string: `db.properties.find({
  listed_by: { $not: { $eq: "owner" } },
  $or: [
    { price: { $lt: 5000000 } },
    { price: { $gt: 10000000 } }
  ],
  "investment_details.renovation_cost": { $gt: 0 }
})`,
    topics_covered: [
      "$not",
      "$eq",
      "$or",
      "$lt",
      "$gt",
      "Logical Operators",
      "Comparison Operators"
    ],
    lecture_reference: "Lec 2 - CRUD Operations",
    category: "CRUD",
    demonstrates: [
      "Uses $not with $eq for an explicit negated condition.",
      "Builds an outside-range test using an $or clause.",
      "Adds an embedded-field comparison to avoid zero renovation cases."
    ],
    async execute() {
      const filter = {
        listed_by: { $not: { $eq: "owner" } },
        $or: [{ price: { $lt: 5000000 } }, { price: { $gt: 10000000 } }],
        "investment_details.renovation_cost": { $gt: 0 }
      };

      const [count, results] = await Promise.all([
        Property.countDocuments(filter),
        Property.find(filter).limit(10).lean()
      ]);

      return { result_count: count, results };
    }
  },
  {
    query_id: "Q4",
    query_name: "Rentals where a payment was late and exceeded the agreed rent amount",
    description:
      "Searches an embedded payments array with $elemMatch to isolate a late overpayment pattern.",
    mongo_query_string: `db.rentals.find({
  "payment_history": {
    $elemMatch: {
      status: "late",
      amount_paid: { $gt: 20000 },
      late_fee: { $gt: 0 }
    }
  }
})`,
    topics_covered: [
      "$elemMatch",
      "Array of embedded documents",
      "Nested documents",
      "Array operators"
    ],
    lecture_reference: "Lec 3 + Lec 5 - Nested Documents and Arrays",
    category: "Array",
    demonstrates: [
      "Constrains multiple conditions to the same embedded payment record.",
      "Shows why $elemMatch matters for array-of-document queries.",
      "Surfaces risky payment behavior in rental operations."
    ],
    async execute() {
      const filter = {
        payment_history: {
          $elemMatch: {
            status: "late",
            amount_paid: { $gt: 20000 },
            late_fee: { $gt: 0 }
          }
        }
      };

      const [count, results] = await Promise.all([
        Rental.countDocuments(filter),
        Rental.find(filter).limit(10).lean()
      ]);

      return { result_count: count, results };
    }
  },
  {
    query_id: "Q5",
    query_name: "Fully-loaded properties with exactly 5 amenities including parking, gym and pool",
    description:
      "Uses array operators to demand both a precise amenity count and a required set of features.",
    mongo_query_string: `db.properties.find({
  $and: [
    { amenities: { $all: ["parking", "gym", "pool"] } },
    { amenities: { $size: 5 } },
    { status: { $ne: "sold" } }
  ]
})`,
    topics_covered: ["$all", "$size", "Array operators", "$ne"],
    lecture_reference: "Lec 5 - Array Operators",
    category: "Array",
    demonstrates: [
      "Checks for a mandatory subset using $all.",
      "Constrains the array cardinality with $size.",
      "Combines array logic with a scalar status filter."
    ],
    async execute() {
      const filter = {
        $and: [
          { amenities: { $all: ["parking", "gym", "pool"] } },
          { amenities: { $size: 5 } },
          { status: { $ne: "sold" } }
        ]
      };

      const [count, results] = await Promise.all([
        Property.countDocuments(filter),
        Property.find(filter).limit(10).lean()
      ]);

      return { result_count: count, results };
    }
  },
  {
    query_id: "Q6",
    query_name: "Rentals where the first recorded payment was late",
    description:
      "Accesses a fixed array index to find tenants who started with late payment behavior.",
    mongo_query_string: `db.rentals.find({
  "payment_history.0.status": "late",
  "payment_history.0.late_fee": { $gt: 500 }
})`,
    topics_covered: [
      "Array index dot notation",
      "Nested document access",
      "Array querying",
      "$gt"
    ],
    lecture_reference: "Lec 3 + Lec 5 - Nested Documents and Arrays",
    category: "Array",
    demonstrates: [
      "Uses dot notation with an explicit array index.",
      "Targets the oldest stored payment entry.",
      "Pairs direct array access with a comparison condition."
    ],
    async execute() {
      const filter = {
        "payment_history.0.status": "late",
        "payment_history.0.late_fee": { $gt: 500 }
      };

      const [count, results] = await Promise.all([
        Rental.countDocuments(filter),
        Rental.find(filter).limit(10).lean()
      ]);

      return { result_count: count, results };
    }
  },
  {
    query_id: "Q7",
    query_name: "Rentals with at least one high-cost and one low-cost maintenance request",
    description:
      "Demonstrates cross-element array matching where separate embedded documents can satisfy separate conditions.",
    mongo_query_string: `db.rentals.find({
  "maintenance_requests.cost": { $gt: 5000 },
  "maintenance_requests.cost": { $lt: 1000 }
})`,
    topics_covered: [
      "Compound conditions on array without $elemMatch",
      "Cross-element matching",
      "Array operators"
    ],
    lecture_reference: "Lec 5 - Array Operators",
    category: "Array",
    demonstrates: [
      "Illustrates cross-element matching semantics across an array.",
      "Contrasts implicit array matching with $elemMatch behavior.",
      "Flags rentals with both costly and minor maintenance activity."
    ],
    async execute() {
      const filter = {
        $and: [
          { "maintenance_requests.cost": { $gt: 5000 } },
          { "maintenance_requests.cost": { $lt: 1000 } }
        ]
      };

      const [count, results] = await Promise.all([
        Rental.countDocuments(filter),
        Rental.find(filter).limit(10).lean()
      ]);

      return { result_count: count, results };
    }
  },
  {
    query_id: "Q8",
    query_name: "Full-text search for luxury furnished properties using text index",
    description:
      "Executes a MongoDB text search and sorts by text score to surface the best matches first.",
    mongo_query_string: `db.properties.find({
  $text: {
    $search: "luxury furnished premium",
    $caseSensitive: false,
    $diacriticSensitive: false
  }
},
{ score: { $meta: "textScore" }, title: 1, "location.city": 1, price: 1 })
.sort({ score: { $meta: "textScore" } })`,
    topics_covered: [
      "Text indexes",
      "$text",
      "$search",
      "$caseSensitive",
      "$diacriticSensitive",
      "textScore"
    ],
    lecture_reference: "Lec 6 - Indexes and Text Search",
    category: "Index",
    demonstrates: [
      "Runs a full-text search against a named text index.",
      "Projects textScore metadata into the response.",
      "Sorts relevance scores so the top match appears first."
    ],
    async execute() {
      const filter = {
        $text: {
          $search: "luxury furnished premium",
          $caseSensitive: false,
          $diacriticSensitive: false
        }
      };
      const projection = {
        score: { $meta: "textScore" },
        title: 1,
        "location.city": 1,
        price: 1
      };

      const results = await Property.collection
        .find(filter, { projection })
        .sort({ score: { $meta: "textScore" } })
        .limit(10)
        .toArray();

      const count = await Property.countDocuments(filter);

      return { result_count: count, results };
    }
  },
  {
    query_id: "Q9",
    query_name: "Emergency renovation budget increase for properties under maintenance",
    description:
      "Applies multiple update operators to embedded investment fields and timestamps in one batch update.",
    mongo_query_string: `db.properties.updateMany(
  {
    status: "under_maintenance",
    "investment_details.renovation_cost": { $lt: 500000 }
  },
  {
    $inc: { "investment_details.renovation_cost": 50000 },
    $set: { "investment_details.last_updated": new Date() },
    $currentDate: { updated_at: true }
  }
)`,
    topics_covered: [
      "$inc",
      "$set",
      "$currentDate",
      "updateMany",
      "Embedded document update"
    ],
    lecture_reference: "Lec 4 - Update Operators",
    category: "Update",
    demonstrates: [
      "Updates many matching documents at once.",
      "Combines arithmetic and timestamp updates in a single statement.",
      "Targets nested investment fields with dot notation."
    ],
    async execute() {
      const filter = {
        status: "under_maintenance",
        "investment_details.renovation_cost": { $lt: 500000 }
      };
      const update = {
        $inc: { "investment_details.renovation_cost": 50000 },
        $set: { "investment_details.last_updated": new Date() },
        $currentDate: { updated_at: true }
      };

      const updateResult = await Property.collection.updateMany(filter, update);
      const results = await Property.find({ status: "under_maintenance" })
        .sort({ updated_at: -1 })
        .limit(9)
        .lean();

      return {
        result_count: updateResult.modifiedCount,
        results: buildUpdateResults(
          {
            operation: "updateMany",
            matched_count: updateResult.matchedCount,
            modified_count: updateResult.modifiedCount
          },
          results
        )
      };
    }
  },
  {
    query_id: "Q10",
    query_name: "Apply 8 percent appreciation to underperforming Bangalore properties",
    description:
      "Shows batch multiplication and increment updates across two valuation fields and the appreciation metric.",
    mongo_query_string: `db.properties.updateMany(
  {
    "location.city": "Bangalore",
    "investment_details.appreciation_percent": { $lt: 10 },
    status: { $ne: "sold" }
  },
  {
    $mul: { price: 1.08, "investment_details.current_valuation": 1.08 },
    $inc: { "investment_details.appreciation_percent": 8 }
  }
)`,
    topics_covered: ["$mul", "$inc", "Multiple field update", "$lt", "$ne"],
    lecture_reference: "Lec 4 - Update Operators",
    category: "Update",
    demonstrates: [
      "Uses $mul to scale price-like fields in place.",
      "Applies a matching appreciation increment in the same update.",
      "Targets an underperforming segment with city and status filters."
    ],
    async execute() {
      const filter = {
        "location.city": "Bangalore",
        "investment_details.appreciation_percent": { $lt: 10 },
        status: { $ne: "sold" }
      };
      const update = {
        $mul: { price: 1.08, "investment_details.current_valuation": 1.08 },
        $inc: { "investment_details.appreciation_percent": 8 }
      };

      const updateResult = await Property.collection.updateMany(filter, update);
      const results = await Property.find({ "location.city": "Bangalore" })
        .sort({ "investment_details.appreciation_percent": -1 })
        .limit(9)
        .lean();

      return {
        result_count: updateResult.modifiedCount,
        results: buildUpdateResults(
          {
            operation: "updateMany",
            matched_count: updateResult.matchedCount,
            modified_count: updateResult.modifiedCount
          },
          results
        )
      };
    }
  },
  {
    query_id: "Q11",
    query_name: "Conservative valuation update with $max and $min",
    description:
      "Uses conditional update operators so only a higher valuation and lower renovation cost are applied.",
    mongo_query_string: `db.properties.updateOne(
  { property_id: "<dynamic_id>" },
  {
    $max: { "investment_details.current_valuation": 12000000 },
    $min: { "investment_details.renovation_cost": 150000 },
    $currentDate: { updated_at: true }
  }
)`,
    topics_covered: ["$max", "$min", "$currentDate", "Conditional update operators"],
    lecture_reference: "Lec 4 - Update Operators",
    category: "Update",
    demonstrates: [
      "Shows how $max and $min protect data from unwanted direction changes.",
      "Uses a dynamic property identifier chosen from live data.",
      "Refreshes the update timestamp alongside the conditional edits."
    ],
    async execute() {
      const target = await Property.findOne({}, { property_id: 1 }).lean();

      if (!target) {
        throw new Error("No property document found for dynamic query Q11");
      }

      const mongo_query_string = `db.properties.updateOne(
  { property_id: "${target.property_id}" },
  {
    $max: { "investment_details.current_valuation": 12000000 },
    $min: { "investment_details.renovation_cost": 150000 },
    $currentDate: { updated_at: true }
  }
)`;

      const updateResult = await Property.collection.updateOne(
        { property_id: target.property_id },
        {
          $max: { "investment_details.current_valuation": 12000000 },
          $min: { "investment_details.renovation_cost": 150000 },
          $currentDate: { updated_at: true }
        }
      );

      const updatedProperty = await Property.findOne({ property_id: target.property_id }).lean();

      return {
        mongo_query_string,
        result_count: updateResult.modifiedCount,
        results: buildUpdateResults(
          {
            operation: "updateOne",
            matched_count: updateResult.matchedCount,
            modified_count: updateResult.modifiedCount
          },
          updatedProperty ? [updatedProperty] : []
        )
      };
    }
  },
  {
    query_id: "Q12",
    query_name: "Correct the second payment entry for a specific rental",
    description:
      "Updates a specific array element by index inside the embedded payment history array.",
    mongo_query_string: `db.rentals.updateOne(
  { rental_id: "<dynamic_id>" },
  {
    $set: {
      "payment_history.1.status": "paid",
      "payment_history.1.late_fee": 0,
      "payment_history.1.amount_paid": 25000
    }
  }
)`,
    topics_covered: [
      "$set",
      "Array element by index",
      "Dot notation on arrays",
      "Embedded arrays"
    ],
    lecture_reference: "Lec 4 + Lec 5 - Updates on Arrays",
    category: "Update",
    demonstrates: [
      "Writes directly into the second payment history entry.",
      "Uses dot notation paths that target nested array fields.",
      "Shows a precise, single-document corrective update."
    ],
    async execute() {
      const target = await Rental.findOne(
        { "payment_history.1": { $exists: true } },
        { rental_id: 1 }
      ).lean();

      if (!target) {
        throw new Error("No rental with at least two payment entries found for dynamic query Q12");
      }

      const mongo_query_string = `db.rentals.updateOne(
  { rental_id: "${target.rental_id}" },
  {
    $set: {
      "payment_history.1.status": "paid",
      "payment_history.1.late_fee": 0,
      "payment_history.1.amount_paid": 25000
    }
  }
)`;

      const updateResult = await Rental.collection.updateOne(
        { rental_id: target.rental_id },
        {
          $set: {
            "payment_history.1.status": "paid",
            "payment_history.1.late_fee": 0,
            "payment_history.1.amount_paid": 25000
          }
        }
      );

      const updatedRental = await Rental.findOne({ rental_id: target.rental_id }).lean();

      return {
        mongo_query_string,
        result_count: updateResult.modifiedCount,
        results: buildUpdateResults(
          {
            operation: "updateOne",
            matched_count: updateResult.matchedCount,
            modified_count: updateResult.modifiedCount
          },
          updatedRental ? [updatedRental] : []
        )
      };
    }
  },
  {
    query_id: "Q13",
    query_name: "Add a new maintenance request to a rental",
    description:
      "Appends a new embedded maintenance document to an existing rental using $push.",
    mongo_query_string: `db.rentals.updateOne(
  { rental_id: "<dynamic_id>" },
  {
    $push: {
      maintenance_requests: {
        request_id: "MR-NEW-001",
        issue: "Water leakage in bathroom",
        reported_on: new Date(),
        cost: 3500,
        status: "open",
        priority: "high"
      }
    }
  }
)`,
    topics_covered: ["$push", "Array append", "Embedded documents"],
    lecture_reference: "Lec 5 - Array Operators",
    category: "Array",
    demonstrates: [
      "Appends one new object to an existing embedded array.",
      "Creates a realistic maintenance workflow event.",
      "Targets a single rental with a dynamic rental identifier."
    ],
    async execute() {
      const target = await Rental.findOne({}, { rental_id: 1 }).lean();

      if (!target) {
        throw new Error("No rental document found for dynamic query Q13");
      }

      const mongo_query_string = `db.rentals.updateOne(
  { rental_id: "${target.rental_id}" },
  {
    $push: {
      maintenance_requests: {
        request_id: "MR-NEW-001",
        issue: "Water leakage in bathroom",
        reported_on: new Date(),
        cost: 3500,
        status: "open",
        priority: "high"
      }
    }
  }
)`;

      const updateResult = await Rental.collection.updateOne(
        { rental_id: target.rental_id },
        {
          $push: {
            maintenance_requests: {
              request_id: "MR-NEW-001",
              issue: "Water leakage in bathroom",
              reported_on: new Date(),
              cost: 3500,
              status: "open",
              priority: "high"
            }
          }
        }
      );

      const updatedRental = await Rental.findOne({ rental_id: target.rental_id }).lean();

      return {
        mongo_query_string,
        result_count: updateResult.modifiedCount,
        results: buildUpdateResults(
          {
            operation: "updateOne",
            matched_count: updateResult.matchedCount,
            modified_count: updateResult.modifiedCount
          },
          updatedRental ? [updatedRental] : []
        )
      };
    }
  },
  {
    query_id: "Q14",
    query_name: "Remove resolved low-priority maintenance requests older than 6 months",
    description:
      "Uses $pull with a condition on embedded documents to clean aged, low-priority maintenance records.",
    mongo_query_string: `db.rentals.updateMany(
  {},
  {
    $pull: {
      maintenance_requests: {
        status: "resolved",
        priority: "low",
        resolved_on: {
          $lt: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000)
        }
      }
    }
  }
)`,
    topics_covered: ["$pull", "Condition on embedded array documents", "Array cleanup"],
    lecture_reference: "Lec 5 - Array Operators",
    category: "Array",
    demonstrates: [
      "Removes matching embedded documents from every rental.",
      "Uses a date-based retention rule in the embedded filter.",
      "Shows array maintenance and cleanup using $pull."
    ],
    async execute() {
      const cutoffDate = new Date(Date.now() - SIX_MONTHS_MS);
      const updateResult = await Rental.collection.updateMany(
        {},
        {
          $pull: {
            maintenance_requests: {
              status: "resolved",
              priority: "low",
              resolved_on: {
                $lt: cutoffDate
              }
            }
          }
        }
      );

      const results = await Rental.find({})
        .sort({ created_at: -1 })
        .limit(9)
        .lean();

      return {
        result_count: updateResult.modifiedCount,
        results: buildUpdateResults(
          {
            operation: "updateMany",
            matched_count: updateResult.matchedCount,
            modified_count: updateResult.modifiedCount
          },
          results
        )
      };
    }
  },
  {
    query_id: "Q15",
    query_name: "Remove the oldest payment record from overflowing payment histories",
    description:
      "Uses $pop with -1 to trim the first element from oversized payment history arrays.",
    mongo_query_string: `db.rentals.updateMany(
  { $expr: { $gt: [{ $size: "$payment_history" }, 20] } },
  { $pop: { payment_history: -1 } }
)`,
    topics_covered: ["$pop", "$expr", "$size", "Array trimming"],
    lecture_reference: "Lec 5 - Array Operators",
    category: "Array",
    demonstrates: [
      "Uses $expr with $size to find oversized arrays.",
      "Shows that $pop with -1 removes the first array element.",
      "Models a data-retention cleanup pattern for payment history."
    ],
    async execute() {
      const filter = {
        $expr: {
          $gt: [{ $size: "$payment_history" }, 20]
        }
      };

      const updateResult = await Rental.collection.updateMany(filter, {
        $pop: { payment_history: -1 }
      });

      const results = await Rental.find(filter).limit(9).lean();

      return {
        result_count: updateResult.modifiedCount,
        results: buildUpdateResults(
          {
            operation: "updateMany",
            matched_count: updateResult.matchedCount,
            modified_count: updateResult.modifiedCount
          },
          results
        )
      };
    }
  },
  {
    query_id: "Q16",
    query_name: "Remove semi-furnished and resale tags from Jaipur properties",
    description:
      "Demonstrates $pullAll by removing two specific array values from tags in a city-wide rebrand.",
    mongo_query_string: `db.properties.updateMany(
  { "location.city": "Jaipur" },
  {
    $pullAll: { tags: ["semi-furnished", "resale"] }
  }
)`,
    topics_covered: ["$pullAll", "Remove specific array values", "Array updates"],
    lecture_reference: "Lec 5 - Array Operators",
    category: "Array",
    demonstrates: [
      "Removes multiple array values in a single update operation.",
      "Scopes the change to one city using a nested field filter.",
      "Shows how bulk array edits support taxonomy cleanup."
    ],
    async execute() {
      const updateResult = await Property.collection.updateMany(
        { "location.city": "Jaipur" },
        {
          $pullAll: { tags: ["semi-furnished", "resale"] }
        }
      );

      const results = await Property.find({ "location.city": "Jaipur" })
        .limit(9)
        .lean();

      return {
        result_count: updateResult.modifiedCount,
        results: buildUpdateResults(
          {
            operation: "updateMany",
            matched_count: updateResult.matchedCount,
            modified_count: updateResult.modifiedCount
          },
          results
        )
      };
    }
  },
  {
    query_id: "Q17",
    query_name: "Rename tenant contact and remove deprecated id_proof field",
    description:
      "Performs schema-cleanup style updates by renaming one nested field and unsetting another.",
    mongo_query_string: `db.rentals.updateMany(
  { "tenant.contact": { $exists: true } },
  {
    $rename: { "tenant.contact": "tenant.phone" },
    $unset: { "tenant.id_proof": "" }
  }
)`,
    topics_covered: ["$rename", "$unset", "Field cleanup", "$exists"],
    lecture_reference: "Lec 4 - Update Operators",
    category: "Update",
    demonstrates: [
      "Uses $rename to change a nested field path in place.",
      "Uses $unset to drop a deprecated field from embedded documents.",
      "Represents a schema evolution cleanup workflow."
    ],
    async execute() {
      const updateResult = await Rental.collection.updateMany(
        { "tenant.contact": { $exists: true } },
        {
          $rename: { "tenant.contact": "tenant.phone" },
          $unset: { "tenant.id_proof": "" }
        }
      );

      const results = await Rental.find({ "tenant.phone": { $exists: true } })
        .limit(9)
        .lean();

      return {
        result_count: updateResult.modifiedCount,
        results: buildUpdateResults(
          {
            operation: "updateMany",
            matched_count: updateResult.matchedCount,
            modified_count: updateResult.modifiedCount
          },
          results
        )
      };
    }
  },
  {
    query_id: "Q18",
    query_name: "High-ROI available apartments using the compound city, type, status index",
    description:
      "Designed around the compound property index to filter by city, type, and status before sorting by appreciation.",
    mongo_query_string: `db.properties.find({
  "location.city": { $in: ["Mumbai", "Bangalore", "Pune"] },
  type: "apartment",
  status: "available",
  bedrooms: { $gte: 2 },
  "investment_details.appreciation_percent": { $gte: 15 }
}).sort({ "investment_details.appreciation_percent": -1 }).limit(20)`,
    topics_covered: [
      "Compound indexes",
      "Index prefix rule",
      "Sort on indexed field",
      "$in",
      "$gte"
    ],
    lecture_reference: "Lec 6 - Indexes and Performance",
    category: "Index",
    demonstrates: [
      "Matches the left-to-right prefix of the compound property index.",
      "Combines indexed filters with a ranked sort output.",
      "Returns a focused shortlist of high-appreciation inventory."
    ],
    async execute() {
      const filter = {
        "location.city": { $in: ["Mumbai", "Bangalore", "Pune"] },
        type: "apartment",
        status: "available",
        bedrooms: { $gte: 2 },
        "investment_details.appreciation_percent": { $gte: 15 }
      };

      const [count, results] = await Promise.all([
        Property.countDocuments(filter),
        Property.find(filter)
          .sort({ "investment_details.appreciation_percent": -1 })
          .limit(20)
          .lean()
      ]);

      return { result_count: count, results: limitResults(results, 10) };
    }
  },
  {
    query_id: "Q19",
    query_name: "Rentals with high-priority unresolved maintenance over 3000 using multikey index",
    description:
      "Uses $elemMatch on a nested array field that is backed by multikey indexes for faster filtering.",
    mongo_query_string: `db.rentals.find({
  maintenance_requests: {
    $elemMatch: {
      status: { $in: ["open", "pending"] },
      priority: "high",
      cost: { $gt: 3000 }
    }
  }
})`,
    topics_covered: [
      "Multikey index",
      "$elemMatch",
      "$in",
      "Array of subdocuments"
    ],
    lecture_reference: "Lec 5 + Lec 6 - Arrays and Indexes",
    category: "Index",
    demonstrates: [
      "Uses $elemMatch so one maintenance record must satisfy every condition.",
      "Targets array subdocuments backed by multikey indexes.",
      "Highlights unresolved, high-severity maintenance risk."
    ],
    async execute() {
      const filter = {
        maintenance_requests: {
          $elemMatch: {
            status: { $in: ["open", "pending"] },
            priority: "high",
            cost: { $gt: 3000 }
          }
        }
      };

      const [count, results] = await Promise.all([
        Rental.countDocuments(filter),
        Rental.find(filter).limit(10).lean()
      ]);

      return { result_count: count, results };
    }
  },
  {
    query_id: "Q20",
    query_name: "High-yield premium market trends where monthly average rent exceeds 30000",
    description:
      "Combines text search, yield filtering, and array subdocument matching in the market trends collection.",
    mongo_query_string: `db.market_trends.find({
  $and: [
    { $text: { $search: "luxury investment hotspot" } },
    { avg_yield_percent: { $gte: 5 } },
    {
      monthly_data: {
        $elemMatch: {
          avg_rent: { $gt: 30000 },
          transactions: { $gte: 30 }
        }
      }
    }
  ]
})`,
    topics_covered: [
      "Text index on keywords",
      "$elemMatch",
      "Nested document query",
      "Compound conditions"
    ],
    lecture_reference: "Lec 3 + Lec 5 + Lec 6 - Nested Data, Arrays, and Indexes",
    category: "Index",
    demonstrates: [
      "Combines full-text matching with numeric and array constraints.",
      "Uses $elemMatch inside market trend monthly data.",
      "Shows how text indexes and embedded arrays can work together."
    ],
    async execute() {
      const filter = {
        $and: [
          { $text: { $search: "luxury investment hotspot" } },
          { avg_yield_percent: { $gte: 5 } },
          {
            monthly_data: {
              $elemMatch: {
                avg_rent: { $gt: 30000 },
                transactions: { $gte: 30 }
              }
            }
          }
        ]
      };

      const [count, results] = await Promise.all([
        MarketTrend.countDocuments(filter),
        MarketTrend.find(filter).limit(10).lean()
      ]);

      return { result_count: count, results };
    }
  }
];

const queryLookup = new Map(queryCatalog.map((query) => [query.query_id, query]));

const getAllQueryMetadata = () =>
  queryCatalog.map(({ execute, ...metadata }) => ({
    ...metadata
  }));

const getQueryDefinition = (queryId) => queryLookup.get(queryId);

module.exports = {
  getAllQueryMetadata,
  getQueryDefinition
};
