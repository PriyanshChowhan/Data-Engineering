require("dotenv").config();

const { faker } = require("@faker-js/faker");
const mongoose = require("mongoose");
const connectDB = require("./config/db");
const Property = require("./models/Property");
const Rental = require("./models/Rental");
const MarketTrend = require("./models/MarketTrend");
const { CITY_DATA, CITY_NAMES } = require("./data/cityData");

const PROPERTY_COUNT = 5000;
const RENTAL_COUNT = 4000;
const MARKET_TREND_COUNT = 500;
const BATCH_SIZE = 500;

const PROPERTY_TYPES = ["apartment", "villa", "plot", "commercial"];
const PROPERTY_STATUSES = [
  ...Array(2500).fill("available"),
  ...Array(1800).fill("rented"),
  ...Array(500).fill("under_maintenance"),
  ...Array(200).fill("sold")
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
const LISTED_BY = ["owner", "agent", "builder"];
const PAYMENT_MODES = ["UPI", "bank_transfer", "cash"];
const PAYMENT_STATUS_WEIGHTS = [
  { status: "late", weight: 0.3 },
  { status: "pending", weight: 0.05 },
  { status: "paid", weight: 0.65 }
];
const MAINTENANCE_STATUSES = ["open", "resolved", "pending"];
const PRIORITIES = ["low", "medium", "high"];
const MAINTENANCE_ISSUES = [
  "AC not working",
  "Water leakage in bathroom",
  "Power backup failure",
  "Lift service needed",
  "Paint peeling in living room",
  "Seepage on balcony wall",
  "Parking gate sensor issue",
  "Kitchen sink blockage"
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

const weightedPaymentStatus = () => {
  const roll = faker.number.float({ min: 0, max: 1, fractionDigits: 4 });
  let cursor = 0;

  for (const entry of PAYMENT_STATUS_WEIGHTS) {
    cursor += entry.weight;

    if (roll <= cursor) {
      return entry.status;
    }
  }

  return "paid";
};

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
  const bathrooms =
    type === "plot" ? 0 : type === "commercial" ? randomInt(1, 3) : randomInt(1, 4);
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
  const purchaseDate = faker.date.past({ years: 10 });
  const amenityCount = randomInt(2, 6);
  const tagCount = randomInt(1, 4);

  return {
    property_id: `PROP-${padNumber(index + 1)}`,
    title: buildPropertyTitle(type, area, bedrooms || 1, areaSqft),
    type,
    status,
    location: {
      city,
      state: cityInfo.state,
      pincode: String(randomInt(100001, 999999)),
      area,
      coordinates: {
        lat: Number(
          (cityInfo.coordinates.lat + faker.number.float({ min: -0.06, max: 0.06, fractionDigits: 4 })).toFixed(4)
        ),
        lng: Number(
          (cityInfo.coordinates.lng + faker.number.float({ min: -0.06, max: 0.06, fractionDigits: 4 })).toFixed(4)
        )
      }
    },
    price,
    area_sqft: areaSqft,
    bedrooms,
    bathrooms,
    amenities: faker.helpers.arrayElements(AMENITIES, amenityCount),
    owner: {
      name: faker.person.fullName(),
      phone: faker.string.numeric(10),
      email: faker.internet.email().toLowerCase()
    },
    investment_details: {
      purchase_price: purchasePrice,
      purchase_date: purchaseDate,
      renovation_cost: renovationCost,
      current_valuation: price,
      appreciation_percent: appreciationPercent,
      last_updated: faker.date.recent({ days: 45 })
    },
    tags: faker.helpers.arrayElements(TAGS, tagCount),
    rating: faker.number.float({ min: 2.8, max: 5, fractionDigits: 1 }),
    listed_by: faker.helpers.arrayElement(LISTED_BY),
    created_at: faker.date.past({ years: 2 }),
    updated_at: faker.date.recent({ days: 30 })
  };
};

const buildPaymentHistory = (rentAmount) => {
  const paymentCount = randomInt(6, 24);
  const payments = [];

  for (let paymentIndex = paymentCount - 1; paymentIndex >= 0; paymentIndex -= 1) {
    const monthDate = new Date();
    monthDate.setMonth(monthDate.getMonth() - paymentIndex);
    monthDate.setDate(5);

    const status = weightedPaymentStatus();
    const lateFee = status === "late" ? randomInt(500, 2000) : 0;
    const amountPaid =
      status === "pending"
        ? randomInt(0, Math.round(rentAmount * 0.5))
        : status === "late"
          ? rentAmount + randomInt(500, 2000)
          : rentAmount;

    payments.push({
      month: monthDate.toISOString().slice(0, 7),
      amount_paid: amountPaid,
      paid_on:
        status === "late"
          ? faker.date.between({
              from: monthDate,
              to: new Date(monthDate.getTime() + 20 * 24 * 60 * 60 * 1000)
            })
          : monthDate,
      late_fee: lateFee,
      payment_mode: faker.helpers.arrayElement(PAYMENT_MODES),
      status
    });
  }

  return payments;
};

const buildMaintenanceRequests = (rentalIndex) => {
  const requestCount = randomInt(0, 5);
  const requests = [];

  for (let index = 0; index < requestCount; index += 1) {
    const status = faker.helpers.arrayElement(MAINTENANCE_STATUSES);
    const reportedOn = faker.date.past({ years: 1 });
    const resolvedOn =
      status === "resolved"
        ? faker.date.between({ from: reportedOn, to: new Date() })
        : null;

    requests.push({
      request_id: `MR-${padNumber(rentalIndex + 1)}-${padNumber(index + 1, 3)}`,
      issue: faker.helpers.arrayElement(MAINTENANCE_ISSUES),
      reported_on: reportedOn,
      resolved_on: resolvedOn,
      cost: randomInt(500, 9000),
      status,
      priority: faker.helpers.arrayElement(PRIORITIES)
    });
  }

  return requests;
};

const buildRentalDocument = (index, propertyId, status) => {
  const rentAmount = randomInt(8000, 150000);
  const leaseStart = faker.date.past({ years: 3 });
  const leaseEnd = new Date(leaseStart);
  const now = new Date();
  leaseEnd.setMonth(leaseEnd.getMonth() + randomInt(11, 36));

  if (status === "active" && leaseEnd < now) {
    const futureEnd = new Date(now);
    futureEnd.setMonth(futureEnd.getMonth() + randomInt(1, 12));
    leaseEnd.setTime(futureEnd.getTime());
  }

  if (status !== "active" && leaseEnd > now) {
    const pastEnd = new Date(now);
    pastEnd.setMonth(pastEnd.getMonth() - randomInt(1, 12));
    leaseEnd.setTime(pastEnd.getTime());
  }

  return {
    rental_id: `RENT-${padNumber(index + 1)}`,
    property_id: propertyId,
    tenant: {
      name: faker.person.fullName(),
      contact: faker.string.numeric(10),
      email: faker.internet.email().toLowerCase(),
      id_proof: faker.helpers.arrayElement(["Aadhar", "PAN", "Passport", "Driving License"])
    },
    rent_amount: rentAmount,
    security_deposit: rentAmount * randomInt(2, 4),
    lease_start: leaseStart,
    lease_end: leaseEnd,
    status,
    payment_history: buildPaymentHistory(rentAmount),
    maintenance_requests: buildMaintenanceRequests(index),
    created_at: faker.date.past({ years: 2 })
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
    avg_price_per_sqft: randomInt(2500, 25000),
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
      Rental.deleteMany({}),
      MarketTrend.deleteMany({})
    ]);

    console.log("Seeding properties...");
    const propertyStatuses = shuffle(PROPERTY_STATUSES);
    const properties = Array.from({ length: PROPERTY_COUNT }, (_, index) =>
      buildPropertyDocument(index, propertyStatuses[index])
    );
    await chunkInsert(Property, properties);

    console.log("Seeding rentals...");
    const rentedPropertyIds = properties
      .filter((property) => property.status === "rented")
      .map((property) => property.property_id);
    const nonRentedPropertyIds = properties
      .filter((property) => property.status !== "rented")
      .map((property) => property.property_id);
    const activePropertyIds = rentedPropertyIds.slice(0, 1800);
    const expiredPropertyIds = nonRentedPropertyIds.slice(0, 1400);
    const terminatedPropertyIds = nonRentedPropertyIds.slice(1400, 2200);
    const rentalAssignments = [
      ...activePropertyIds.map((propertyId) => ({ propertyId, status: "active" })),
      ...expiredPropertyIds.map((propertyId) => ({ propertyId, status: "expired" })),
      ...terminatedPropertyIds.map((propertyId) => ({ propertyId, status: "terminated" }))
    ];
    const shuffledAssignments = shuffle(rentalAssignments).slice(0, RENTAL_COUNT);
    const rentals = shuffledAssignments.map((assignment, index) =>
      buildRentalDocument(index, assignment.propertyId, assignment.status)
    );
    await chunkInsert(Rental, rentals);

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
