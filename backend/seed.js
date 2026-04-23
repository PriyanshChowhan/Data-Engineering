require("dotenv").config();

const { faker } = require("@faker-js/faker");
const mongoose = require("mongoose");
const connectDB = require("./config/db");
const Property = require("./models/Property");
const MarketTrend = require("./models/MarketTrend");
const { CITY_DATA, CITY_NAMES } = require("./data/cityData");

const PROPERTY_COUNT = 5000;
const MARKET_TREND_COUNT = 500;
const BATCH_SIZE = 500;

const PROPERTY_TYPES = ["apartment", "villa", "plot", "commercial"];
const PROPERTY_STATUSES = [
  ...Array(3500).fill("available"),
  ...Array(900).fill("under_maintenance"),
  ...Array(600).fill("sold")
];
const AMENITIES = [
  "parking",
  "gym",
  "pool",
  "security",
  "lift",
  "garden",
  "club_house",
  "power_backup",
  "cctv",
  "kids_play_area",
  "intercom",
  "rainwater_harvesting"
];
const TAGS = [
  "premium",
  "ready-to-move",
  "furnished",
  "semi-furnished",
  "new-construction",
  "resale",
  "investment",
  "corner-unit",
  "sea-view",
  "park-facing"
];
const TREND_KEYWORDS = [
  "luxury",
  "gated society",
  "investment hotspot",
  "family-friendly",
  "metro access",
  "premium",
  "furnished",
  "high demand"
];

const randomInt = (min, max) => faker.number.int({ min, max });
const sampleSize = (source, min, max) =>
  faker.helpers.arrayElements(source, randomInt(min, Math.min(max, source.length)));
const shuffle = (items) => faker.helpers.shuffle(items);
const padNumber = (value, length = 4) => String(value).padStart(length, "0");

const chunkInsert = async (model, documents) => {
  for (let index = 0; index < documents.length; index += BATCH_SIZE) {
    const batch = documents.slice(index, index + BATCH_SIZE);
    await model.insertMany(batch);
  }
};

const buildPropertyTitle = (type, area, bedrooms, areaSqft) => {
  if (type === "plot") {
    return `${areaSqft} sqft Plot in ${area}`;
  }

  if (type === "commercial") {
    return `${faker.helpers.arrayElement(["Retail", "Office", "Studio"])} Space in ${area}`;
  }

  return `${bedrooms}BHK ${type === "villa" ? "Villa" : "Apartment"} in ${area}`;
};

const buildPropertyDocument = (index, status) => {
  const city = faker.helpers.arrayElement(CITY_NAMES);
  const cityInfo = CITY_DATA[city];
  const area = faker.helpers.arrayElement(cityInfo.areas);
  const type = faker.helpers.arrayElement(PROPERTY_TYPES);
  const bedrooms =
    type === "plot" ? 0 : type === "commercial" ? randomInt(0, 2) : randomInt(1, 5);
  const areaSqft =
    type === "plot"
      ? randomInt(900, 4500)
      : type === "commercial"
        ? randomInt(500, 3500)
        : randomInt(650, 4200);
  const appreciationPercent = faker.number.float({
    min: 2,
    max: 35,
    fractionDigits: 1
  });
  const price = randomInt(1500000, 50000000);
  const renovationCost = randomInt(50000, 1000000);
  const purchasePrice = Math.max(
    1000000,
    Math.round(price / (1 + appreciationPercent / 100) - renovationCost * 0.15)
  );
  const amenityCount = randomInt(2, 6);
  const tagCount = randomInt(1, 4);

  return {
    property_id: `PROP-${padNumber(index + 1)}`,
    title: buildPropertyTitle(type, area, bedrooms || 1, areaSqft),
    type,
    status,
    location: { city, area },
    price,
    area_sqft: areaSqft,
    bedrooms,
    amenities: faker.helpers.arrayElements(AMENITIES, amenityCount),
    owner: {
      name: faker.person.fullName(),
      phone: faker.string.numeric(10),
      email: faker.internet.email().toLowerCase()
    },
    investment_details: {
      purchase_price: purchasePrice,
      renovation_cost: renovationCost,
      appreciation_percent: appreciationPercent
    },
    tags: faker.helpers.arrayElements(TAGS, tagCount),
    rating: faker.number.float({ min: 2.8, max: 5, fractionDigits: 1 }),
    created_at: faker.date.past({ years: 2 }),
    updated_at: faker.date.recent({ days: 30 })
  };
};

const buildMarketTrendDocument = (index) => {
  const city = faker.helpers.arrayElement(CITY_NAMES);
  const cityInfo = CITY_DATA[city];
  const area = faker.helpers.arrayElement(cityInfo.areas);
  const propertyType = faker.helpers.arrayElement(PROPERTY_TYPES);
  const year = faker.helpers.arrayElement([2023, 2024, 2025]);
  const monthlyData = Array.from({ length: 12 }, (_, monthIndex) => ({
    month: monthIndex + 1,
    avg_rent: randomInt(12000, 90000),
    transactions: randomInt(18, 95)
  }));

  const keywords = sampleSize(TREND_KEYWORDS, 2, 4);

  if (index % 5 === 0) {
    keywords.push("luxury", "investment hotspot");
  }

  return {
    city,
    area,
    property_type: propertyType,
    year,
    monthly_data: monthlyData,
    keywords: [...new Set(keywords)],
    avg_yield_percent: faker.number.float({ min: 2, max: 8, fractionDigits: 1 })
  };
};

async function seed() {
  await connectDB();

  try {
    await Promise.all([
      Property.deleteMany({}),
      MarketTrend.deleteMany({})
    ]);

    console.log("Seeding properties...");
    const propertyStatuses = shuffle(PROPERTY_STATUSES);
    const properties = Array.from({ length: PROPERTY_COUNT }, (_, index) =>
      buildPropertyDocument(index, propertyStatuses[index])
    );
    await chunkInsert(Property, properties);

    console.log("Seeding market trends...");
    const marketTrends = Array.from({ length: MARKET_TREND_COUNT }, (_, index) =>
      buildMarketTrendDocument(index)
    );
    await chunkInsert(MarketTrend, marketTrends);

    console.log("Done!");
  } catch (error) {
    console.error("Seeding failed:", error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
  }
}

seed();
