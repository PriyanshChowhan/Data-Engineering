const Property = require("../models/Property");
const MarketTrend = require("../models/MarketTrend");

const queryCatalog = [
  {
    query_id: "Q1",
    mongo_query_string: `db.properties.find({
  $and: [
    { $or: [{ "location.city": "Mumbai" }, { "location.city": "Delhi" }] },
    { price: { $lt: 20000000 } },
    { bedrooms: { $gte: 3 } },
    { status: { $ne: "sold" } },
    { "investment_details.appreciation_percent": { $gt: 10 } }
  ]
})`,
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
    mongo_query_string: `db.properties.find({
  $text: {
    $search: "luxury furnished premium",
    $caseSensitive: false,
    $diacriticSensitive: false
  }
},
{ score: { $meta: "textScore" }, title: 1, "location.city": 1, price: 1 })
.sort({ score: { $meta: "textScore" } })`,
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
    // $elemMatch: both avg_rent and transactions conditions must be satisfied by the SAME
    // monthly_data element — a plain $gt on each field would allow different months to match.
    query_id: "Q3",
    mongo_query_string: `db.markettrends.find({
  monthly_data: {
    $elemMatch: {
      avg_rent: { $gt: 65000 },
      transactions: { $gt: 65 }
    }
  }
},
{ city: 1, area: 1, property_type: 1, avg_yield_percent: 1 })`,
    async execute() {
      const filter = {
        monthly_data: {
          $elemMatch: {
            avg_rent: { $gt: 65000 },
            transactions: { $gt: 65 }
          }
        }
      };

      const [count, results] = await Promise.all([
        MarketTrend.countDocuments(filter),
        MarketTrend.find(filter, { city: 1, area: 1, property_type: 1, avg_yield_percent: 1 })
          .limit(10)
          .lean()
      ]);

      return { result_count: count, results };
    }
  },
  {
    query_id: "Q4",
    mongo_query_string: `db.properties.find({
  "location.city": { $in: ["Mumbai", "Bangalore", "Hyderabad", "Pune"] },
  type: { $in: ["apartment", "villa"] },
  status: "available"
})`,
    async execute() {
      const filter = {
        "location.city": { $in: ["Mumbai", "Bangalore", "Hyderabad", "Pune"] },
        type: { $in: ["apartment", "villa"] },
        status: "available"
      };

      const [count, results] = await Promise.all([
        Property.countDocuments(filter),
        Property.find(filter).limit(10).lean()
      ]);

      return { result_count: count, results };
    }
  },
  {
    // $elemMatch: month, avg_rent, and transactions must all hold for the SAME array element.
    // Without $elemMatch, conditions could be satisfied across different months in the array.
    query_id: "Q5",
    mongo_query_string: `db.markettrends.find({
  monthly_data: {
    $elemMatch: {
      month: { $in: [4, 5, 6] },
      avg_rent: { $gt: 55000 },
      transactions: { $gte: 70 }
    }
  }
},
{ city: 1, area: 1, property_type: 1, monthly_data: 1 })`,
    async execute() {
      const filter = {
        monthly_data: {
          $elemMatch: {
            month: { $in: [4, 5, 6] },
            avg_rent: { $gt: 55000 },
            transactions: { $gte: 70 }
          }
        }
      };

      const [count, results] = await Promise.all([
        MarketTrend.countDocuments(filter),
        MarketTrend.find(filter, { city: 1, area: 1, property_type: 1, monthly_data: 1 })
          .limit(10)
          .lean()
      ]);

      return { result_count: count, results };
    }
  },
  {
    // $elemMatch on a string array: ensures the SAME tag element satisfies $in AND $ne,
    // which $and with separate conditions cannot guarantee on array elements.
    query_id: "Q6",
    mongo_query_string: `db.properties.find({
  tags: {
    $elemMatch: {
      $in: ["investment", "sea-view", "park-facing", "corner-unit"],
      $nin: ["resale"]
    }
  },
  type: "villa",
  status: "available",
  price: { $lt: 30000000 },
  rating: { $gte: 4 }
})`,
    async execute() {
      const filter = {
        tags: {
          $elemMatch: {
            $in: ["investment", "sea-view", "park-facing", "corner-unit"],
            $nin: ["resale"]
          }
        },
        type: "villa",
        status: "available",
        price: { $lt: 30000000 },
        rating: { $gte: 4 }
      };

      const [count, results] = await Promise.all([
        Property.countDocuments(filter),
        Property.find(filter).limit(10).lean()
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
